'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

interface User {
  id: string
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me', {
          withCredentials: true,
        })

        if (res.data.user) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      fetchUser()
    }
  }, [mounted])

  const login = (data: any) => {
    setUser(data.user)
  }

  const logout = () => {
    setUser(null)
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