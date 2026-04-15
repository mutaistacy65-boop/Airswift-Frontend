import { io, Socket } from 'socket.io-client'

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://airswift-backend-fjt3.onrender.com'
const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || undefined

const socket: Socket | null = typeof window !== 'undefined'
  ? io(socketUrl, {
      ...(socketPath ? { path: socketPath } : {}),
      withCredentials: true,
      transports: ['websocket', 'polling'], // 👈 Add polling as fallback
      auth: {
        token: localStorage.getItem('token') || localStorage.getItem('accessToken') || undefined,
      },
    })
  : null

if (socket) {
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })
}

export default socket
