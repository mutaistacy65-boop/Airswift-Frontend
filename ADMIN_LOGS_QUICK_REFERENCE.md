# Admin Logs - Quick Reference

## 🚀 Quick Start (30 seconds)

### Option 1: Use Pre-built Component (Easiest)
```tsx
import AdminLogs from '@/components/AdminLogs'

export default function MyPage() {
  return <AdminLogs limit={20} compact={false} />
}
```

### Option 2: Direct API Call (Recommended)
```tsx
useEffect(() => {
  fetch("/api/admin/audit?page=1&limit=20")
    .then(res => res.json())
    .then(data => setLogs(data.logs))
}, [])
```

---

## 📞 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/admin/audit` | Fetch logs with pagination |
| `POST` | `/api/admin/audit` | Export logs as CSV/JSON |

---

## 🔍 GET Query Parameters

```javascript
// All parameters are optional
const params = {
  page: 1,              // Page number (default: 1)
  limit: 20,            // Items per page (default: 20, max: 100)
  action: 'LOGIN',      // Filter: LOGIN, LOGOUT, REGISTER, FAILED_LOGIN, ACTION
  searchUser: 'john',   // Search by name or email
  ipAddress: '192.1',   // Filter by IP (partial/regex)
  startDate: '2024-04-01',  // Date range start
  endDate: '2024-04-11',    // Date range end
  suspicious: 'true'    // Show only suspicious activities
}

// Example:
const url = new URLSearchParams(params).toString()
fetch(`/api/admin/audit?${url}`)
```

---

## 📤 POST - Export Logs

```javascript
// Export as CSV
fetch('/api/admin/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'LOGIN',
    startDate: '2024-04-01',
    endDate: '2024-04-11',
    format: 'csv'  // or 'json'
  })
})

// Handle response
.then(r => r.blob())
.then(blob => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-${Date.now()}.csv`
  a.click()
})
```

---

## 📊 Response Format

### Success Response (GET)
```json
{
  "success": true,
  "logs": [
    {
      "_id": "...",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "user_role": "user",
      "action": "LOGIN",
      "ip_address": "192.168.1.1",
      "browser": "Chrome",
      "device_type": "Desktop",
      "os": "Windows",
      "location": "nairobi",
      "details": {},
      "is_suspicious": false,
      "created_at": "2024-04-11T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 🎯 Common Use Cases

### 1. Display Last 10 Logins
```javascript
fetch('/api/admin/audit?action=LOGIN&limit=10')
```

### 2. Find Failed Login Attempts
```javascript
fetch('/api/admin/audit?action=FAILED_LOGIN&limit=50')
```

### 3. Search Specific User Activity
```javascript
fetch('/api/admin/audit?searchUser=john@example.com&limit=20')
```

### 4. View Activity from Specific IP
```javascript
fetch('/api/admin/audit?ipAddress=192.168.1&limit=20')
```

### 5. Get Weekly Report
```javascript
const params = {
  startDate: '2024-04-01',
  endDate: '2024-04-08',
  limit: 100
}
fetch(`/api/admin/audit?${new URLSearchParams(params)}`)
```

### 6. Find Suspicious Activities
```javascript
fetch('/api/admin/audit?suspicious=true&limit=50')
```

---

## 🧩 Component Props

```typescript
interface AdminLogsProps {
  limit?: number      // Number of logs to display (default: 50)
  compact?: boolean   // Show compact view (default: false)
}

// Usage:
<AdminLogs limit={10} compact={true} />   // Compact with 10 items
<AdminLogs limit={50} compact={false} />  // Full view with 50 items
```

---

## 🎨 Styling Classes

All components use Tailwind CSS:
- Cards: `bg-white rounded-lg shadow`
- Badges: `px-3 py-1 rounded-full`
- Color classes: `text-blue-800`, `bg-green-100`, etc.

Customize by modifying `src/components/AdminLogs.tsx`

---

## ✅ Pre-built Pages

| File | Purpose |
|------|---------|
| `src/pages/admin/audit-logs.tsx` | Full-featured audit logs page with advanced filters |
| `src/pages/admin/logs-example.tsx` | Example implementation with AdminLogs component |

---

## 🔒 Security Checklist

- ✅ Admin role required
- ✅ Credentials included in requests
- ✅ JWT token validation on backend
- ✅ Database indexes for performance
- ✅ Rate limiting recommended

---

## 📋 Log Object Fields

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `_id` | ObjectId | "507f..." | Unique log identifier |
| `user_name` | String | "John Doe" | User's full name |
| `user_email` | String | "john@ex.com" | User's email |
| `action` | String | "LOGIN" | Action type |
| `ip_address` | String | "192.168.1.1" | User's IP address |
| `browser` | String | "Chrome" | Browser name |
| `device_type` | String | "Desktop" | Device category |
| `os` | String | "Windows" | Operating system |
| `location` | String | "Nairobi" | Geographic location |
| `details` | Object | `{}` | Additional metadata |
| `is_suspicious` | Boolean | false | Suspicious flag |
| `created_at` | ISO String | "2024-04..." | Timestamp |

---

## 🐛 Troubleshooting

### "Access denied" error
```javascript
// Check if you're an admin
const user = JSON.parse(localStorage.getItem('user'))
console.log(user.role) // Should be 'admin'
```

### Empty logs
```javascript
// Try fetching with more history
const week_ago = new Date()
week_ago.setDate(week_ago.getDate() - 7)
fetch(`/api/admin/audit?startDate=${week_ago.toISOString().split('T')[0]}`)
```

### CORS/Auth errors
```javascript
// Make sure credentials are included
fetch('/api/admin/audit', {
  credentials: 'include'  // ← IMPORTANT
})
```

---

## 📚 Examples

### Complete Example: User Activity Dashboard
```tsx
import AdminLogs from '@/components/AdminLogs'

export default function ActivityDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">User Activity</h1>
      <AdminLogs limit={50} compact={false} />
    </div>
  )
}
```

### Example with Custom Styling
```tsx
import { useEffect, useState } from 'react'

export default function CustomLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch('/api/admin/audit?limit=20')
      .then(r => r.json())
      .then(d => setLogs(d.logs))
  }, [])

  return (
    <ul className="space-y-2">
      {logs.map(log => (
        <li key={log._id} className="p-4 bg-slate-100 rounded">
          <span className="font-bold">{log.user_email}</span>
          <span className="mx-2">→</span>
          <span className="text-blue-600">{log.action}</span>
        </li>
      ))}
    </ul>
  )
}
```

---

## 🎓 Learn More

- Full integration guide: [ADMIN_LOGS_INTEGRATION.md](./ADMIN_LOGS_INTEGRATION.md)
- Source: `src/pages/api/admin/audit.ts`
- Component: `src/components/AdminLogs.tsx`
- Example page: `src/pages/admin/logs-example.tsx`

---

**Status:** ✅ Admin Logs API is ready to use!

Use the examples above to get started in minutes. 🚀
