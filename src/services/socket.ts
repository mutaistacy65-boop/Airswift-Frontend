// ✅ FIXED: Socket.IO Client Configuration with Authentication
// This file provides authenticated Socket.IO connections

import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'https://airswift-backend-fjt3.onrender.com'

// Create authenticated socket connection
const createSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('token') || localStorage.getItem('accessToken')

  if (!token) {
    console.warn('⚠️ No token found for Socket.IO connection')
    return null
  }

  console.log('🔌 Connecting to Socket.IO...')
  console.log('   URL:', SOCKET_URL)
  console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'NONE')

  const socket = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: {
      token: token // Send token for authentication
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason)
  })

  socket.on('connect_error', (error: any) => {
    console.error('❌ Socket.IO connection error:', error.message)
    
    if (!token) {
      console.error('   Reason: No authentication token')
    }
  })

  socket.on('authenticated', () => {
    console.log('🔐 Socket.IO authenticated successfully')
  })

  socket.on('unauthorized', () => {
    console.error('🚫 Socket.IO authentication failed')
  })

  return socket
}

// Export socket instance
export const socket = createSocket()

// Export createSocket function for manual reconnection
export const reconnectSocket = () => {
  if (socket) {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    console.log('🔄 Reconnecting socket with token:', token ? `${token.substring(0, 20)}...` : 'NONE')
    socket.auth = { token }
    socket.disconnect()
    socket.connect()
  }
}

export default socket
