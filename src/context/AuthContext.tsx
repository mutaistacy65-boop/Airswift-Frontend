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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    if (token) {
      setUser({ token })
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (data.token) {
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        setUser({ ...data.user, token: data.token })

        // Redirect based on role
        const redirectPath = data.user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'
        router.push(redirectPath)
      } else {
        throw new Error(data.message || data.error || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error?.message || 'Login failed'
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      const data = await registerUser(userData)

      if (data.token) {
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        setUser({ ...data.user, token: data.token })
        
        // Redirect to dashboard or verification page
        const redirectPath = data.user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'
        router.push(redirectPath)
      } else {
        throw new Error(data.message || data.error || 'Registration failed')
      }
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