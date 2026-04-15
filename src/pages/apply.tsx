import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/layouts/MainLayout'
import ApplicationForm from '@/components/SafeApplicationForm'
import API from '@/services/apiClient'
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
        const res = await API.get('/users/status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (res.data?.hasApplied) {
          setHasApplied(true)
          setApplication(res.data?.application || null)
        }
      } catch (err) {
        console.error("Status check failed:", err)
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
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                ✅ Application Already Submitted
              </h2>

              <p className="text-gray-600 mb-2">
                You have already submitted your application.
              </p>

              {application?.status && (
                <p className="text-gray-600 mb-6">
                  Status: <span className={`font-semibold ${
                    application.status === 'accepted'
                      ? 'text-green-600'
                      : application.status === 'rejected'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </p>
              )}

              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
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

              <ApplicationForm onSuccess={() => router.push('/dashboard')} />
            </>
          )}

        </div>
      </div>
    </MainLayout>
  )
}
