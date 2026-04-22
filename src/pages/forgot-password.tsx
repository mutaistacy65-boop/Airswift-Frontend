import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import API from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form')
  const [message, setMessage] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address')
      return
    }

    setResetStatus('loading')
    setMessage('')

    try {
      const result = await API.post('/auth/forgot-password', {
        email
      })

      const data = result.data

      setResetStatus('success')
      setMessage(data.message || 'Password reset link sent to your email!')
      setEmail('')
    } catch (error: any) {
      console.error('Forgot password error:', error)
      setResetStatus('error')
      setMessage(error.response?.data?.message || 'Failed to send password reset email')
    }
  }

  const handleReset = () => {
    setResetStatus('form')
    setMessage('')
    setEmail('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Head>
        <title>Forgot Password - Airswift</title>
      </Head>
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-center">
          {resetStatus === 'form' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {message && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-600">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Reset Link
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

          {resetStatus === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Sending Reset Link</h1>
              <p className="text-gray-600">Please wait while we process your request...</p>
            </>
          )}

          {resetStatus === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="text-5xl">✓</div>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">Check Your Email</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-6">
                The email may take a few minutes to arrive. Don't forget to check your spam folder.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> Password reset links expire after 1 hour. Make sure to use it
                  promptly.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                Send Another Email
              </button>

              <Link href="/login" className="block text-blue-600 hover:underline">
                Back to login
              </Link>
            </>
          )}

          {resetStatus === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="text-5xl">✕</div>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Something Went Wrong</h1>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={handleReset}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <Link href="/login" className="block text-blue-600 hover:underline">
                  Go to login
                </Link>
                <Link href="/contact" className="block text-blue-600 hover:underline">
                  Contact support
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
