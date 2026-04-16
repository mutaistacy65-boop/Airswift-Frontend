import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/layouts/MainLayout'
import ApplicationForm from '@/components/SafeApplicationForm'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function ApplicationPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [checking, setChecking] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const checkStatus = async () => {
      try {
        const res = await api.get('/users/status')
        if (res.data?.hasApplied) {
          setHasApplied(true)
          setApplication(res.data?.application || null)
        }
      } catch (err: any) {
        if (err?.response?.status === 401) {
          console.error('Unauthorized. Please login again.')
        } else {
          console.error("Status check failed:", err)
        }
      } finally {
        setChecking(false)
      }
    }

    checkStatus()
  }, [user, authLoading])

  if (authLoading || checking) {
    return <div className="text-center mt-10">Loading...</div>
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* ✅ IF ALREADY APPLIED */}
          {hasApplied ? (
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <p className="mb-3 font-semibold">
                You have already submitted your application
              </p>
              <button
                onClick={() => router.push("/job-seeker/dashboard")}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* ✅ SHOW FORM */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Application</h1>
                <p className="text-gray-600">
                  Please fill out the form below to apply for a position in our company.
                </p>
              </div>

              <ApplicationForm onSuccess={() => router.push('/job-seeker/success')} />
            </>
          )}

        </div>
      </div>
    </MainLayout>
  )
}
