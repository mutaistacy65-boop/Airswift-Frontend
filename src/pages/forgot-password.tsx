import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/layouts/MainLayout'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { useNotification } from '@/context/NotificationContext'
import { authService } from '@/services/authService'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      addNotification('Please enter your email address.', 'warning')
      return
    }

    setLoading(true)

    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
      addNotification('Password reset instructions sent to your email.', 'success')
    } catch (err: any) {
      console.error(err)
      addNotification(err?.response?.data?.message || 'Unable to submit request. Please try again later.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Forgot Your Password?</h1>
              <p className="text-gray-600 mt-2">
                Enter the email address associated with your account, and we’ll send you instructions to reset your password.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Check your mailbox</h2>
                <p>Please follow the link in the email we just sent to reset your password.</p>
                <p className="mt-3 text-sm text-gray-600">
                  If you don’t receive the email within a few minutes, check your spam folder or try again.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-105"
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  loading={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Remembered your password?{' '}
                <Link href="/login" className="text-red-600 font-semibold hover:text-red-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default ForgotPassword
