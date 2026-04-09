import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/layouts/MainLayout'
import ApplicationForm from '@/components/ApplicationForm'
import API from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function ApplicationPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading || !user) return

    const check = async () => {
      try {
        const res = await API.get('/api/user/status')

        if (res.data.hasApplied) {
          router.push('/dashboard')
        }
      } catch (err) {
        router.push('/login')
      }
    }

    check()
  }, [authLoading, user, router])

  if (authLoading) return null
  if (!user) {
    router.push('/login')
    return null
  }

  const handleApplicationSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Application</h1>
            <p className="text-gray-600">
              Please fill out the form below to apply for a position in our company.
            </p>
          </div>

          <ApplicationForm onSuccess={handleApplicationSuccess} />
        </div>
      </div>
    </MainLayout>
  )
}
