import { io, Socket } from 'socket.io-client'

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://airswift-backend-fjt3.onrender.com'
const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || undefined

// Function to get current token (handles both token keys)
const getCurrentToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || undefined
}

// Create socket with current token
const createSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null

  const token = getCurrentToken()

  console.log('🔌 Creating socket with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')

  return io(socketUrl, {
    ...(socketPath ? { path: socketPath } : {}),
    transports: ['websocket', 'polling'],
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
  })
}

const socket: Socket | null = createSocket()

if (socket) {
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('🚨 Socket connection error:', error.message)
    console.error('   This usually means authentication failed')
    console.error('   Check that localStorage has a valid token')
    console.log('   Current token:', getCurrentToken() ? 'PRESENT' : 'MISSING')
  })

  socket.on('authenticated', () => {
    console.log('🔐 Socket authenticated successfully')
  })

  socket.on('unauthorized', () => {
    console.log('🚫 Socket authentication failed')
  })
}

// Export function to reconnect with new token (call after login)
export const reconnectSocket = () => {
  if (socket) {
    console.log('🔄 Reconnecting socket with new token...')
    socket.auth = { token: getCurrentToken() }
    socket.disconnect()
    socket.connect()
  }
}

export default socket
