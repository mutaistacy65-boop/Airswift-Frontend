# API Endpoints Quick Reference

Complete reference table of all backend API endpoints used across the Airswift platform.

---

## Authentication Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/auth/register` | POST | ❌ | `register.tsx` | User registration |
| `/api/auth/login` | POST | ❌ | `login.tsx` | User login |
| `/api/auth/verify-otp` | POST | ❌ | `verify-otp.tsx` | Email verification |
| `/api/auth/send-registration-otp` | POST | ❌ | `verify-otp.tsx` | Resend OTP |
| `/api/auth/me` | GET | ✅ | `AuthContext.tsx` | Get logged-in user |
| `/api/auth/profile` | GET | ✅ | `AuthContext.tsx` | Get user profile |
| `/api/auth/logout` | POST | ✅ | `Navbar.tsx` | Logout user |
| `/api/auth/refresh` | POST | ❌ | `apiClient.ts` | Refresh token |
| `/api/auth/forgot-password` | POST | ❌ | `forgot-password.tsx` | Password reset request |
| `/api/auth/reset-password/:token` | POST | ❌ | `reset-password/[token].tsx` | Reset password |
| `/api/auth/google/url` | GET | ❌ | `login.tsx` | Get Google OAuth URL |
| `/api/auth/google/callback` | GET | ❌ | (auto) | Google OAuth callback |
| `/api/auth/google/verify-id-token` | POST | ❌ | (auto) | Verify Google token |

---

## Profile Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/profile` | GET | ✅ | `profile.tsx` | Get user profile |
| `/api/profile` | PUT | ✅ | `profile.tsx` | Update user profile |
| `/api/profile/upload-cv` | POST | ✅ | `profile.tsx` | Upload CV |
| `/api/profile/upload-picture` | POST | ✅ | `profile.tsx` | Upload profile picture |

---

## Job Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/jobs` | GET | ❌ | `jobs/index.tsx` | Get all jobs |
| `/api/jobs/:id` | GET | ❌ | `jobs/[id].tsx` | Get job details |
| `/api/jobs/categories` | GET | ❌ | `jobs/index.tsx` | Get job categories |
| `/api/jobs` | POST | ✅ | `admin/jobs.tsx` | Create job (admin) |
| `/api/jobs/:id` | PUT | ✅ | `admin/jobs.tsx` | Update job (admin) |
| `/api/jobs/:id` | DELETE | ✅ | `admin/jobs.tsx` | Delete job (admin) |
| `/api/jobs/admin/all` | GET | ✅ | `admin/jobs.tsx` | Get all jobs (admin) |
| `/api/jobs/categories` | POST | ✅ | `admin/categories.tsx` | Create category (admin) |
| `/api/jobs/categories/:id` | PUT | ✅ | `admin/categories.tsx` | Update category (admin) |
| `/api/jobs/categories/:id` | DELETE | ✅ | `admin/categories.tsx` | Delete category (admin) |

---

## Application Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/applications/apply` | POST | ✅ | `jobs/apply/[id].tsx` | Submit job application |
| `/api/applications/my` | GET | ✅ | `job-seeker/applications.tsx` | Get my applications |
| `/api/applications/admin/all` | GET | ✅ | `admin/applications.tsx` | Get all applications (admin) |
| `/api/applications/:id/status` | PUT | ✅ | `admin/applications.tsx` | Update application status (admin) |
| `/api/applications/:id/schedule-interview` | POST | ✅ | `admin/interviews.tsx` | Schedule interview (admin) |
| `/api/applications/:id/attend-interview` | POST | ✅ | `job-seeker/interviews.tsx` | Mark interview attended |

---

## Interview Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/interviews/my` | GET | ✅ | `job-seeker/interviews.tsx` | Get my interviews |
| `/api/interviews/start-voice` | POST | ✅ | `VoiceInterview.tsx` | Start AI voice interview |
| `/api/interviews/ask` | POST | ✅ | `VoiceInterview.tsx` | Get interview question |
| `/api/interviews/answer` | POST | ✅ | `VoiceInterview.tsx` | Submit interview answer |
| `/api/interviews/score` | POST | ✅ | `VoiceInterview.tsx` | Score interview |
| `/api/interviews/:id/results` | GET | ✅ | `job-seeker/interviews.tsx` | Get interview results |
| `/api/interviews/:id/feedback` | POST | ✅ | `VoiceInterview.tsx` | Submit interview feedback |
| `/api/admin/interviews` | GET | ✅ | `admin/interviews.tsx` | Get all interviews (admin) |
| `/api/interviews/:id` | PUT | ✅ | `admin/interviews.tsx` | Update interview (admin) |

---

## Payment Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/payment/initiate` | POST | ✅ | `MpesaPaymentModal.tsx` | Initiate payment |
| `/api/payment/verify` | POST | ✅ | `MpesaPaymentModal.tsx` | Verify payment |
| `/api/payment/pay` | POST | ✅ | `MpesaPaymentModal.tsx` | Process payment |
| `/api/payment/callback` | POST | ❌ | (webhook) | M-Pesa callback |
| `/api/payment/:id` | GET | ✅ | `applications.tsx` | Get payment status |

---

## AI & Analysis Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/ai/recruiter-agent` | POST | ✅ | `admin/applications.tsx` | Run AI recruiter analysis |
| `/api/cv/analyze` | POST | ✅ | `CVAnalysis.tsx` | Analyze CV |
| `/api/ai/interview-score` | POST | ✅ | `VoiceInterview.tsx` | Score interview answers |

---

## Admin Dashboard Endpoints

| Endpoint | Method | Protected | Frontend File | Purpose |
|----------|--------|-----------|---------------|---------|
| `/api/admin/dashboard/stats` | GET | ✅ | `admin/dashboard/index.tsx` | Get dashboard statistics |
| `/api/admin/dashboard/interview-pipeline` | GET | ✅ | `admin/dashboard/index.tsx` | Get interview pipeline stats |
| `/api/admin/settings` | GET | ✅ | `admin/settings.tsx` | Get admin settings |
| `/api/admin/settings` | PUT | ✅ | `admin/settings.tsx` | Update admin settings |

---

## Endpoint Summary by User Journey

### 1️⃣ Registration Phase
```
POST   /api/auth/register
POST   /api/auth/send-registration-otp
POST   /api/auth/verify-otp
→ User account created, email verified
```

### 2️⃣ Login Phase
```
POST   /api/auth/login
GET    /api/auth/me
→ JWT token issued, session established
```

### 3️⃣ Profile Setup Phase
```
GET    /api/profile
PUT    /api/profile
POST   /api/profile/upload-cv
POST   /api/profile/upload-picture
→ Profile completed
```

### 4️⃣ Job Browsing Phase
```
GET    /api/jobs
GET    /api/jobs?page=1&limit=10
GET    /api/jobs/:id
GET    /api/jobs/categories
→ Job search & filter
```

### 5️⃣ Job Application Phase
```
POST   /api/applications/apply
→ Application submitted
```

### 6️⃣ Admin Review Phase
```
GET    /api/applications/admin/all
PUT    /api/applications/:id/status
POST   /api/ai/recruiter-agent
→ Status updated, candidate notified
```

### 7️⃣ Interview Phase
```
POST   /api/applications/:id/schedule-interview
GET    /api/interviews/my
POST   /api/interviews/ask
POST   /api/interviews/answer
POST   /api/interviews/score
GET    /api/interviews/:id/results
→ Interview completed
```

### 8️⃣ Payment Phase
```
POST   /api/payment/initiate
POST   /api/payment/verify
→ Visa fee paid
```

### 9️⃣ Hiring Phase
```
PUT    /api/applications/:id/status
→ Application status: hired
```

---

## Request/Response Status Codes

### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `204 No Content` - Success, no response body

### Client Error Codes
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate entry
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded

### Server Error Codes
- `500 Internal Server Error` - Server error
- `502 Bad Gateway` - Service unavailable
- `503 Service Unavailable` - Maintenance

---

## Common Request Headers

```javascript
// Standard headers for protected endpoints
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json",
  "Accept": "application/json"
}

// For file uploads
{
  "Authorization": "Bearer ...",
  "Content-Type": "multipart/form-data"
}
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 15 minutes |
| `/api/auth/register` | 10 attempts | 1 hour |
| General API | 100 requests | 1 minute |
| Payment endpoints | 10 requests | 1 hour |

---

## API Response Format

### Success Response
```javascript
{
  "message": "Operation successful",
  "data": {
    // Response data
  }
}

// or for single resource
{
  "id": 1,
  "name": "John",
  // ... field data
}

// or for list
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Error Response
```javascript
{
  "message": "Error description",
  "error": "ErrorCode",
  "statusCode": 400,
  "timestamp": "2026-04-05T10:00:00Z",
  "details": {
    "field": ["Error detail"]
  }
}
```

---

## Pagination

Most list endpoints support pagination:

```
GET /api/jobs?page=1&limit=10

Response:
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasMore": true
  }
}
```

---

## Filtering & Search

### Jobs Endpoint
```
GET /api/jobs?search=software&type=full-time&location=Toronto&page=1&limit=10
```

### Applications Endpoint
```
GET /api/applications/admin/all?status=pending&jobId=1&page=1&limit=20
```

### Common Filters
- `search` - Text search
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `status` - Status filter
- `type` - Type filter
- `date_from` - Date range start
- `date_to` - Date range end

---

## File Upload Specifications

### Supported Files
| Type | Extensions | Max Size |
|------|-----------|----------|
| CV | `.pdf` | 5MB |
| Passport | `.jpg`, `.png`, `.pdf` | 5MB |
| National ID | `.jpg`, `.png`, `.pdf` | 5MB |
| Certificates | `.jpg`, `.png`, `.pdf` | 5MB |
| Profile Picture | `.jpg`, `.png` | 2MB |

### Upload Endpoint Format
```
POST /api/endpoint
Content-Type: multipart/form-data

Form fields:
- file: [Binary file data]
- fieldName: value
- fieldName2: value
```

---

## WebSocket Events (Real-time)

### Interview Socket Events
```javascript
// Client → Server
socket.emit('interview:start', { sessionId, jobRole })
socket.emit('interview:answer', { audioBlob, transcript })
socket.emit('interview:complete', { sessionId })

// Server → Client
socket.on('interview:question', { question, number })
socket.on('interview:feedback', { score, comment })
socket.on('interview:timeout', {})
```

### Admin Dashboard Socket Events
```javascript
// Real-time updates
socket.on('application:updated', { applicationId, status })
socket.on('interview:scheduled', { applicationId, date })
socket.on('payment:received', { paymentId, amount })
```

---

## Testing API Endpoints

### Using cURL
```bash
# GET request
curl -X GET "https://api.example.com/api/endpoint" \
  -H "Authorization: Bearer TOKEN"

# POST request
curl -X POST "https://api.example.com/api/endpoint" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"field": "value"}'

# File upload
curl -X POST "https://api.example.com/api/endpoint" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### Using Postman
1. Create collection "Airswift API"
2. Set base URL: `https://airswift-backend-fjt3.onrender.com`
3. Add Authorization header with Bearer token
4. Create requests for each endpoint
5. Use environment variables for URLs and tokens

---

## Common Errors & Solutions

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Invalid credentials | 400 | Wrong email/password | Verify credentials |
| Email already exists | 409 | Duplicate registration | Use different email |
| Not authenticated | 401 | Missing token | Login first |
| Access denied | 403 | Insufficient permissions | Check user role |
| Not found | 404 | Resource doesn't exist | Verify ID/endpoint |
| Too many requests | 429 | Rate limit exceeded | Wait and retry |
| Field validation | 422 | Invalid input format | Check field format |

---

## API Documentation Links

- **Backend API**  Docs: See backend repository README
- **OpenAPI Spec**: `/api/swagger` (if available)
- **Postman Collection**: Available in backend repo

---

## Quick Copy-Paste URLs

```
Development:
http://localhost:5000/api

Production:
https://airswift-backend-fjt3.onrender.com/api

Staging:
https://airswift-backend-staging.herokuapp.com/api
```

---

## Last Updated
April 5, 2026

## Version
1.0.0

