'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { loginUser, registerUser, refreshToken } from '@/api/auth'
import AuthService from '@/services/authService'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'  // Backend uses 'user', frontend maps to 'job_seeker'
  profileImage?: string
  jobTitle?: string
  bio?: string
  phone?: string
  skills?: string[]
  experience?: string
  education?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setUser: (user: User | null) => void
  googleLogin: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in by making a request to /me endpoint
    verifyAuthStatus()
  }, [])

  const verifyAuthStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Auth verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await AuthService.login(email, password)

      // Set user in context
      setUser(data.user)

      // Redirect based on role
      router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard')
    } catch (error: any) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      const data = await registerUser(userData)

      // After successful registration, verify auth status to get user data
      await verifyAuthStatus()
      router.push(data.user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard')
    } catch (error: any) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
    setUser(null)
    router.push('/login')
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const googleLogin = async () => {
    try {
      const { signIn } = await import('next-auth/react')
      await signIn('google', { redirect: true, callbackUrl: '/job-seeker/dashboard' })
    } catch (error) {
      console.error('Google sign-in failed:', error)
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser, setUser, googleLogin }}>
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