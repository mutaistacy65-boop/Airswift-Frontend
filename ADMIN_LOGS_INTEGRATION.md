# Admin Logs Frontend Integration Guide

## Overview

This guide shows how to display admin logs in your Next.js frontend by connecting to the backend API.

---

## 📋 API Endpoint

**URL:** `/api/admin/audit`
**Methods:** `GET`, `POST`
**Auth Required:** Admin role only

### GET - Fetch Logs

Retrieve admin logs with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 20, max: 100) - Items per page
- `action` (string) - Filter by action: `LOGIN`, `LOGOUT`, `REGISTER`, `FAILED_LOGIN`, `ACTION`
- `searchUser` (string) - Search user by name or email
- `ipAddress` (string) - Filter by IP address (regex)
- `startDate` (ISO string) - Start date for range filter
- `endDate` (ISO string) - End date for range filter
- `suspicious` (boolean) - Show only suspicious activities

**Example Request:**
```javascript
fetch('/api/admin/audit?page=1&limit=10&action=LOGIN', {
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log(data))
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user_id": "507f1f77bcf86cd799439012",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "user_role": "user",
      "action": "LOGIN",
      "ip_address": "192.168.1.1",
      "browser": "Chrome",
      "device_type": "Desktop",
      "os": "Windows",
      "location": "Nairobi, Kenya",
      "details": {},
      "is_suspicious": false,
      "created_at": "2024-04-11T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "pages": 16
  }
}
```

### POST - Export Logs

Export logs as CSV or JSON format.

**Request Body:**
```json
{
  "action": "LOGIN",
  "startDate": "2024-04-01",
  "endDate": "2024-04-11",
  "format": "csv"
}
```

**Response:** File download (CSV or JSON)

---

## 🎨 Component Usage

### Option 1: Use Pre-built Component

The easiest way to display logs:

```tsx
import AdminLogs from '@/components/AdminLogs'

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Compact view with 10 logs */}
      <AdminLogs limit={10} compact={true} />
      
      {/* OR Full detailed view with 50 logs */}
      <AdminLogs limit={50} compact={false} />
    </div>
  )
}
```

### Option 2: Manual Implementation

If you want more control, implement it yourself:

```tsx
import { useState, useEffect } from 'react'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/audit?page=1&limit=20')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLogs(data.logs)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      {logs.map(log => (
        <div key={log._id}>
          <p><strong>User:</strong> {log.user_email}</p>
          <p><strong>Action:</strong> {log.action}</p>
          <p><strong>IP:</strong> {log.ip_address}</p>
          <p><strong>Time:</strong> {new Date(log.created_at).toLocaleString()}</p>
          <hr />
        </div>
      ))}
    </div>
  )
}
```

---

## 📚 Usage Examples

### Example 1: Simple Log List

```tsx
import { useEffect, useState } from 'react'

export default function LogsPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch("/api/admin/audit?limit=20")
      .then(res => res.json())
      .then(data => setLogs(data.logs))
  }, [])

  return (
    <div className="space-y-4">
      {logs.map(log => (
        <div key={log._id} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{log.user_email}</p>
              <p className="text-sm text-gray-600">{log.action}</p>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(log.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Example 2: Filtered Logs

```tsx
import { useEffect, useState } from 'react'

export default function FailedLoginsPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    // Get only failed logins
    fetch("/api/admin/audit?action=FAILED_LOGIN&limit=50")
      .then(res => res.json())
      .then(data => setLogs(data.logs))
  }, [])

  return (
    <div>
      <h1>Failed Login Attempts ({logs.length})</h1>
      {logs.map(log => (
        <div key={log._id} className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p><strong>{log.user_email || 'Unknown'}</strong> - {log.ip_address}</p>
          <p className="text-sm text-gray-600">
            {new Date(log.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
```

### Example 3: Search & Filter

```tsx
import { useState } from 'react'

export default function SearchLogs() {
  const [logs, setLogs] = useState([])
  const [searchEmail, setSearchEmail] = useState('')

  const handleSearch = async () => {
    const params = new URLSearchParams({
      searchUser: searchEmail,
      limit: '10'
    })
    
    const res = await fetch(`/api/admin/audit?${params}`)
    const data = await res.json()
    setLogs(data.logs)
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="email"
          placeholder="Search user email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>

      <div className="space-y-2">
        {logs.map(log => (
          <div key={log._id} className="p-2 bg-gray-50 rounded">
            <p>{log.user_email} - {log.action}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 4: Date Range Filtering

```tsx
import { useState } from 'react'

export default function DateRangeLogs() {
  const [logs, setLogs] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = async () => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      limit: '50'
    })
    
    const res = await fetch(`/api/admin/audit?${params}`)
    const data = await res.json()
    setLogs(data.logs)
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Filter
        </button>
      </div>

      <div className="space-y-2">
        {logs.map(log => (
          <div key={log._id} className="p-3 bg-white border rounded">
            <p className="font-semibold">{log.action}</p>
            <p className="text-sm text-gray-600">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 5: Real-time Updates with WebSocket

```tsx
import { useEffect, useState } from 'react'
import { useSocket } from '@/hooks/useSocket'

export default function LiveLogs() {
  const [logs, setLogs] = useState([])
  const { subscribe } = useSocket()

  useEffect(() => {
    // Initial load
    fetch('/api/admin/audit?limit=10')
      .then(res => res.json())
      .then(data => setLogs(data.logs))

    // Subscribe to real-time updates
    subscribe('audit_log', (newLog) => {
      setLogs(prev => [newLog, ...prev.slice(0, 9)])
    })
  }, [])

  return (
    <div>
      <h2>Live Activity Feed 🔴</h2>
      {logs.map(log => (
        <div
          key={log._id}
          className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded animate-fadeIn"
        >
          <p>
            <strong>{log.user_email}</strong> {log.action.toLowerCase()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(log.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔍 Available Log Actions

| Action | Description |
|--------|-------------|
| `LOGIN` | User successfully logged in |
| `LOGOUT` | User logged out |
| `REGISTER` | New user registered |
| `FAILED_LOGIN` | Failed login attempt |
| `ACTION` | General admin action |

---

## 📊 Log Object Structure

```typescript
{
  _id: string                    // Unique log ID
  user_id?: string              // User ID (null for failed logins)
  user_name: string            // User's full name
  user_email: string           // User's email
  user_role: string            // User's role (admin, user, etc)
  action: string               // Action type (LOGIN, LOGOUT, etc)
  ip_address: string           // User's IP address
  browser?: string             // Browser name (Chrome, Firefox, etc)
  device_type?: string         // Device type (Desktop, Mobile, Tablet)
  os?: string                  // Operating system
  location?: string            // Geographic location
  details?: object             // Additional details specific to action
  is_suspicious: boolean       // Whether activity was flagged as suspicious
  created_at: string          // ISO timestamp
}
```

---

## 🚀 Testing the API

### Test in Browser Console

```javascript
// Test 1: Get all logs
fetch('/api/admin/audit')
  .then(r => r.json())
  .then(d => console.log(d))

// Test 2: Filter by action
fetch('/api/admin/audit?action=FAILED_LOGIN')
  .then(r => r.json())
  .then(d => console.log(d))

// Test 3: Search user
fetch('/api/admin/audit?searchUser=john@example.com')
  .then(r => r.json())
  .then(d => console.log(d))

// Test 4: Date range
const params = new URLSearchParams({
  startDate: '2024-04-01',
  endDate: '2024-04-11'
})
fetch(`/api/admin/audit?${params}`)
  .then(r => r.json())
  .then(d => console.log(d))

// Test 5: Export as CSV
fetch('/api/admin/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ format: 'csv' })
})
.then(r => r.blob())
.then(blob => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'logs.csv'
  a.click()
})
```

---

## 🔐 Security Notes

- **Admin Only:** All endpoints require admin role authentication
- **Credentials:** Include `credentials: 'include'` in fetch calls
- **Rate Limiting:** Recommended to implement rate limiting on the backend
- **Data Privacy:** Logs contain IP addresses and user information - handle carefully
- **Audit Trail:** All API access should be logged

---

## ⚠️ Common Issues

### Issue: "Access denied" error
**Solution:** Make sure you're logged in as an admin user
```javascript
// Check your role
const user = JSON.parse(localStorage.getItem('user'))
console.log('Your role:', user?.role)
```

### Issue: Empty logs returned
**Solution:** Adjust date range or filters
```javascript
// Try fetching without filters first
fetch('/api/admin/audit?limit=50')
```

### Issue: CORS errors
**Solution:** Make sure the API request includes credentials
```javascript
fetch('/api/admin/audit', {
  credentials: 'include'  // ← IMPORTANT
})
```

### Issue: Logs take too long to load
**Solution:** Reduce the limit or add more specific filters
```javascript
fetch('/api/admin/audit?limit=10')  // Load 10 instead of 20
```

---

## 📝 Complete Integration Example

See the full working example in:
- **Component:** `src/components/AdminLogs.tsx`
- **API:** `src/pages/api/admin/audit.ts`
- **Page:** `src/pages/admin/audit-logs.tsx` (full featured admin page)

---

## 🎯 Next Steps

1. ✅ Copy the component: `<AdminLogs />`
2. ✅ Use the API calls in your pages
3. ✅ Customize the UI to match your design
4. ✅ Add real-time updates with WebSocket
5. ✅ Implement export functionality

Happy logging! 🎉
