import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import api from '@/lib/api'

export default function VerifyEmail() {
  const router = useRouter()
  const { token } = router.query
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await api.get(`/auth/verify?token=${token}`)
        const data = result.data

        // Auto-login: Store both tokens and user data
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))

        setVerificationStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (error: any) {
        console.error('Verification error:', error)
        setVerificationStatus('error')
        setMessage(error.response?.data?.message || 'Failed to verify email')
      }
    }

    verifyEmail()
  }, [token, router])

  const handleResendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setIsResending(true)
    try {
      const result = await api.post('/auth/resend-verification', {
        email
      })

      const data = result.data

      alert(data.message || 'Verification email sent! Check your inbox.')
      setEmail('')
    } catch (error: any) {
      console.error('Resend error:', error)
      alert(error.response?.data?.message || 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Head>
          <title>Email Verification</title>
        </Head>
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Request</h1>
            <p className="text-gray-600 mb-6">No verification token found in the link.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Go back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Head>
        <title>Email Verification - Airswift</title>
      </Head>
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-center">
          {verificationStatus === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="text-5xl">✓</div>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verified</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
              <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
                Go to dashboard
              </Link>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="text-5xl">✕</div>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Your verification link may have expired. Request a new one:
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>

              <div className="space-y-2">
                <p>
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Go to login
                  </Link>
                </p>
                <p>
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    Contact support
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
