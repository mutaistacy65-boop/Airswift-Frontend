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
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from token on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      const role = localStorage.getItem('role')

      // Only restore user if both token AND user data exist
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (e) {
          // Invalid stored user, clear everything
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('role')
          setUser(null)
        }
      } else {
        // No valid token+user combo, ensure clean state
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        setUser(null)
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await loginUser({ email, password })

      if (data?.redirect === '/verify-otp') {
        router.push(`/verify-otp?email=${data.email}`)
        return
      }

      const authToken = data.accessToken || data.token
      const currentUser = data.user

      if (!authToken || !currentUser) {
        throw new Error('Login failed')
      }

      // Save all authentication data
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(currentUser))
      localStorage.setItem('role', currentUser.role)
      
      // Update auth context state
      setUser(currentUser)

      // Redirect based on role
      if (currentUser.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
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
      
      // Check if email already exists but is not verified
      const errorCode = (error as any)?.code || (error as any)?.data?.code
      const errorMessage = error?.message || 'Registration failed'
      
      // If email exists but not verified, send OTP and redirect to verification
      if (
        errorCode === 'EMAIL_EXISTS_UNVERIFIED' ||
        errorCode === 'EMAIL_UNVERIFIED' ||
        errorMessage.toLowerCase().includes('email already exists') ||
        errorMessage.toLowerCase().includes('not verified')
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
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