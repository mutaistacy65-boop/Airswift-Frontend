// ✅ FIXED: Socket.IO Client Configuration with Authentication
// This file provides authenticated Socket.IO connections

import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.REACT_APP_API_URL || 'https://airswift-backend-fjt3.onrender.com'

let socket: Socket | null = null
let currentToken: string | null = null

const createSocketInstance = (token: string): Socket | null => {
  if (!token) {
    console.warn('⚠️ No token found for Socket.IO connection - socket will be created after login')
    return null
  }

  const instance = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  instance.on('connect', () => {
    console.log('✅ Socket.IO connected:', instance.id)
  })

  instance.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason)
  })

  instance.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error)
  })

  instance.on('authenticated', () => {
    console.log('🔐 Socket.IO authenticated successfully')
  })

  instance.on('unauthorized', () => {
    console.error('🚫 Socket.IO authentication failed - token may be expired')
  })

  return instance
}

export const initSocket = (token?: string): Socket | null => {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  if (!authToken) {
    console.warn('⚠️ No token found for Socket.IO initialization.')
    return null
  }

  if (socket) {
    if (socket.connected && authToken === currentToken) {
      return socket
    }

    socket.disconnect()
    socket = null
  }

  socket = createSocketInstance(authToken)
  currentToken = authToken
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentToken = null
    console.log('🔌 Socket disconnected')
  }
}

export const disconnectSocketConnection = disconnectSocket

export const reconnectSocket = (token?: string): Socket | null => {
  disconnectSocketConnection()
  return initSocket(token)
}

export const reconnectSocketConnection = reconnectSocket

export const getSocket = (): Socket | null => socket

export { socket }
export default socket
