'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import API from '@/lib/api'
import { useRouter } from 'next/router'

interface User {
  id?: string
  _id?: string
  role: string
  email?: string
  name?: string
  isVerified?: boolean
  phone?: string
  bio?: string
  skills?: string[]
  experience?: string
  education?: string
  location?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: any) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('token')
        
        if (storedUser && storedToken) {
          const parsed = JSON.parse(storedUser)
          // Basic validation - just check if it's a valid object
          if (parsed && typeof parsed === 'object') {
            return parsed
          } else {
            // Invalid user data, clean up
            localStorage.removeItem('user')
          }
        }
      } catch (e) {
        console.warn('Failed to parse user from localStorage:', e)
        localStorage.removeItem('user')
      }
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(!user) // Only loading if no user in localStorage
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Don't fetch user data on mount - rely on localStorage initialization
    // The user data is stored in localStorage during login
    if (mounted) {
      setIsLoading(false)
    }
  }, [mounted])

  const login = (data: any) => {
    setUser(data.user)
  }

  const logout = () => {
    setUser(null)
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }
    router.push('/login')
  }

  if (!mounted) return null

  // ✅ IMPORTANT: Always return JSX
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}