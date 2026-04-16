// ✅ FIXED: Socket.IO Client Configuration with Authentication
// This file provides authenticated Socket.IO connections
// 🔒 Socket ONLY connects AFTER login with valid token

import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com'

// 🔒 Socket instance - initialized only AFTER login
let socket: Socket | null = null

/**
 * Initialize socket AFTER successful login
 * Only call this from login flow with valid token
 */
export const initSocket = (token?: string): Socket | null => {
  if (typeof window === 'undefined') return null

  // Use provided token or get from localStorage
  const authToken = token || localStorage.getItem('token') || localStorage.getItem('accessToken')

  // 🔒 Guard: Check token validity
  if (!authToken || authToken === 'undefined' || authToken === 'null') {
    console.error('❌ Cannot initialize socket: No valid token')
    return null
  }

  // 🔒 Guard: Don't double-connect
  if (socket && socket.connected) {
    console.warn('⚠️ Socket already connected, skipping duplicate initialization')
    return socket
  }

  console.log('🔌 Initializing Socket.IO connection...')
  console.log('   URL:', SOCKET_URL)
  console.log('   Token:', authToken ? `✓ ${authToken.substring(0, 20)}...` : '✗ MISSING')

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: {
      token: authToken // Send token for authentication
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason)
  })

  socket.on('connect_error', (error: any) => {
    console.error('❌ Socket.IO connection error:', error.message)
  })

  socket.on('authenticated', () => {
    console.log('🔐 Socket.IO authenticated successfully')
  })

  socket.on('unauthorized', () => {
    console.error('🚫 Socket.IO authentication failed - token may be expired')
  })

  return socket
}

/**
 * Get current socket instance
 * Returns null if not initialized
 */
export const getSocket = (): Socket | null => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized. Call initSocket() after login.')
    return null
  }
  return socket
}

/**
 * Reconnect socket with new token (e.g., after token refresh)
 */
export const reconnectSocket = (newToken?: string) => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized, initializing with token...')
    return initSocket(newToken)
  }

  const authToken = newToken || localStorage.getItem('token') || localStorage.getItem('accessToken')
  
  if (!authToken || authToken === 'undefined') {
    console.error('❌ Cannot reconnect: Invalid token')
    return null
  }

  console.log('🔄 Reconnecting socket with new token...')
  socket.auth = { token: authToken }
  socket.disconnect()
  socket.connect()
  
  return socket
}

/**
 * Disconnect socket on logout
 */
export const disconnectSocket = () => {
  if (socket && socket.connected) {
    console.log('🔌 Disconnecting socket on logout...')
    socket.disconnect()
    socket = null
  }
}

// Export for convenience
export { socket }
export default socket
