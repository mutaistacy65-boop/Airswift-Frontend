import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { api } from '@/utils/api'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetStatus, setResetStatus] = useState<'loading' | 'form' | 'success' | 'error'>('form')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (token) {
      setResetStatus('form')
    }
  }, [token])

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setMessage('Please enter both password fields')
      return false
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long')
      return false
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return false
    }

    return true
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!token) {
      setMessage('Reset token is missing')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await api.post('/auth/reset-password', {
        token,
        password,
      })

      const data = result.data

      setResetStatus('success')
      setMessage(data.message || 'Password reset successfully!')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Reset error:', error)
      setResetStatus('error')
      setMessage(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Head>
          <title>Reset Password</title>
        </Head>
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Request</h1>
            <p className="text-gray-600 mb-6">No reset token found in the link.</p>
            <p className="text-gray-600 mb-6">
              Use the password reset link provided in your email.
            </p>
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Head>
        <title>Reset Password - Airswift</title>
      </Head>
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-center">
          {resetStatus === 'form' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600 mb-6">Enter your new password below</p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isSubmitting}
                  />
                </div>

                {message && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-600">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p className="text-sm text-gray-600 mt-6">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Go to login
                </Link>
              </p>
            </>
          )}

          {resetStatus === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="text-5xl">✓</div>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">Password Reset</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
              <Link href="/login" className="text-blue-600 hover:underline mt-4 inline-block">
                Go to login
              </Link>
            </>
          )}

          {resetStatus === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="text-5xl">✕</div>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Reset Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setResetStatus('form')
                    setMessage('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <Link href="/forgot-password" className="block text-blue-600 hover:underline">
                  Request a new reset link
                </Link>
                <Link href="/login" className="block text-blue-600 hover:underline">
                  Go to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
