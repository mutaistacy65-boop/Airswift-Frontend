# Frontend-to-Backend API Mapping Reference

Quick reference guide showing which frontend components and pages call which backend endpoints.

---

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Profile Management](#profile-management)
3. [Job Browsing](#job-browsing)
4. [Job Applications](#job-applications)
5. [Interviews](#interviews)
6. [Payments](#payments)
7. [Admin Operations](#admin-operations)

---

## Authentication Flow

### Registration Page
**File:** `src/pages/register.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Submit registration | `POST /api/auth/register` | POST | `handleSubmit` |
| Verify OTP | `POST /api/auth/verify-otp` | POST | (page: verify-otp.tsx) |
| Resend OTP | `POST /api/auth/send-registration-otp` | POST | `resend()` |

**Service:** `src/services/authService.ts`
```typescript
register(name, email, password)
```

**API Helper:** `src/api/auth.ts`
```typescript
registerUser(formData)
verifyOTP(email, otp)
```

---

### Login Page
**File:** `src/pages/login.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Login with email/password | `POST /api/auth/login` | POST | `handleLogin` |
| Get Google OAuth URL | `GET /api/auth/google/url` | GET | `signIn('google')` |
| Handle OAuth callback | `GET /api/auth/google/callback` | GET | (auto-handled) |
| Verify Google token | `POST /api/auth/google/verify-id-token` | POST | (auto-handled) |

**Service:** `src/services/authService.ts`
```typescript
login(email, password)
getToken()
isAuthenticated()
getStoredUser()
```

---

### Password Recovery
**Files:** 
- `src/pages/forgot-password.tsx`
- `src/pages/reset-password/[token].tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Send reset email | `POST /api/auth/forgot-password` | POST | `handleSubmit` |
| Reset password | `POST /api/auth/reset-password/:token` | POST | `handleReset` |

---

### Session Management
**File:** `src/context/AuthContext.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Check auth status | `GET /api/auth/me` | GET | `verifyAuthStatus()` |
| Logout | `POST /api/auth/logout` | POST | `logout()` |
| Refresh token | `POST /api/auth/refresh` | POST | (auto via interceptor) |

**Interceptor:** `src/services/apiClient.ts`
```typescript
// Auto-handles 401 responses
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      return refreshToken()
    }
  }
)
```

---

## Profile Management

### Profile Setup Page
**File:** `src/pages/job-seeker/profile.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get profile | `GET /api/profile` | GET | `useEffect` → `loadUser()` |
| Update profile | `PUT /api/profile` | PUT | `handleSaveProfile()` |
| Upload CV | `POST /api/profile/upload-cv` | POST | `handleCVUpload()` |
| Upload picture | `POST /api/profile/upload-picture` | POST | `handlePictureUpload()` |
| Analyze CV | (triggered on upload) | - | Auto-triggered |

**Service:** `src/services/jobService.ts`
```typescript
// Profile operations
```

**Component:** `src/components/CVAnalysis.tsx`
```typescript
analyzeCv(file)
```

---

## Job Browsing

### Jobs List Page
**File:** `src/pages/jobs/index.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get all jobs | `GET /api/jobs?page=1&limit=10` | GET | `fetchJobs()` |
| Search jobs | `GET /api/jobs?search=keyword` | GET | `fetchJobs()` |
| Filter by type | `GET /api/jobs?type=full-time` | GET | `fetchJobs()` |
| Get categories | `GET /api/jobs/categories` | GET | `useEffect` |

**Service:** `src/services/jobService.ts`
```typescript
getAllJobs(page, limit)
searchJobs(query, filters)
```

---

### Job Details Page
**File:** `src/pages/jobs/[id].tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get job details | `GET /api/jobs/:id` | GET | `fetchJob()` |

**Service:** `src/services/jobService.ts`
```typescript
getJobById(id)
```

---

## Job Applications

### Application Form
**File:** `src/pages/jobs/apply/[id].tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Submit application | `POST /api/applications/apply` | POST | `handleSubmit()` |
| Upload documents | (multipart with apply) | - | (included in apply) |

**Service:** `src/services/jobService.ts`
```typescript
applyForJob(jobId, applicationData)
```

**Components Used:**
- `src/components/DocumentUpload.tsx` - File upload
- `src/components/SearchableSelect.tsx` - Category selection
- `src/components/Textarea.tsx` - Cover letter

---

### My Applications Page (Job Seeker)
**File:** `src/pages/job-seeker/applications.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get my applications | `GET /api/applications/my` | GET | `fetchApplications()` |
| Initiate payment | `POST /api/payment/initiate` | POST | `handlePayment()` |
| Verify payment | `POST /api/payment/verify` | POST | (auto after STK) |

**Service:** `src/services/jobService.ts`
```typescript
getMyApplications()
```

**Service:** `src/services/paymentService.ts`
```typescript
initiatePayment(paymentData)
verifyPayment(transactionId)
initiateMpesaPayment(phone, amount, desc, type)
```

**Component:** `src/components/MpesaPaymentModal.tsx`
```typescript
handlePayment(phoneNumber)
```

**Component:** `src/components/Timeline.tsx`
- Displays application status timeline

---

### Admin Applications Page
**File:** `src/pages/admin/applications.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get all applications | `GET /api/applications/admin/all` | GET | `fetchApplications()` |
| Update status | `PUT /api/applications/:id/status` | PUT | `updateStatus()` |
| Run AI analysis | `POST /api/ai/recruiter-agent` | POST | `analyzeWithAI()` |

**Service:** `src/services/adminService.ts`
```typescript
getAllApplications(page, limit)
updateApplicationStatus(id, status)
```

**Component:** `src/components/CVAnalysis.tsx`
- Show CV analysis results

---

## Interviews

### My Interviews Page (Job Seeker)
**File:** `src/pages/job-seeker/interviews.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get my interviews | `GET /api/interviews/my` | GET | `fetchApplications()` |
| Join video interview | (external link) | - | `handleJoinInterview()` |
| Start AI voice interview | `POST /api/interviews/start-voice` | POST | `startVoiceInterview()` |

**Service:** `src/services/interviewService.ts`
```typescript
getMyInterviews()
startVoiceInterview(applicationId, jobRole)
getInterviewResults(interviewId)
submitInterviewFeedback(interviewId, feedback)
```

---

### Voice Interview Component
**File:** `src/components/VoiceInterview.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Ask question | `POST /api/interviews/ask` | POST | `askQuestion()` |
| Submit answer | `POST /api/interviews/answer` | POST | `submitAnswer()` |
| Score interview | `POST /api/interviews/score` | POST | `endInterview()` |
| Get results | `GET /api/interviews/:id/results` | GET | `getResults()` |

**WebSocket Events:**
```
Socket.io for real-time communication
- interview:start
- interview:question
- interview:answer
- interview:complete
```

---

### Admin Interviews Page
**File:** `src/pages/admin/interviews.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get interviews | `GET /api/admin/interviews` | GET | `fetchInterviews()` |
| Schedule interview | `POST /api/applications/:id/schedule-interview` | POST | `scheduleInterview()` |
| Reschedule interview | `PUT /api/interviews/:id` | PUT | `rescheduleInterview()` |
| Complete interview | `POST /api/applications/:id/attend-interview` | POST | `markComplete()` |

**Service:** `src/services/adminService.ts`
```typescript
scheduleInterview(applicationId, interviewData)
getInterviews(page, limit)
updateInterview(id, interviewData)
```

---

## Payments

### Payment Modal
**File:** `src/components/MpesaPaymentModal.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Initiate payment | `POST /api/payment/initiate` | POST | `handleConfirm()` |
| Verify payment | `POST /api/payment/verify` | POST | (auto-triggered) |

**Service:** `src/services/paymentService.ts`
```typescript
initiatePayment(paymentData)
verifyPayment(transactionId)
initiateMpesaPayment(phoneNumber, amount, description, type)
```

**Validation:**
- Phone number format validation
- Amount verification
- Payment method validation

---

### Payment Success Page
**File:** `src/pages/job-seeker/payment-success.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Display success | (URL params) | - | `useEffect()` |
| Download receipt | (generate locally) | - | `handleDownloadReceipt()` |

**Data Source:**
- URL query parameters: `transaction_id`, `amount`, `service`
- localStorage fallback

---

## Admin Operations

### Admin Dashboard
**File:** `src/pages/admin/dashboard/index.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get dashboard stats | `GET /api/admin/dashboard/stats` | GET | `fetchStats()` |
| Get interview pipeline | `GET /api/admin/dashboard/interview-pipeline` | GET | `fetchPipeline()` |
| Get applications | `GET /api/applications/admin/all` | GET | `fetchApplications()` |
| Get all jobs | `GET /api/jobs/admin/all` | GET | `fetchJobs()` |

**Real-time WebSocket:**
```
Socket.io for live updates:
- applications:update
- interviews:schedule
- payments:complete
```

---

### Admin Jobs Page
**File:** `src/pages/admin/jobs.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get all jobs | `GET /api/jobs/admin/all` | GET | `fetchJobs()` |
| Create job | `POST /api/jobs` | POST | `handleCreateJob()` |
| Update job | `PUT /api/jobs/:id` | PUT | `handleEditJob()` |
| Delete job | `DELETE /api/jobs/:id` | DELETE | `handleDeleteJob()` |
| Get categories | `GET /api/jobs/categories` | GET | `useEffect()` |

**Service:** `src/services/adminService.ts`
```typescript
createJob(jobData)
updateJob(id, jobData)
deleteJob(id)
```

---

### Admin Categories Page
**File:** `src/pages/admin/categories.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get categories | `GET /api/jobs/categories` | GET | `fetchCategories()` |
| Create category | `POST /api/jobs/categories` | POST | `handleCreate()` |
| Update category | `PUT /api/jobs/categories/:id` | PUT | `handleEdit()` |
| Delete category | `DELETE /api/jobs/categories/:id` | DELETE | `handleDelete()` |

---

### Admin Settings Page
**File:** `src/pages/admin/settings.tsx`

| Action | Endpoint | Method | Frontend Function |
|--------|----------|--------|------------------|
| Get settings | `GET /api/admin/settings` | GET | `fetchSettings()` |
| Update settings | `PUT /api/admin/settings` | PUT | `handleSaveSettings()` |

**Service:** `src/services/adminService.ts`
```typescript
getSettings()
updateSettings(settingsData)
```

**Component:** `src/components/AdminSettingsPanel.tsx`

---

## Error Handling & Interceptors

### API Client Interceptor
**File:** `src/services/apiClient.ts`

**Implementation:**
```typescript
// Request Interceptor
API.interceptors.request.use((config) => {
  const token = AuthService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired - attempt refresh
      return refreshToken().then(() => {
        return API(error.config)
      }).catch(() => {
        // Redirect to login
        window.location.href = '/login'
        return Promise.reject(error)
      })
    }
    return Promise.reject(error)
  }
)
```

### Notification System
**File:** `src/context/NotificationContext.tsx`

**Usage in API Calls:**
```typescript
try {
  const data = await jobService.methodName()
  addNotification('Success message', 'success')
} catch (error) {
  addNotification(error.message, 'error')
}
```

---

## Protected Routes

### Route Protection Hook
**File:** `src/hooks/useProtectedRoute.ts`

```typescript
const { isAuthorized, isLoading } = useProtectedRoute('admin' | 'user')

// Checks:
// 1. User is authenticated (token exists)
// 2. User has required role
// 3. Redirects to login if unauthorized
// 4. Redirects to appropriate dashboard if wrong role
```

**Usage:**
```typescript
export default function AdminPage() {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  
  if (!isAuthorized) return <Loader fullScreen />
  
  return <AdminDashboard />
}
```

---

## API Utilities

### API Fetch Utility
**File:** `src/utils/api.js`

```typescript
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken')
  
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    credentials: 'include',
  })
  
  // Handle 401 and refresh token
  // Return parsed JSON
}
```

### Auth Utilities
**File:** `src/utils/auth.js`

```typescript
const getUserFromToken = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch (error) {
    return null
  }
}
```

---

## Environment Configuration

**File:** `.env.local`

```env
NEXT_PUBLIC_API_URL=https://airswift-backend-fjt3.onrender.com
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

---

## Quick Start API Integration

### 1. Create a New API Service
```typescript
// src/services/newService.ts
import API from './apiClient'

export const newService = {
  getResource: async (id) => {
    const response = await API.get(`/endpoint/${id}`)
    return response.data
  },
  
  createResource: async (data) => {
    const response = await API.post('/endpoint', data)
    return response.data
  }
}
```

### 2. Use in Component
```typescript
import { newService } from '@/services/newService'

function MyComponent() {
  const [data, setData] = useState(null)
  const { addNotification } = useNotification()
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await newService.getResource(id)
        setData(result)
        addNotification('Success!', 'success')
      } catch (error) {
        addNotification(error.message, 'error')
      }
    }
    fetch()
  }, [])
}
```

### 3. Add Protected Route
```typescript
import { useProtectedRoute } from '@/hooks/useProtectedRoute'

function MyPage() {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  
  if (isLoading) return <Loader />
  if (!isAuthorized) return <Redirect to="/login" />
  
  return <YourComponent />
}
```

---

## Troubleshooting

### Common API Issues

**Token Expired:**
- Interceptor automatically attempts refresh
- If refresh fails, redirects to login

**CORS Errors:**
- Check backend CORS configuration
- Verify API URL in `.env.local`

**401 Unauthorized:**
- Token missing or invalid
- Check localStorage for token
- Clear browser cache and retry

**Network Errors:**
- Verify backend is running
- Check API_URL in environment
- Check internet connection

---

## References

- [Backend API Routes Documentation](./BACKEND_API_ROUTES.md)
- [Frontend Implementation Guide](./WEBSITE_FLOW_IMPLEMENTATION.md)
- [Frontend Visual Map](./WEBSITE_FLOW_VISUAL_MAP.md)

