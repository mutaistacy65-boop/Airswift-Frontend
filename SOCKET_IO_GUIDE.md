# Socket.IO Event Handling Guide

## Overview
This guide describes how to implement real-time socket events with proper cleanup and role-based handling.

## Key Principles

✅ **DO**:
- Always clean up event listeners in `useEffect` cleanup function
- Check user role before registering listeners
- Use proper TypeScript types
- Handle socket disconnection gracefully
- Log events for debugging

❌ **DON'T**:
- Leave event listeners without cleanup (causes memory leaks)
- Register duplicate listeners
- Emit events without checking socket connection
- Ignore socket authentication failures

---

## Event Types by Role

### ADMIN Events

```typescript
socket.on('admin:new-application', (data) => {
  // New application submitted
  console.log('New application:', data)
})

socket.on('application:status', (data) => {
  // Application status changed
  console.log('Status updated:', data)
})

socket.on('job:created', (job) => {
  // New job created
  if (job.status === 'pending') {
    console.log('New pending job:', job)
  }
})

socket.on('job:updated', (job) => {
  // Job details updated
  console.log('Job updated:', job)
})
```

### USER Events

```typescript
socket.on('user:application-status', (data) => {
  // Your application status changed
  console.log('Your application status:', data)
})

socket.on('user:interview-scheduled', (data) => {
  // Interview scheduled for you
  console.log('Interview details:', data)
})

socket.on('user:message-received', (data) => {
  // New message from recruiter/admin
  console.log('New message:', data)
})

socket.on('user:notification', (data) => {
  // General notification
  console.log('Notification:', data)
})
```

### RECRUITER Events

```typescript
socket.on('recruiter:candidate-application', (data) => {
  // New candidate application
  console.log('New application:', data)
})

socket.on('recruiter:job-stats', (data) => {
  // Job statistics updated
  console.log('Job stats:', data)
})
```

---

## Implementation Patterns

### Method 1: Basic Event Listener with Cleanup (Recommended)

```typescript
useEffect(() => {
  if (!socket?.connected) return

  const handleNewApplication = (data) => {
    console.log('New application:', data)
    setApplications(prev => [data, ...prev])
  }

  // Register listener
  socket.on('admin:new-application', handleNewApplication)

  // 🛡️ CLEANUP - Required to prevent memory leaks
  return () => {
    socket.off('admin:new-application', handleNewApplication)
  }
}, [])
```

### Method 2: Using Custom Hook (Best Practice)

```typescript
import { useSocketEvents } from '@/hooks/useSocketEvents'

export default function AdminDashboard() {
  const [applications, setApplications] = useState([])

  useSocketEvents('admin', {
    'admin:new-application': (data) => {
      setApplications(prev => [data, ...prev])
    },
    'application:status': (data) => {
      setApplications(prev =>
        prev.map(app => app._id === data._id ? data : app)
      )
    }
  })

  return <div>{/* ... */}</div>
}
```

### Method 3: Role-Specific Hooks

```typescript
import { useAdminSocketEvents } from '@/hooks/socketEventHandlers'

export default function AdminComponent() {
  const update = useAdminSocketEvents()

  return (
    <div>
      {update && <div>{update.type}: {update.data}</div>}
    </div>
  )
}
```

---

## Complete Example: Admin Dashboard

```typescript
import { useEffect, useState } from 'react'
import { socket } from '@/services/socket'
import { useAuth } from '@/context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [pendingJobs, setPendingJobs] = useState([])

  // 🛡️ ROLE-AWARE SOCKET SETUP
  useEffect(() => {
    // Guard: Only for admins
    if (!user || user.role !== 'admin') return
    
    // Guard: Wait for socket connection
    if (!socket?.connected) return

    console.log('📡 Setting up admin socket listeners...')

    // Event handlers
    const handleNewApplication = (data) => {
      console.log('🔥 New application:', data)
      setApplications(prev => [data, ...prev])
    }

    const handleJobCreated = (job) => {
      if (job.status === 'pending') {
        console.log('🔥 New pending job:', job)
        setPendingJobs(prev => [job, ...prev])
      }
    }

    // Register listeners
    socket.on('admin:new-application', handleNewApplication)
    socket.on('job:created', handleJobCreated)

    // 🛡️ CLEANUP (CRITICAL)
    return () => {
      console.log('🧹 Cleaning up admin listeners')
      socket.off('admin:new-application', handleNewApplication)
      socket.off('job:created', handleJobCreated)
    }
  }, [user, socket])

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>Applications: {applications.length}</div>
      <div>Pending Jobs: {pendingJobs.length}</div>
    </div>
  )
}
```

---

## Testing Socket Events

### Desktop Testing
```javascript
// Open browser console and test:
socket.emit('admin:test-event', { message: 'Hello' })
socket.on('test-response', (data) => console.log(data))
```

### Server Testing
```javascript
// Backend: io.emit('test-event', { data: '...' })
// Frontend will receive and log
```

---

## Debugging

Enable verbose logging:

```typescript
// In socket.ts or your socket setup
socket.onAny((event, data) => {
  console.log(`📨 Socket Event: ${event}`, data)
})
```

---

## Common Issues

### Memory Leaks
```typescript
// ❌ BAD - No cleanup
useEffect(() => {
  socket.on('event', handler)
})

// ✅ GOOD - With cleanup
useEffect(() => {
  socket.on('event', handler)
  return () => socket.off('event', handler)
}, [])
```

### Duplicate Listeners
```typescript
// ❌ BAD - Adds listener multiple times
function MyComponent() {
  socket.on('event', handler)
}

// ✅ GOOD - Only setup once
function MyComponent() {
  useEffect(() => {
    socket.on('event', handler)
    return () => socket.off('event', handler)
  }, [])
}
```

### Socket Not Connected
```typescript
// ❌ BAD - May fail silently
socket.on('event', handler)

// ✅ GOOD - Check connection
if (socket?.connected) {
  socket.on('event', handler)
}
```

---

## Performance Tips

1. **Throttle Updates**: For high-frequency events (like typing)
```typescript
const throttledHandler = throttle(handler, 300)
socket.on('user:typing', throttledHandler)
```

2. **Prevent Duplicates**: Check before adding to state
```typescript
setItems(prev => {
  if (prev.find(item => item._id === data._id)) return prev
  return [data, ...prev]
})
```

3. **Pagination**: Don't load all items at once
```typescript
const [page, setPage] = useState(1)
const items = applications.slice(0, page * 20)
```

---

## Production Checklist

- [ ] All socket listeners have cleanup functions
- [ ] Role checks before registering listeners
- [ ] Socket connection checks before emitting
- [ ] Error handling for failed emits
- [ ] Proper TypeScript types
- [ ] Memory leak testing (Chrome DevTools)
- [ ] Load testing with multiple connections
- [ ] Fallback for socket disconnection
