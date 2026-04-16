/**
 * Socket.IO Integration Guide
 * 
 * This shows how to properly initialize and use socket.io with authentication
 */

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { socket } from '@/services/socket'
import { useAuth } from '@/context/AuthContext'

/**
 * 🔌 Initialize Socket Connection with Login
 * 
 * Call this in your AuthContext or after login
 */
export const initializeSocketConnection = (token: string) => {
  if (!token) {
    console.error('❌ Cannot initialize socket: no token')
    return
  }

  console.log('🔌 Initializing socket connection with token')
  
  // Token is already set in localStorage by login
  // Socket will pick it up automatically
  if (socket) {
    socket.auth = { token }
    socket.connect()
  }
}

/**
 * 🔔 Admin Real-Time Event Listeners with Notifications
 */
export const useAdminSocketNotifications = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'admin' || !socket?.connected) return

    console.log('📡 Setting up admin socket notifications...')

    // New application notification
    const handleNewApplication = (data: any) => {
      console.log('📩 New application:', data)
      toast.success(`New application from ${data.user?.name || 'candidate'}`, {
        icon: '📩',
        duration: 5000,
      })
    }

    // Job status update notification
    const handleJobUpdated = (job: any) => {
      console.log('🔄 Job updated:', job)
      toast.success(`Job "${job.title}" status updated to ${job.status}`, {
        icon: '✏️',
      })
    }

    // Application status change notification
    const handleApplicationStatusChanged = (app: any) => {
      const statusEmoji = {
        accepted: '✅',
        rejected: '❌',
        shortlisted: '🟡',
        pending: '⏳',
      }[app.status] || '📝'

      toast.success(
        `Application from ${app.user?.name} - ${app.status.toUpperCase()}`,
        { icon: statusEmoji, duration: 4000 }
      )
    }

    // Register listeners
    socket.on('admin:new-application', handleNewApplication)
    socket.on('job:updated', handleJobUpdated)
    socket.on('application:status', handleApplicationStatusChanged)

    // Cleanup
    return () => {
      socket.off('admin:new-application', handleNewApplication)
      socket.off('job:updated', handleJobUpdated)
      socket.off('application:status', handleApplicationStatusChanged)
    }
  }, [user])
}

/**
 * 👤 User Real-Time Event Listeners with Notifications
 */
export const useUserSocketNotifications = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'user' || !socket?.connected) return

    console.log('📡 Setting up user socket notifications...')

    // Application status update
    const handleApplicationStatusChange = (app: any) => {
      const statusMessages = {
        accepted: { text: 'Your application was ACCEPTED! 🎉', icon: '✅' },
        rejected: { text: 'Application status: Rejected', icon: '❌' },
        shortlisted: { text: 'You have been shortlisted! 🟡', icon: '🔔' },
        under_review: { text: 'Your application is under review ⏳', icon: '📝' },
      }

      const message = statusMessages[app.status as keyof typeof statusMessages]
      if (message) {
        toast.success(message.text, {
          icon: message.icon,
          duration: 6000,
        })
      }
    }

    // Interview scheduled notification
    const handleInterviewScheduled = (data: any) => {
      toast.success(
        `Interview scheduled for ${new Date(data.date).toLocaleDateString()}`,
        {
          icon: '📅',
          duration: 6000,
        }
      )
    }

    // New message notification
    const handleNewMessage = (message: any) => {
      toast.success(`New message from ${message.sender?.name || 'Recruiter'}`, {
        icon: '💬',
        duration: 5000,
      })
    }

    // Register listeners
    socket.on('user:application-status', handleApplicationStatusChange)
    socket.on('user:interview-scheduled', handleInterviewScheduled)
    socket.on('user:message-received', handleNewMessage)

    // Cleanup
    return () => {
      socket.off('user:application-status', handleApplicationStatusChange)
      socket.off('user:interview-scheduled', handleInterviewScheduled)
      socket.off('user:message-received', handleNewMessage)
    }
  }, [user])
}

/**
 * 💼 Recruiter Real-Time Event Listeners with Notifications
 */
export const useRecruiterSocketNotifications = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'recruiter' || !socket?.connected) return

    console.log('📡 Setting up recruiter socket notifications...')

    // New candidate application
    const handleCandidateApplication = (data: any) => {
      toast.success(`New candidate applied: ${data.candidate?.name}`, {
        icon: '👤',
        duration: 5000,
      })
    }

    // Job stats updated
    const handleJobStats = (stats: any) => {
      toast.success(
        `Job "${stats.jobTitle}" - ${stats.applications} new applications`,
        {
          icon: '📊',
        }
      )
    }

    // Register listeners
    socket.on('recruiter:candidate-application', handleCandidateApplication)
    socket.on('recruiter:job-stats', handleJobStats)

    // Cleanup
    return () => {
      socket.off('recruiter:candidate-application', handleCandidateApplication)
      socket.off('recruiter:job-stats', handleJobStats)
    }
  }, [user])
}

/**
 * 🔌 Socket Connection Status Hook
 */
export const useSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      console.log('✅ Socket connected')
      setIsConnected(true)
      toast.success('Connected to live updates', { icon: '🟢', duration: 2000 })
    }

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
      toast.error('Disconnected from live updates', { icon: '⚫', duration: 3000 })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    // Check initial state
    setIsConnected(socket.connected)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  return isConnected
}

/**
 * 🎯 Helper to emit socket events with error handling
 */
export const emitSocketEvent = (
  event: string,
  data: any,
  callback?: (response: any) => void
) => {
  if (!socket?.connected) {
    console.error('❌ Socket not connected. Cannot emit:', event)
    toast.error('Not connected to server. Please refresh.')
    return
  }

  console.log(`📤 Emitting: ${event}`, data)
  
  socket.emit(event, data, (response: any) => {
    if (response?.error) {
      console.error(`❌ ${event} error:`, response.error)
      toast.error(response.error)
      callback?.(response)
    } else {
      console.log(`✅ ${event} success`)
      callback?.(response)
    }
  })
}

/**
 * 🔍 Debug: Log all socket events
 */
export const enableSocketDebugMode = () => {
  if (!socket) return

  socket.onAny((event: string, ...args: any[]) => {
    console.log(`📨 Socket Event: ${event}`, args)
  })

  console.log('🐛 Socket debug mode enabled - all events will be logged')
}
