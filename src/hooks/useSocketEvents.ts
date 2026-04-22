import { useEffect, useCallback } from 'react'
import { socket } from '@/services/socket'
import { useAuth } from '@/context/AuthContext'

interface SocketEventHandlers {
  [key: string]: (data: any) => void
}

/**
 * Hook for role-aware socket event handling with automatic cleanup
 * 
 * Usage:
 * useSocketEvents('admin', {
 *   'admin:new-application': (data) => setApplications(prev => [data, ...prev]),
 *   'application:status': (data) => updateApplication(data),
 *   'job:created': (job) => addJob(job),
 * })
 */
export const useSocketEvents = (
  requiredRole: 'admin' | 'user' | 'recruiter' | string,
  handlers: SocketEventHandlers
) => {
  const { user } = useAuth()

  // Only set up listeners if user has the required role
  useEffect(() => {
    // Guard: Check user role
    if (!user || user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      console.log(`⚠️ Socket events require '${requiredRole}' role, user has '${user?.role}'`)
      return
    }

    // Guard: Check socket connection
    if (!socket || !socket.connected) {
      console.warn('⚠️ Socket not connected yet, retrying in 1s...')
      const timeout = setTimeout(() => {
        // Retry event setup
        socket?.connect?.()
      }, 1000)
      return () => clearTimeout(timeout)
    }

    console.log(`📡 Setting up socket listeners for '${requiredRole}' role:`, Object.keys(handlers))

    // Register all event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    // 🛡️ CLEANUP (CRITICAL - prevents memory leaks)
    return () => {
      console.log(`🧹 Cleaning up socket listeners for '${requiredRole}' role`)
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler)
      })
    }
  }, [user, requiredRole, handlers])
}

/**
 * Hook to listen for specific socket event
 * 
 * Usage:
 * useSocketEvent('job:created', (job) => {
 *   console.log('New job:', job)
 * })
 */
export const useSocketEvent = (
  event: string,
  handler: (data: any) => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled || !socket || !socket.connected) return

    console.log(`📡 Listening for: ${event}`)
    socket.on(event, handler)

    return () => {
      console.log(`🧹 Cleanup: ${event}`)
      socket.off(event, handler)
    }
  }, [event, handler, enabled])
}

/**
 * Hook to emit socket events with error handling
 * 
 * Usage:
 * const emit = useSocketEmit()
 * emit('admin:update-status', { id: '123', status: 'approved' })
 */
export const useSocketEmit = () => {
  const { user } = useAuth()

  return useCallback(
    (event: string, data: any) => {
      if (!socket || !socket.connected) {
        console.error('❌ Socket not connected')
        return
      }

      if (!user) {
        console.error('❌ Not authenticated')
        return
      }

      console.log(`📤 Emitting: ${event}`, data)
      socket.emit(event, data, (response: any) => {
        if (response?.error) {
          console.error(`❌ ${event} error:`, response.error)
        } else {
          console.log(`✅ ${event} success`)
        }
      })
    },
    [user]
  )
}
