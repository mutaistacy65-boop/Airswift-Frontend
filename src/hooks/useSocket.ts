import { useCallback } from 'react'
import socket from '@/services/socket'

export type SocketEventType =
  | 'applicationUpdate'
  | 'applicationCreated'
  | 'application:new'
  | 'application_updated'
  | 'applicationStatusChanged'
  | 'applicationUpdated'
  | 'newApplication'
  | 'new_application'
  | 'new_interview'
  | 'payment_success'
  | 'settings_updated'
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

/**
 * Custom hook for Socket.io real-time updates
 * Handles connection, disconnection, and event listening
 */
export const useSocket = (options: UseSocketOptions = {}) => {
  const socketRef = socket

  const subscribe = useCallback((event: SocketEventType, callback: (data: any) => void) => {
    if (socketRef) {
      socketRef.on(event, callback)
    }

    return () => {
      socketRef?.off(event, callback)
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef?.connected) {
      socketRef.emit(event, data)
    } else {
      console.warn('Socket not connected. Cannot emit:', event)
    }
  }, [])

  const isConnected = socketRef?.connected ?? false

  return {
    socket: socketRef,
    subscribe,
    emit,
    isConnected,
  }
}

export default useSocket
