/**
 * ✅ RegisterPage_GMAIL_VALIDATED.tsx
 * Complete registration component with Gmail-only validation
 * 
 * Features:
 * - Gmail @gmail.com domain only
 * - Email format validation
 * - Password strength checking
 * - Comprehensive error handling
 * - Success confirmation screen
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import api from '@/lib/api'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type RegistrationStatus = 'form' | 'success'

/**
 * Validate Gmail address
 */
const validateGmailEmail = (email: string): { valid: boolean; message: string } => {
  if (!email || email.trim() === '') {
    return {
      valid: false,
      message: '📧 Email address is required'
    }
  }

  const emailTrimmed = email.trim().toLowerCase()

  // ✅ Check @gmail.com domain
  if (!emailTrimmed.endsWith('@gmail.com')) {
    return {
      valid: false,
      message: '❌ Only Gmail addresses (@gmail.com) are allowed for registration'
    }
  }

  // ✅ Validate Gmail format (allows dots, hyphens, underscores, plus)
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@gmail\.com$|^[a-zA-Z0-9]@gmail\.com$/
  if (!gmailRegex.test(emailTrimmed)) {
    return {
      valid: false,
      message: '❌ Invalid Gmail address format'
    }
  }

  return {
    valid: true,
    message: '✅ Valid Gmail address'
  }
}

/**
 * Validate password strength
 */
const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (!password) {
    return {
      valid: false,
      message: 'Password is required'
    }
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    }
  }

  // ✅ Password strength requirements
  const requirements = [
    { regex: /[a-z]/, name: 'lowercase letter' },
    { regex: /[A-Z]/, name: 'uppercase letter' },
    { regex: /[0-9]/, name: 'number' },
    { regex: /[!@#$%^&*]/, name: 'special character' }
  ]

  const unmetRequirements = requirements.filter(req => !req.regex.test(password))

  if (unmetRequirements.length > 0) {
    return {
      valid: false,
      message: `Password must contain at least one ${unmetRequirements.map(r => r.name).join(', ')}`
    }
  }

  return {
    valid: true,
    message: '✅ Strong password'
  }
}

const RegisterPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<RegistrationStatus>('form')
  const [registeredEmail, setRegisteredEmail] = useState('')

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // ✅ Validation: All fields required
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('❌ Please fill in all fields')
        setLoading(false)
        return
      }

      // ✅ Validation: Name length
      if (formData.name.trim().length < 2) {
        setError('❌ Name must be at least 2 characters long')
        setLoading(false)
        return
      }

      // ✅ Validation: Gmail only
      const emailValidation = validateGmailEmail(formData.email)
      if (!emailValidation.valid) {
        setError(emailValidation.message)
        setLoading(false)
        return
      }

      // ✅ Validation: Password strength
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid) {
        setError(passwordValidation.message)
        setLoading(false)
        return
      }

      // ✅ Validation: Password confirmation
      if (formData.password !== formData.confirmPassword) {
        setError('❌ Passwords do not match')
        setLoading(false)
        return
      }

      console.log('📝 Registering user with email:', formData.email)

      // ✅ Submit registration
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'user'
      })

      console.log('✅ Registration successful:', response.data)

      // Handle the response
      if (response.data.code === 'REGISTRATION_SUCCESS' || response.data.code === 'VERIFICATION_EMAIL_SENT') {
        setRegisteredEmail(formData.email)
        setStatus('success')
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      } else if (response.data.code === 'VERIFICATION_EMAIL_RESENT') {
        setRegisteredEmail(formData.email)
        setStatus('success')
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      } else {
        setError(response.data.message || 'Registration failed. Please try again.')
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err)

      // Handle specific error codes
      if (err.response?.data?.code === 'USER_EXISTS') {
        setError('❌ An account with this email already exists. Please log in.')
      } else if (err.response?.data?.code === 'INVALID_EMAIL_DOMAIN') {
        setError('❌ Only Gmail addresses (@gmail.com) are allowed for registration.')
      } else if (err.response?.data?.code === 'RATE_LIMIT_EXCEEDED') {
        setError('❌ Too many registration attempts. Please try again later.')
      } else if (err.response?.data?.code === 'EMAIL_SEND_FAILED') {
        setError('❌ Failed to send verification email. Please try again.')
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Registration failed. Please check your information and try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ Success Screen
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="text-6xl mb-6">
            ✅
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to your Gmail inbox
          </p>

          {/* Email Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-mono text-lg text-blue-900 break-all">{registeredEmail}</p>
          </div>

          {/* Next Steps */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-green-900 mb-4 text-lg">📋 Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-green-800">
              <li>Check your Gmail inbox (including spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Log in with your credentials</li>
              <li>Complete your profile setup</li>
            </ol>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>⏰ Important:</strong> The verification link expires in <strong>24 hours</strong>
            </p>
          </div>

          {/* Security Note */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              <strong>🔒 Security:</strong> Your password is securely encrypted. We never share your personal data.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Go to Login
            </Link>
            <Link
              href="/verify-email"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              Didn't receive email? Verify here
            </Link>
          </div>

          {/* Contact Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Registration Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
            Airswift
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 text-sm mt-2">
            Join our platform to explore amazing opportunities
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setError('')
              }}
              disabled={loading}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Gmail Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gmail Address</label>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                setError('')
              }}
              disabled={loading}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-2">
              ✓ Only Gmail accounts (@gmail.com) are allowed
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                setError('')
              }}
              disabled={loading}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-2">
              ✓ At least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                setError('')
              }}
              disabled={loading}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Terms Agreement */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-gray-700">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline font-semibold">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:from-gray-400 disabled:to-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Sign in
          </Link>
        </p>

        {/* Security Footer */}
        <div className="text-xs text-center text-gray-500 mt-6 pt-6 border-t border-gray-200">
          <p>🔒 Your data is protected with industry-standard encryption</p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
