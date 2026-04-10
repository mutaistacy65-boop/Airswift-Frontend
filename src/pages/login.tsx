import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import API from '@/services/apiClient'
import Button from '../components/Button'
import { loginUser } from '@/api/auth'
import ContinueDraftModal from '@/components/ContinueDraftModal'
import { useAuth } from '@/context/AuthContext'

/**
 * 🍪 IMPORTANT: Backend Cookie Requirements
 * 
 * After successful login, the backend MUST set an httpOnly cookie:
 * 
 * res.cookie('accessToken', token, {
 *   httpOnly: true,
 *   secure: true,      // on HTTPS
 *   sameSite: "none",  // for cross-origin
 * });
 * 
 * The frontend will:
 * 1. Store token in localStorage (Client-side)
 * 2. Browser automatically sends httpOnly cookie (Server-side)
 * 3. API calls include both for maximum security
 * 
 * See COOKIE_CONFIGURATION.md
 */

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [draftInfo, setDraftInfo] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate form
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      const response = await loginUser(form)
      console.log('LOGIN RESPONSE:', response)

      if (response?.redirect === '/verify-otp') {
        const email = response.email || form.email
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=login`)
        return
      }

      const { token, accessToken, user, message } = response as any
      const jwt = token || accessToken

      if (!jwt || !user) {
        throw new Error(message || 'Login failed')
      }

      localStorage.setItem('token', jwt)
      localStorage.setItem('accessToken', jwt)
      localStorage.setItem('user', JSON.stringify(user))
      if (user.role) {
        localStorage.setItem('role', user.role)
      }

      // Update AuthContext immediately
      login({ user })

      // Check for drafts
      try {
        const draftRes = await API.get('/drafts/check')
        if (draftRes.data.hasDraft) {
          setDraftInfo(draftRes.data)
          setShowModal(true)
          return
        }
      } catch (err) {
        console.warn('Draft check failed — ignoring')
      }

      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (!user.has_submitted) {
        router.push('/apply')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString?.() || 'Login failed'
      setError(errorMessage)
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary-light p-12 flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8">
            <div className="text-6xl mb-4">💼</div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-lg opacity-90 mb-8">
            Continue your journey to find the perfect job opportunity with TALEX
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure Login
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Fast Access
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">TALEX</h1>
            <p className="text-gray-600 mt-2">Your Career Journey Starts Here</p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Access your account to continue</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary hover:text-secondary transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-secondary transition-colors">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ContinueDraftModal
        open={showModal}
        onContinue={() => {
          setShowModal(false)
          router.push('/apply')
        }}
        onStartFresh={async () => {
          try {
            await API.delete('/drafts')
          } catch (error) {
            console.log('Draft deletion skipped:', error)
          }
          localStorage.removeItem('draft')
          setShowModal(false)
          router.push('/apply')
        }}
        lastSaved={draftInfo?.updated_at}
      />
    </div>
  )
}

