'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { initSocket, reconnectSocket, disconnectSocket, getSocket } from '@/services/socket'
import API from '@/services/apiClient'

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
  hasSubmittedApplication?: boolean
}

interface Profile {
  name?: string
  phone?: string
  location?: string
  skills?: string
  experience?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
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
        const storedToken = localStorage.getItem('token')
        
        if (storedUser && storedToken) {
          const parsed = JSON.parse(storedUser)
          // Validate that it has required fields for authentication
          if (parsed && typeof parsed === 'object' && parsed.email && parsed.role && (parsed.id || parsed._id)) {
            return parsed
          } else {
            // Invalid user data, clean up
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('permissions')
          }
        }
      } catch (e) {
        console.warn('Failed to parse user from localStorage:', e)
        localStorage.removeItem('user')
      }
    }
    return null
  })
  const [profile, setProfile] = useState<Profile | null>(null)
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

  useEffect(() => {
    const userId = user?.id || user?._id
    if (!userId) return

    // 🔒 Get socket - only available after login
    const currentSocket = getSocket()
    if (!currentSocket) return

    if (currentSocket.connected) {
      currentSocket.emit('join_user', userId)
      if (user?.role === 'admin') {
        currentSocket.emit('join_admin')
      }
    } else {
      currentSocket.once('connect', () => {
        currentSocket.emit('join_user', userId)
        if (user?.role === 'admin') {
          currentSocket.emit('join_admin')
        }
      })
    }
  }, [user])

  const login = async (data: any) => {
    // 🔒 Step 1: Validate token exists
    if (!data.token) {
      console.error('❌ Login failed: No token in response')
      throw new Error('Login failed: No token received')
    }

    // 🔒 Step 2: Store token in localStorage FIRST
    localStorage.setItem('token', data.token)
    console.log('✅ Token saved to localStorage')

    // 🔒 Step 3: Store user data
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)

    // 🔒 Step 4: Initialize socket with token
    const socketInstance = initSocket(data.token)
    if (!socketInstance) {
      console.warn('⚠️ Socket initialization failed, continuing without real-time updates')
    } else {
      console.log('✅ Socket initialized after login')
    }

    // � Toast notification
    const roleEmoji = {
      admin: '👑',
      recruiter: '💼',
      user: '👤',
    }[data.user.role] || '✅'

    toast.success(`Welcome back, ${data.user.name || 'User'}!`, {
      icon: roleEmoji,
      duration: 4000,
    })

    // 🔥 Fetch profile after login
    try {
      const res = await API.get('/profile')
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch profile after login:', err)
    }
  }

  const logout = () => {
    const userName = user?.name || 'User'
    setUser(null)
    setProfile(null)
    
    // 🔌 Disconnect socket
    disconnectSocket()

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      localStorage.removeItem('permissions')
    }

    // 🟤 Toast notification
    toast.success(`Goodbye, ${userName}! See you soon 👋`, {
      duration: 3000,
    })

    router.push('/login')
  }

  if (!mounted) return null

  // ✅ IMPORTANT: Always return JSX
  // Calculate authenticated state based on valid user data
  const isAuthenticated = !!user && !!user.email && !!user.role && !isLoading

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}