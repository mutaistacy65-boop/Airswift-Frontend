'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { loginUser, registerUser } from '@/api/auth'

interface User {
  id?: string
  email?: string
  name?: string
  role?: 'user' | 'admin'
  phone?: string
  profileImage?: string
  jobTitle?: string
  bio?: string
  skills?: string[]
  experience?: string
  education?: string
  location?: string
  token?: string
  isVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
          try {
            // If this is a mock token (starts with 'mock-'), skip /me endpoint
            // and just use the stored user data
            if (token.startsWith('mock-')) {
              try {
                const user = JSON.parse(storedUser)
                setUser(user)
                setIsLoading(false)
                return
              } catch (parseError) {
                console.error('Failed to parse stored user data:', parseError)
              }
            }

            // ✅ FIXED: Properly handle /me endpoint
            // If backend returns null user → frontend clears auth state
            // If backend returns user → frontend updates state
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              method: 'GET'
            })

            if (response.ok) {
              const data = await response.json()
              if (data.user) {
                setUser(data.user)
                localStorage.setItem('user', JSON.stringify(data.user))
                localStorage.setItem('role', data.user.role)
              } else {
                // Backend returned null user, clear local state
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('role')
                setUser(null)
              }
            } else {
              // Token invalid or expired, clear local state
              localStorage.removeItem('accessToken')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('role')
              setUser(null)
            }
          } catch (error) {
            console.error('Auth check failed:', error)
            // On network error, keep existing user state but mark as potentially stale
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser))
              } catch {
                localStorage.removeItem('user')
                setUser(null)
              }
            }
          }
        } else {
          // No token, ensure clean state
          localStorage.removeItem('accessToken')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('role')
          setUser(null)
        }
      }

      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await loginUser({ email, password })

      if (data?.redirect === '/verify-otp') {
        // Send verification OTP for unverified account
        try {
          const response = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email })
          })

          const otpResponse = await response.json()

          if (!response.ok) {
            console.warn('Failed to send verification OTP:', otpResponse)
            // Continue with redirect anyway
          }
        } catch (otpError) {
          console.warn('Error sending verification OTP:', otpError)
          // Continue with redirect anyway
        }

        router.push(`/verify-otp?email=${data.email}&type=verification`)
        return
      }

      const authToken = data.accessToken || data.token
      const currentUser = data.user

      if (!authToken || !currentUser) {
        throw new Error('Login failed')
      }

      // Save all authentication data
      localStorage.setItem('accessToken', authToken)
      localStorage.setItem('user', JSON.stringify(currentUser))
      localStorage.setItem('role', currentUser.role)
      
      // Update auth context state
      setUser(currentUser)

      // Redirect based on role and application status
      if (currentUser.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        // Check user status via API
        try {
          const statusRes = await fetch('/api/user/status', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
          const statusData = await statusRes.json()
          
          if (!statusData.hasApplied) {
            router.push('/apply')
          } else {
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error checking user status:', error)
          // Fallback to dashboard if status check fails
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      throw new Error(error?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      // Step 1: Try to register the user
      const data = await registerUser(userData)

      // Step 2: Mark this as a registration verification flow
      if (typeof window !== 'undefined') {
        localStorage.setItem('verifyType', 'registration')
      }

      // Step 3: Send OTP code to the email
      try {
        const response = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/send-registration-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email })
        })

        const otpResponse = await response.json()

        if (!response.ok) {
          console.warn('Failed to send OTP, but registration succeeded:', otpResponse)
          // Continue with OTP verification anyway
        }
      } catch (otpError) {
        console.warn('Error sending OTP, but registration succeeded:', otpError)
        // Continue with OTP verification anyway
      }

      // Step 4: Redirect to OTP verification page with registration type
      router.push(`/verify-otp?email=${userData.email}&type=registration`)
    } catch (error: any) {
      console.error('Registration error:', error)
      console.log('Error details:', {
        message: error?.message,
        code: (error as any)?.code,
        status: (error as any)?.status,
        data: (error as any)?.data
      })
      
      // Check if email already exists but is not verified
      const errorCode = (error as any)?.code || (error as any)?.data?.code
      const errorMessage = error?.message || 'Registration failed'
      
      // If email exists but not verified, send OTP and redirect to verification
      if (
        errorCode === 'EMAIL_EXISTS_UNVERIFIED' ||
        errorCode === 'EMAIL_UNVERIFIED' ||
        errorCode === 'USER_EXISTS' ||
        errorCode === 'USER_ALREADY_EXISTS' ||
        (error as any)?.status === 409 || // Conflict status for existing user
        (error as any)?.status === 400 || // Bad request for existing user
        errorMessage.toLowerCase().includes('user already exists') ||
        errorMessage.toLowerCase().includes('email already exists') ||
        errorMessage.toLowerCase().includes('not verified') ||
        errorMessage.toLowerCase().includes('already registered') ||
        errorMessage === 'User already exists' // Exact match for the error shown
      ) {
        console.log('Email exists but not verified, sending OTP...')
        
        // Mark as registration verification flow
        if (typeof window !== 'undefined') {
          localStorage.setItem('verifyType', 'registration')
        }

        // Send OTP to the email
        try {
          const response = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/send-registration-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userData.email })
          })

          const otpResponse = await response.json()

          if (!response.ok) {
            console.warn('Failed to send OTP:', otpResponse)
          }
        } catch (otpError) {
          console.warn('Error sending OTP:', otpError)
        }

        // Redirect to OTP verification page
        router.push(`/verify-otp?email=${userData.email}&type=registration`)
        setIsLoading(false)
        return
      }

      // For other errors, throw the error
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Reset state
    setUser(null)
    
    // Redirect to home
    router.push('/')
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const refreshUser = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')

      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUser(data.user)
              localStorage.setItem('user', JSON.stringify(data.user))
              localStorage.setItem('role', data.user.role)
            } else {
              // Backend returned null, user is logged out
              logout()
            }
          } else {
            // Token invalid, logout user
            logout()
          }
        } catch (error) {
          console.error('Failed to refresh user:', error)
          // Don't logout on network errors, just log
        }
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}