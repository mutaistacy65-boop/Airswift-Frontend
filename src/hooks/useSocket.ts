import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export type SocketEventType =
  | 'applicationUpdate'
  | 'applicationCreated'
  | 'application:new'
  | 'applicationStatusChanged'
  | 'applicationUpdated'
  | 'newApplication'
  | 'statusUpdate'
  | 'user:shortlisted'
  | 'interviewUpdate'
  | 'interviewScheduled'
  | 'interviewUpdated'
  | 'jobCreated'
  | 'jobUpdated'
  | 'messageReceived'
  | 'audit_log'
  | 'audit:new'
  | 'security:alert'
  | 'new_message'
  | 'new_notification'
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'user:location'
  | 'user:online'
  | 'user:offline'
  | 'user:activity'
  | 'user:updated'
  | 'admin:alert'

interface UseSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionDelay?: number
  reconnectionDelayMax?: number
  reconnectionAttempts?: number
}

interface SocketListener {
  event: SocketEventType
  callback: (data: any) => void
}

/**
 * Custom hook for Socket.io real-time updates
 * Handles connection, disconnection, and event listening
 */
export const useSocket = (options: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null)
  const listenersRef = useRef<SocketListener[]>([])

  const {
    autoConnect = true,
    reconnection = true,
    reconnectionDelay = 1000,
    reconnectionDelayMax = 5000,
    reconnectionAttempts = 5,
  } = options

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect || socketRef.current?.connected) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://airswift-backend-fjt3.onrender.com'
    const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || '/api/socket'

    socketRef.current = io(socketUrl, {
      path: socketPath,
      withCredentials: true,
      transports: ["websocket"],
      reconnection,
      reconnectionDelay,
      reconnectionDelayMax,
      reconnectionAttempts,
    })

    // Handle connection
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id)
    })

    // Handle disconnection
    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    // Handle errors
    socketRef.current.on('error', (error: any) => {
      console.error('Socket error:', error)
    })

    // Attach existing listeners
    listenersRef.current.forEach(({ event, callback }) => {
      socketRef.current?.on(event, callback)
    })

    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [autoConnect, reconnection, reconnectionDelay, reconnectionDelayMax, reconnectionAttempts])

  // Subscribe to an event
  const subscribe = useCallback((event: SocketEventType, callback: (data: any) => void) => {
    if (socketRef.current?.connected) {
      socketRef.current.on(event, callback)
    } else {
      // Queue the listener if socket not connected yet
      listenersRef.current.push({ event, callback })
    }

    // Return unsubscribe function
    return () => {
      socketRef.current?.off(event, callback)
      listenersRef.current = listenersRef.current.filter(
        l => !(l.event === event && l.callback === callback)
      )
    }
  }, [])

  // Emit an event
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected. Cannot emit:', event)
    }
  }, [])

  // Check if connected
  const isConnected = socketRef.current?.connected ?? false

  return {
    socket: socketRef.current,
    subscribe,
    emit,
    isConnected,
  }
}

export default useSocket
