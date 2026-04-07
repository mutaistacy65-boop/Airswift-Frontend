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

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          setUser(token ? { token } : null)
        }
      } else if (token) {
        setUser({ token })
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

      localStorage.setItem('token', authToken)
      localStorage.setItem('role', currentUser.role)

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
      const data = await registerUser(userData)

      // After successful registration, redirect to OTP verification
      router.push(`/verify-otp?email=${userData.email}`)
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error?.message || 'Registration failed'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
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