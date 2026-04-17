import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/layouts/MainLayout'
import ApplicationForm from '@/components/SafeApplicationForm'
import API from '@/services/apiClient'
import { useAuth } from '@/context/AuthContext'
import { getStoredUser } from '@/utils/authUtils'
import Loader from '@/components/Loader'

export default function ApplicationPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [checking, setChecking] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)
  const [application, setApplication] = useState<any>(null)

  // 🔒 Route Protection Guard - Redirect if user has already submitted application
  // IMPORTANT: Check both AuthContext and localStorage to prevent redirect loops
  useEffect(() => {
    const checkAndRedirect = () => {
      console.log("🔒 Apply page guard checking...");
      
      // First check localStorage for immediate response
      const storedUser = getStoredUser();
      
      if (storedUser?.hasSubmittedApplication) {
        console.log("🔄 User has submitted application, redirecting to /dashboard");
        router.push("/dashboard");
        return;
      }

      // Also check AuthContext if user exists
      if (user?.hasSubmittedApplication) {
        console.log("🔄 AuthContext shows submitted application, redirecting to /dashboard");
        router.push("/dashboard");
        return;
      }

      setChecking(false);
    };

    // Wait for auth to load, then check
    if (!authLoading) {
      checkAndRedirect();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      console.log("🔄 Redirecting to:", "/login");
      router.push('/login')
      return
    }

    const checkStatus = async () => {
      try {
        // FORCE attach token for debug
        const token = localStorage.getItem('token');
        const res = await API.get('/users/status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
