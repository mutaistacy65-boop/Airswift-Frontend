# 🎯 User Dashboard & Application Form - Quick Reference Guide

## 📖 Table of Contents
1. [Socket Integration](#socket-integration)
2. [Dashboard Components](#dashboard-components)
3. [Application Form](#application-form)
4. [Toast Notifications](#toast-notifications)
5. [Status Colors](#status-colors)
6. [Error Handling](#error-handling)

---

## 🔌 Socket Integration

### Setup Socket Listeners (In Dashboard)

```tsx
import { setupUserSocketListeners, cleanupUserSocketListeners } from '@/lib/userSocketIntegration'

// In useEffect hook:
useEffect(() => {
  if (!socket?.connected) return

  setupUserSocketListeners({
    onApplicationUpdated: (data) => {
      console.log('App updated:', data)
      // Refresh data
    },
    onInterviewScheduled: (data) => {
      console.log('Interview:', data)
    },
    onPaymentSuccess: (data) => {
      console.log('Payment:', data)
    },
    onStatusChanged: (data) => {
      console.log('Status:', data)
    },
  })

  return () => cleanupUserSocketListeners()
}, [socket?.connected])
```

### Available Socket Events

| Event | Data | When it fires |
|-------|------|--------------|
| `applicationUpdated` | `{ status, updatedAt }` | Status change |
| `interviewScheduled` | `{ interviewDate, type }` | Interview booked |
| `paymentSuccess` | `{ amount, reference }` | Payment received |
| `statusChanged` | `{ status, reason }` | Any status change |
| `notification` | `{ type, message }` | Custom message |

---

## 💼 Dashboard Components

### Main User Dashboard

**Location:** `/src/pages/job-seeker/dashboard/index.tsx`

**Features:**
- Real-time socket listeners
- Stats cards (applications, interviews, offers)
- Application status display with colors
- Upcoming interviews
- Saved jobs
- Notifications center

**Access Routes:**
- `/job-seeker/dashboard` (Primary)
- `/user/dashboard` (Alias - redirects)

**Protected by:**
- Role-based guard (user only)
- Auth check
- Application status verification

---

## 📝 Application Form

### Safe Application Form Component

**Location:** `/src/components/SafeApplicationForm.tsx`

**Features:**
- File validation (PDF, max 5MB)
- Real-time validation with feedback
- Toast notifications for success/error
- Job title search dropdown
- Phone number & national ID inputs
- Document upload (CV, ID, Passport)
- Cover letter (optional)

### Usage

```tsx
import SafeApplicationForm from '@/components/SafeApplicationForm'

export default function ApplicationPage() {
  return (
    <SafeApplicationForm 
      onSuccess={() => router.push('/job-seeker/dashboard')} 
    />
  )
}
```

### Form Validation Rules

| Field | Required | Validation |
|-------|----------|-----------|
| Job Title | ✅ | Must select from dropdown |
| Phone | ✅ | Min 10 digits |
| National ID | ✅ | Non-empty string |
| CV | ✅ | PDF, max 5MB |
| National ID Doc | ✅ | PDF, max 5MB |
| Passport | ✅ | PDF, max 5MB |
| Cover Letter | ❌ | Any length |

---

## 🎉 Toast Notifications

### Success Notifications

```tsx
import toast from 'react-hot-toast'

// Application success
toast.success('🎉 Application submitted successfully!', {
  duration: 4000,
  position: 'top-center'
})

// File uploaded
toast.success('✅ CV uploaded successfully', {
  duration: 2000,
  icon: '📎'
})

// Real-time update
toast.success(`Status updated to: Shortlisted`, {
  duration: 5000,
  icon: '📩'
})
```

### Error Notifications

```tsx
toast.error('❌ Phone number is required', {
  duration: 3000
})

toast.error('❌ CV must be a PDF file', {
  duration: 4000
})
```

### Available Positions
- `top-center` (default)
- `top-left`
- `top-right`
- `bottom-center`
- `bottom-left`
- `bottom-right`

---

## 🎨 Status Colors

### Getting Status Color

```tsx
import { getStatusColor, getStatusLabel } from '@/utils/statusColors'

const status = 'shortlisted'
const colors = getStatusColor(status)
const label = getStatusLabel(status)

// colors = {
//   bg: 'bg-green-50',
//   text: 'text-green-800',
//   border: 'border-green-200',
//   badge: 'bg-green-100 text-green-700'
// }

// label = 'Shortlisted By HR'
```

### Status Options

```tsx
type ApplicationStatus = 
  | 'pending'              // ⏳ Yellow
  | 'reviewed'             // 👀 Blue
  | 'shortlisted'          // ✨ Green
  | 'interview_scheduled'  // 📞 Purple
  | 'interview_completed'  // ✅ Indigo
  | 'rejected'             // ❌ Red
  | 'offer_made'           // 🎉 Emerald
  | 'visa_ready'           // 🛫 Teal
```

### Display Status Badge

```tsx
<span className={getStatusColor(status).badge}>
  {getStatusLabel(status)}
</span>
```

---

## ❌ Error Handling

### File Validation Errors

```tsx
// File too large
"❌ CV is too large (6.5MB). Maximum size is 5MB."

// Wrong file type
"❌ CV must be a PDF file. You selected: application/msword"

// Required field missing
"❌ Phone number is required"
```

### API Errors

```tsx
// Network error
"❌ Network error. Please try again."

// 401 Unauthorized
"Authentication failed. Please login again."

// Form validation
"❌ Please select a job title"
```

### Error Display

```tsx
{error && (
  <div className="error-message" role="alert">
    {error}
  </div>
)}
```

---

## 📱 Responsive Design

### Breakpoints Used

```css
/* Mobile (default) */
.grid-cols-1

/* Tablet (md) */
@media (min-width: 768px) {
  .md:grid-cols-2
  .md:block (Sidebar)
}

/* Desktop and above */
max-w-7xl (Container)
```

### Mobile-First Structure

- Stack layout on mobile
- Sidebar hidden on mobile
- Full width on tablet+
- 2-column grid on tablet
- Full dashboard on desktop

---

## 🔒 Security Features

### Role-Based Access

```tsx
// Admin check (prevents admins from applying)
const storedUser = getStoredUser()
if (storedUser?.role === 'admin') {
  // Redirect to admin dashboard
}

// User check (prevents non-users from accessing)
if (user?.role !== 'user') {
  // Redirect to unauthorized
}
```

### Token Security

```tsx
// Axios automatically includes token
API.post('/applications', formData)
// Header: Authorization: Bearer <token>

// Socket auth
socket.auth = { token }
```

### File Security

```tsx
// Only PDF files allowed
file.type === 'application/pdf'

// Size limit 5MB
file.size <= 5 * 1024 * 1024

// Virus scanning on backend (implementation)
```

---

## 🧪 Testing

### Test User Dashboard
```bash
1. Login as user
2. Navigate to /user/dashboard
3. Verify real-time updates
4. Check socket listeners in console
```

### Test Application Form
```bash
1. Click "Apply Now" or go to /apply
2. Fill in all required fields
3. Upload valid PDF files
4. Submit and verify redirect
5. Check success toast appears
```

### Test Error Handling
```bash
1. Try submitting without files
2. Upload non-PDF file
3. Check error messages appear
4. Verify toast notifications
```

### Check Socket Connection
```javascript
// In browser console:
console.log(socket)  // Should show connected socket
socket.emit('ping', () => console.log('Pong!'))
```

---

## 🐛 Debugging Tips

### Console Logs

```tsx
// Auth logs
🔐 Dashboard checking auth...
🔄 User hasn't submitted application, redirecting...

// Socket logs
🔌 Setting up user socket listeners...
🔥 Application updated in real-time
📩 Application Updated: {...}

// Form logs
✅ Form validation passed
🎉 Application submitted successfully
```

### Chrome DevTools

1. **Application Tab:** Check localStorage for user & token
2. **Console Tab:** Look for 🔐, 🔌, 🔥 logs
3. **Network Tab:** Monitor API calls & socket events
4. **React DevTools:** Inspect component state

### LocalStorage Check

```javascript
// Check stored user
JSON.parse(localStorage.getItem('user'))

// Check token
localStorage.getItem('token')

// Check last application
JSON.parse(localStorage.getItem('latestApplication'))
```

---

## 📚 Additional Resources

- Socket.IO Documentation: https://socket.io/docs
- React-Hot-Toast: https://react-hot-toast.com
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion

---

## 🚀 Deployment Checklist

- [ ] Build completes without errors
- [ ] All socket listeners set up correctly
- [ ] Toast notifications appear
- [ ] Form validation works
- [ ] Redirects work properly
- [ ] Mobile responsive
- [ ] Error handling in place
- [ ] Production API endpoints configured
- [ ] Socket server endpoint configured
- [ ] All secrets/tokens secured
