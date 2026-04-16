# Socket.IO + React Hot Toast Integration Guide

## ✅ Setup Complete

Your project now has:
- ✅ `socket.io-client` installed
- ✅ `react-hot-toast` configured
- ✅ Global socket instance
- ✅ Authentication integrated
- ✅ Real-time event handlers

---

## 🚀 Quick Start

### 1. Socket Auto-Connects on Login
```typescript
// src/context/AuthContext.tsx
login = async (data) => {
  localStorage.setItem('token', data.token)
  setUser(data.user)
  reconnectSocket() // ✅ Connects to server with auth token
}
```

### 2. Get Connected Status
```typescript
import { useSocketStatus } from '@/lib/socketIntegration'

export default function MyComponent() {
  const isConnected = useSocketStatus()
  
  return (
    <div>
      {isConnected ? '🟢 Live' : '⚫ Offline'}
    </div>
  )
}
```

### 3. Admin - Listen for New Applications
```typescript
import { useAdminSocketNotifications } from '@/lib/socketIntegration'

export default function AdminDashboard() {
  useAdminSocketNotifications() // ✅ Automatic notifications
  
  return <div>{/* Your UI */}</div>
}
```

### 4. User - Listen for Application Updates
```typescript
import { useUserSocketNotifications } from '@/lib/socketIntegration'

export default function UserDashboard() {
  useUserSocketNotifications() // ✅ Automatic notifications
  
  return <div>{/* Your UI */}</div>
}
```

### 5. Recruiter - Listen for Candidate Applications
```typescript
import { useRecruiterSocketNotifications } from '@/lib/socketIntegration'

export default function RecruiterDashboard() {
  useRecruiterSocketNotifications() // ✅ Automatic notifications
  
  return <div>{/* Your UI */}</div>
}
```

---

## 🔔 Notification Events

### Admin Events

| Event | Toast | Description |
|-------|-------|-------------|
| `admin:new-application` | 📩 New application from {name} | Someone applied for a job |
| `application:status` | {emoji} Application from {name} - {status} | Application status changed |
| `job:updated` | ✏️ Job "{title}" updated to {status} | Job details changed |

### User Events

| Event | Toast | Description |
|-------|-------|-------------|
| `user:application-status` | ✅ Your application was ACCEPTED! | Application accepted |
| `user:application-status` | ❌ Application status: Rejected | Application rejected |
| `user:application-status` | 🟡 You have been shortlisted! | Shortlisted for interview |
| `user:interview-scheduled` | 📅 Interview scheduled for {date} | Interview date confirmed |
| `user:message-received` | 💬 New message from {name} | Received a message |

### Recruiter Events

| Event | Toast | Description |
|-------|-------|-------------|
| `recruiter:candidate-application` | 👤 New candidate applied: {name} | New application from candidate |
| `recruiter:job-stats` | 📊 Job "{title}" - {count} applications | Job statistics updated |

---

## 📡 Manual Socket Events

### Listening to Custom Events
```typescript
import { socket } from '@/services/socket'

useEffect(() => {
  socket.on('custom:event', (data) => {
    console.log('Custom event:', data)
  })
  
  return () => socket.off('custom:event')
}, [])
```

### Emitting Events
```typescript
import { emitSocketEvent } from '@/lib/socketIntegration'

// With callback
emitSocketEvent('action:update-status', { id: '123', status: 'approved' }, (response) => {
  console.log('Server responded:', response)
})

// Without callback
emitSocketEvent('action:notify', { message: 'Hello' })
```

---

## 🔐 Automatic Features

✅ **Automatic Cleanup** - All listeners are cleaned up on unmount
✅ **Role-Based Filtering** - Events only trigger for correct user role
✅ **Connection Status** - Shows 🟢 Live / ⚫ Offline indicator
✅ **Auto Reconnection** - Automatically reconnects on disconnect
✅ **Toast Notifications** - Visual feedback for all events
✅ **Error Handling** - Proper error messages and logging

---

## 🎯 Real-World Examples

### Admin Dashboard with Live Applications
```typescript
import { useAdminSocketNotifications, useSocketStatus } from '@/lib/socketIntegration'
import { useState } from 'react'

export default function AdminDashboard() {
  const [applications, setApplications] = useState([])
  const isConnected = useSocketStatus()
  
  useAdminSocketNotifications()
  
  return (
    <div>
      <h1>Admin Dashboard {isConnected ? '🟢' : '⚫'}</h1>
      <div className="applications">
        {/* Applications will update in real-time */}
      </div>
    </div>
  )
}
```

### User Dashboard with Status Updates
```typescript
import { useUserSocketNotifications } from '@/lib/socketIntegration'
import { useState } from 'react'

export default function UserDashboard() {
  const [applications, setApplications] = useState([])
  
  useUserSocketNotifications() // Receives status updates
  
  return (
    <div>
      <h1>My Applications</h1>
      <div className="applications">
        {/* Applications will update when status changes */}
      </div>
    </div>
  )
}
```

---

## 🐛 Debugging

### Enable Debug Mode
```typescript
import { enableSocketDebugMode } from '@/lib/socketIntegration'

useEffect(() => {
  enableSocketDebugMode() // Log all socket events
}, [])
```

### Check Connection Status
```typescript
import { socket } from '@/services/socket'

console.log('Connected:', socket?.connected)
console.log('Socket ID:', socket?.id)
```

### View Socket Logs
Open browser console and look for:
- 🔌 Connection logs
- 📨 Event logs
- 📤 Emit logs
- 🟢 Connection status

---

## 📋 File Locations

| File | Purpose |
|------|---------|
| `src/services/socket.ts` | Global socket instance |
| `src/lib/socketIntegration.ts` | Hooks and helpers |
| `src/context/AuthContext.tsx` | Socket connects on login |
| `src/pages/_app.tsx` | Toast provider setup |
| `src/examples/SocketIntegrationExample.tsx` | Usage examples |

---

## 🔧 Customization

### Change Toast Position
```typescript
// src/pages/_app.tsx
<Toaster position="bottom-right" /> // Change from top-right
```

### Add Custom Toast Styling
```typescript
import toast from 'react-hot-toast'

toast.success('Custom message', {
  icon: '🎉',
  duration: 5000,
  style: {
    background: '#333',
    color: '#fff',
  },
})
```

### Add More Socket Events
```typescript
// src/lib/socketIntegration.ts
socket.on('your:custom-event', (data) => {
  toast.success('Your event received!')
})
```

---

## ⚠️ Common Issues

### Socket Creates Multiple Connections
**Problem:** Creating new socket instance multiple times
**Solution:** Use the global `socket` from `@/services/socket`

### Notifications Not Appearing
**Problem:** Toast not initialized
**Solution:** Ensure `<Toaster />` is in `src/pages/_app.tsx`

### Events Not Triggering
**Problem:** Socket.role doesn't match event role requirement
**Solution:** Check `user.role` matches the notification hook

### Memory Leaks
**Problem:** Event listeners not cleaned up
**Solution:** Always return cleanup function from useEffect

---

## 🚀 Production Checklist

- [ ] Socket events tested with backend
- [ ] All role-based notifications working
- [ ] Toast notifications appearing correctly
- [ ] Socket reconnection on disconnect working
- [ ] No console errors or warnings
- [ ] Performance tested with heavy load
- [ ] Mobile responsiveness checked
- [ ] Offline behavior tested

---

## 📞 Support

For issues or questions:
1. Check browser console for socket logs
2. Enable debug mode: `enableSocketDebugMode()`
3. Check network tab for socket connections
4. Verify backend is sending correct events
5. Check user role matches event requirements
