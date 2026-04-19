'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { initSocket, disconnectSocket, getSocket } from '@/services/socket'
import API from '@/services/apiClient'
import { clearAuthData } from '@/utils/authUtils'
import { useNotification } from '@/context/NotificationContext'

interface User {
  id?: string
  _id?: string
  role?: string
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
  applicationStatus?: string
  permissions?: string[]
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
  login: (data: any) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')

      if (storedUser && token) {
        const parsed = JSON.parse(storedUser)
        if (parsed && typeof parsed === 'object' && parsed.email && parsed.role && (parsed.id || parsed._id)) {
          return parsed
        }
      }
    } catch (error) {
      console.warn('Failed to parse stored user:', error)
      localStorage.removeItem('user')
    }

    return null
  })
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { addNotification } = useNotification()

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await API.get('/profile')
      const fetchedUser = response.data?.user || response.data

      if (fetchedUser && fetchedUser.role) {
        setUser(fetchedUser)
        localStorage.setItem('user', JSON.stringify(fetchedUser))
      } else {
        throw new Error('Invalid user object received')
      }
    } catch (error) {
      console.warn('Unable to refresh authenticated user:', error)
      clearAuthData()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [fetchUser])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!user || !token) return

    const socketInstance = initSocket(token)
    if (!socketInstance) return

    const handleStatusUpdate = (data: any) => {
      setUser((prev) => (prev ? { ...prev, applicationStatus: data.status } : prev))
      if (data.message) {
        addNotification(data.message, 'info', 5000)
      }
    }

    const handleNotification = (data: any) => {
      console.log('📡 Global notification:', data)
      addNotification(data.message || data, data.type || 'info', data.duration || 5000)
    }

    const handleAuditLog = (log: any) => {
      console.log('📋 Audit log:', log)
      // You can add audit log handling here if needed
      if (log.action === 'LOGIN' && log.userId !== user?.id) {
        // Handle other user login events if needed
      }
    }

    const handleUserOnline = (data: any) => {
      console.log('👤 User online:', data.userId)
      // Handle online status updates
    }

    const handleUserOffline = (data: any) => {
      console.log('👤 User offline:', data.userId)
      // Handle offline status updates
    }

    socketInstance.on('status:update', handleStatusUpdate)
    socketInstance.on('notification', handleNotification)
    socketInstance.on('audit:stream', handleAuditLog)
    socketInstance.on('user:online', handleUserOnline)
    socketInstance.on('user:offline', handleUserOffline)

    return () => {
      socketInstance.off('status:update', handleStatusUpdate)
      socketInstance.off('notification', handleNotification)
      socketInstance.off('audit:stream', handleAuditLog)
      socketInstance.off('user:online', handleUserOnline)
      socketInstance.off('user:offline', handleUserOffline)
    }
  }, [user, addNotification])

  useEffect(() => {
    const userId = user?.id || user?._id
    if (!userId) return

    const currentSocket = getSocket()
    if (!currentSocket) return

    const joinRooms = () => {
      currentSocket.emit('join_user', userId)
      if (user?.role?.toLowerCase() === 'admin') {
        currentSocket.emit('join_admin')
      }
    }

    if (currentSocket.connected) {
      joinRooms()
    } else {
      currentSocket.once('connect', joinRooms)
    }
  }, [user])

  const login = async (data: any) => {
    clearAuthData()

    if (!data.token) {
      console.error('❌ Login failed: No token in response')
      throw new Error('Login failed: No token received')
    }

    localStorage.setItem('token', data.token)

    const roleEmoji = {
      admin: '👑',
      recruiter: '💼',
      user: '👤',
    }[data.user?.role] || '✅'

    toast.success(`Welcome back, ${data.user?.name || 'User'}!`, {
      icon: roleEmoji,
      duration: 4000,
    })
  }

  const logout = () => {
    const userName = user?.name || 'User'
    setUser(null)
    setProfile(null)
    disconnectSocket()
    clearAuthData()

    toast.success(`Goodbye, ${userName}! See you soon 👋`, {
      duration: 3000,
    })

    router.replace('/login')
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  if (!mounted) return null

  const isAuthenticated = !!user && !isLoading

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
