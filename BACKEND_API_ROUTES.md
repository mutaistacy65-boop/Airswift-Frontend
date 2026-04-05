# Backend API Routes - Full Flow Documentation

This document maps all backend API endpoints used throughout the Airswift platform, organized by user journey stage.

**Backend URL:** `https://airswift-backend-fjt3.onrender.com`

---

## Table of Contents

1. [Authentication APIs](#1-authentication-apis)
2. [Profile APIs](#2-profile-apis)
3. [Job APIs](#3-job-apis)
4. [Application APIs](#4-application-apis)
5. [Interview APIs](#5-interview-apis)
6. [Payment APIs](#6-payment-apis)
7. [Admin APIs](#7-admin-apis)
8. [Error Handling](#error-handling)
9. [Request/Response Examples](#requestresponse-examples)

---

## 1. Authentication APIs

### 1.1 User Registration

**Endpoint:** `POST /api/auth/register`

**Frontend:** [src/pages/register.tsx](src/pages/register.tsx)

**Request:**
```javascript
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```javascript
{
  "message": "User registered successfully! OTP sent to email.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "2026-04-05T10:32:46.104Z"
  }
}
```

**Error (400):**
```javascript
{
  "message": "Email already registered",
  "error": "EmailAlreadyExists"
}
```

**Implementation Details:**
- Email validation
- Password hashing (bcrypt)
- OTP generation and email dispatch
- User account creation with `isVerified: false`
- Backend sends OTP via email

---

### 1.2 OTP Verification

**Endpoint:** `POST /api/auth/verify-otp`

**Frontend:** [src/pages/verify-otp.tsx](src/pages/verify-otp.tsx)

**Request:**
```javascript
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```javascript
{
  "message": "Email verified successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "isVerified": true,
    "role": "user"
  }
}
```

**Error (400):**
```javascript
{
  "message": "Invalid OTP",
  "error": "InvalidOTP"
}
```

**Implementation Details:**
- OTP validation (6-digit, time-limited)
- Sets `isVerified: true` on user
- Clears OTP from database
- Ready for login

---

### 1.3 User Login

**Endpoint:** `POST /api/auth/login`

**Frontend:** [src/pages/login.tsx](src/pages/login.tsx)

**Request:**
```javascript
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```javascript
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (400):**
```javascript
{
  "message": "Invalid credentials",
  "error": "InvalidCredentials"
}
```

**Error (400) - Not Verified:**
```javascript
{
  "message": "Please verify your email first",
  "error": "EmailNotVerified"
}
```

**Storage:**
```javascript
// Frontend stores
localStorage.setItem('token', accessToken)
localStorage.setItem('user', JSON.stringify(user))
```

**Rate Limiting:**
- 5 failed attempts → 15 minute lockout
- IP-based throttling

---

### 1.4 Get User Profile (Protected)

**Endpoint:** `GET /api/auth/me` or `GET /api/auth/profile`

**Frontend:** [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```javascript
{
  "message": "User profile",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": true,
    "phone": "+1234567890",
    "location": "New York, USA",
    "bio": "Software Developer",
    "skills": ["Python", "JavaScript", "React"],
    "experience": "5 years",
    "education": "Bachelor's in CS",
    "profileImage": "https://..."
  }
}
```

**Error (401):**
```javascript
{
  "message": "Not authenticated",
  "error": "Unauthorized"
}
```

**Implementation:**
- JWT validation
- User data retrieval
- Session verification

---

### 1.5 User Logout

**Endpoint:** `POST /api/auth/logout`

**Frontend:** [src/components/Navbar.tsx](src/components/Navbar.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```javascript
{
  "message": "Logged out successfully"
}
```

**Frontend Implementation:**
```typescript
localStorage.removeItem('token')
localStorage.removeItem('user')
sessionStorage.removeItem('accessToken')
// Redirect to /login
```

---

### 1.6 Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Frontend:** [src/services/apiClient.ts](src/services/apiClient.ts)

**Request:**
```javascript
{
  "refreshToken": "refresh-token-value"
}
```

**Response (200):**
```javascript
{
  "accessToken": "new-access-token-here"
}
```

**Interceptor Implementation:**
```typescript
// Auto-triggered on 401 response
if (error.response?.status === 401) {
  // Attempt refresh
  await refreshToken()
  // Retry original request
  return API(originalRequest)
}
```

---

### 1.7 Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Frontend:** [src/pages/forgot-password.tsx](src/pages/forgot-password.tsx)

**Request:**
```javascript
{
  "email": "john@example.com"
}
```

**Response (200):**
```javascript
{
  "message": "Reset link sent to your email"
}
```

**Duration:** Link valid for 1 hour

---

### 1.8 Reset Password

**Endpoint:** `POST /api/auth/reset-password/:token`

**Frontend:** [src/pages/reset-password/[token].tsx](src/pages/reset-password/[token].tsx)

**Request:**
```javascript
{
  "password": "NewSecurePassword123!"
}
```

**Response (200):**
```javascript
{
  "message": "Password reset successfully"
}
```

---

### 1.9 Google OAuth URLs

**Endpoint (Get Auth URL):** `GET /api/auth/google/url`

**Endpoint (Callback):** `GET /api/auth/google/callback`

**Flow:**
```
1. Frontend: GET /api/auth/google/url
   Returns: { authUrl: "https://accounts.google.com/...?..." }

2. Frontend: Redirect user to authUrl

3. User: Sign in with Google

4. Google: Redirects to /api/auth/google/callback?code=...

5. Backend: Exchanges code for ID token
   Returns: { accessToken: "...", user: {...} }

6. Frontend: Stores token in localStorage
```

---

## 2. Profile APIs

### 2.1 Get User Profile

**Endpoint:** `GET /api/profile`

**Frontend:** [src/pages/job-seeker/profile.tsx](src/pages/job-seeker/profile.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token"
}
```

**Response (200):**
```javascript
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "New York, USA",
  "bio": "Experienced software developer",
  "skills": ["Python", "JavaScript", "React"],
  "experience": "5 years",
  "education": "Bachelor's in Computer Science",
  "profileImage": "https://...",
  "cvUrl": "https://...",
  "cvAnalysis": {
    "score": 85,
    "skills": ["Python", "JavaScript"],
    "recommendation": "hire"
  }
}
```

---

### 2.2 Update User Profile

**Endpoint:** `PUT /api/profile`

**Frontend:** [src/pages/job-seeker/profile.tsx](src/pages/job-seeker/profile.tsx)

**Request:**
```javascript
{
  "name": "John Doe",
  "phone": "+1234567890",
  "location": "New York, USA",
  "bio": "Updated bio",
  "skills": ["Python", "JavaScript", "React"],
  "experience": "5 years",
  "education": "Bachelor's in CS"
}
```

**Response (200):**
```javascript
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    // ... updated fields
  }
}
```

---

### 2.3 Upload CV

**Endpoint:** `POST /api/profile/upload-cv`

**Frontend:** [src/pages/job-seeker/profile.tsx](src/pages/job-seeker/profile.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token",
  "Content-Type": "multipart/form-data"
}
```

**Request:**
```
multipart/form-data
file: [PDF document]
```

**Response (200):**
```javascript
{
  "message": "CV uploaded successfully",
  "cvUrl": "https://...",
  "analysis": {
    "score": 85,
    "extractedSkills": ["Python", "JavaScript", "React"],
    "summary": "Strong backend developer with 5 years experience",
    "recommendation": "hire"
  }
}
```

**Processing:**
- PDF parsing and text extraction
- AI CV analysis using OpenAI
- Skill extraction
- Match scoring

---

### 2.4 Upload Profile Picture

**Endpoint:** `POST /api/profile/upload-picture`

**Request:**
```
multipart/form-data
file: [Image file - JPG/PNG]
```

**Response (200):**
```javascript
{
  "message": "Profile picture updated",
  "profileImageUrl": "https://..."
}
```

---

## 3. Job APIs

### 3.1 Get All Jobs

**Endpoint:** `GET /api/jobs`

**Frontend:** [src/pages/jobs/index.tsx](src/pages/jobs/index.tsx)

**Query Parameters:**
```
GET /api/jobs?page=1&limit=10&search=software&type=full-time
```

**Response (200):**
```javascript
{
  "jobs": [
    {
      "id": 1,
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "Toronto, Canada",
      "salary": "$120,000 - $150,000 CAD",
      "jobType": "full-time",
      "description": "We are looking for...",
      "requirements": ["5+ years experience", "JavaScript", "React"],
      "benefits": ["Health insurance", "401k", "Remote work"],
      "postedDate": "2026-04-01T10:00:00Z",
      "isActive": true,
      "applicationCount": 45
    },
    // ... more jobs
  ],
  "total": 120,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

**Filters:**
- `search` - Search by title/company
- `type` - Job type (full-time, part-time, etc.)
- `location` - Location filter
- `salary_min` - Minimum salary
- `salary_max` - Maximum salary
- `page` - Pagination
- `limit` - Results per page

---

### 3.2 Get Job Details

**Endpoint:** `GET /api/jobs/:id`

**Frontend:** [src/pages/jobs/[id].tsx](src/pages/jobs/[id].tsx)

**Response (200):**
```javascript
{
  "id": 1,
  "title": "Senior Software Engineer",
  "company": {
    "name": "Tech Corp",
    "logo": "https://...",
    "website": "https://techcorp.com",
    "description": "Leading tech company...",
    "rating": 4.5
  },
  "location": "Toronto, Canada",
  "salary": "$120,000 - $150,000 CAD",
  "jobType": "full-time",
  "description": "Full job description...",
  "responsibilities": ["Lead development team", "Code reviews", "..."],
  "requirements": ["5+ years experience", "JavaScript", "React", "..."],
  "benefits": ["Health insurance", "401k", "Remote work", "..."],
  "postedDate": "2026-04-01T10:00:00Z",
  "deadline": "2026-05-01T00:00:00Z",
  "isActive": true,
  "visaSponsored": true,
  "applicationCount": 45
}
```

---

### 3.3 Get Job Categories

**Endpoint:** `GET /api/jobs/categories`

**Frontend:** [src/pages/jobs/index.tsx](src/pages/jobs/index.tsx)

**Response (200):**
```javascript
{
  "categories": [
    {
      "id": 1,
      "name": "Engineering",
      "count": 234
    },
    {
      "id": 2,
      "name": "Healthcare",
      "count": 156
    },
    // ... more categories
  ]
}
```

---

### 3.4 Search Jobs (Admin)

**Endpoint:** `GET /api/jobs/admin/all`

**Frontend:** [src/pages/admin/jobs.tsx](src/pages/admin/jobs.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token" // Admin only
}
```

**Response:** Same as 3.1 but with admin fields

---

## 4. Application APIs

### 4.1 Apply for Job

**Endpoint:** `POST /api/applications/apply`

**Frontend:** [src/pages/jobs/apply/[id].tsx](src/pages/jobs/apply/[id].tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token",
  "Content-Type": "multipart/form-data"
}
```

**Request:**
```
multipart/form-data
jobId: "1"
coverLetter: "I am very interested..."
cv: [File]
passport: [File]
nationalId: [File]
certificates: [File] (optional, array)
```

**Response (200):**
```javascript
{
  "message": "Application submitted successfully",
  "application": {
    "id": 1,
    "jobId": 1,
    "userId": 1,
    "status": "pending",
    "appliedDate": "2026-04-05T10:00:00Z",
    "documents": {
      "cv": "https://...",
      "passport": "https://...",
      "nationalId": "https://...",
      "certificates": ["https://..."]
    },
    "coverLetter": "I am very interested...",
    "cvScore": 85,
    "matchScore": 92
  }
}
```

**Validations:**
- Job must be active
- User not already applied
- All required documents present
- File size < 5MB
- File format valid

**Backend Processing:**
1. Validate job is active
2. Check for duplicate application
3. Encrypt documents
4. Run AI CV analysis
5. Calculate match score
6. Create application record
7. Send confirmation email
8. Update job application count

---

### 4.2 Get My Applications

**Endpoint:** `GET /api/applications/my`

**Frontend:** [src/pages/job-seeker/applications.tsx](src/pages/job-seeker/applications.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token"
}
```

**Response (200):**
```javascript
{
  "applications": [
    {
      "id": 1,
      "jobId": 1,
      "jobTitle": "Senior Software Engineer",
      "company": "Tech Corp",
      "status": "pending",
      "appliedDate": "2026-04-05T10:00:00Z",
      "documents": {
        "cv": "https://...",
        "passport": "https://...",
        "nationalId": "https://..."
      },
      "cvScore": 85,
      "matchScore": 92,
      "interviewDetails": {
        "scheduled": false,
        "zoomLink": null,
        "date": null
      },
      "paymentDetails": {
        "status": "not_required",
        "amount": null
      }
    },
    // ... more applications
  ],
  "total": 5
}
```

**Note:** Status can be:
- `pending` - Waiting for review
- `reviewed` - Admin reviewed
- `accepted` - Shortlisted
- `interview_scheduled` - Interview scheduled
- `interview_completed` - Interview done
- `visa_payment_pending` - Ready to pay visa fee
- `visa_processing` - Visa being processed
- `visa_ready` - Visa approved
- `rejected` - Application rejected

---

### 4.3 Get All Applications (Admin)

**Endpoint:** `GET /api/applications/admin/all`

**Frontend:** [src/pages/admin/applications.tsx](src/pages/admin/applications.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token" // Admin only
}
```

**Query Parameters:**
```
GET /api/applications/admin/all?page=1&limit=20&status=pending&jobId=1
```

**Response (200):** Same structure as 4.2 but with all candidate applications

---

### 4.4 Update Application Status (Admin)

**Endpoint:** `PUT /api/applications/:id/status`

**Frontend:** [src/pages/admin/applications.tsx](src/pages/admin/applications.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token" // Admin only
}
```

**Request:**
```javascript
{
  "status": "accepted",
  "notes": "Strong profile, proceeding to interview"
}
```

**Response (200):**
```javascript
{
  "message": "Application status updated",
  "application": {
    "id": 1,
    "status": "accepted",
    "updatedAt": "2026-04-05T12:00:00Z"
  }
}
```

**Backend Actions:**
1. Validate new status
2. Update application status
3. Send notification email to candidate
4. If status is `visa_payment_pending`, create payment record
5. Log status change for audit trail

---

### 4.5 Schedule Interview (Admin)

**Endpoint:** `POST /api/applications/:id/schedule-interview`

**Frontend:** [src/pages/admin/interviews.tsx](src/pages/admin/interviews.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token" // Admin only
}
```

**Request:**
```javascript
{
  "interviewDate": "2026-04-20T14:00:00Z",
  "interviewType": "video",
  "zoomLink": "https://zoom.us/...",
  "jobRole": "Senior Software Engineer",
  "notes": "Please test your audio/video before joining"
}
```

**Response (200):**
```javascript
{
  "message": "Interview scheduled",
  "interview": {
    "id": 1,
    "applicationId": 1,
    "date": "2026-04-20T14:00:00Z",
    "type": "video",
    "zoomLink": "https://zoom.us/...",
    "status": "scheduled"
  }
}
```

**Backend Actions:**
1. Validate interview date
2. Create interview record
3. Update application status to `interview_scheduled`
4. Send interview invitation email
5. Add reminder notification

---

### 4.6 Mark Interview Attended (Candidate)

**Endpoint:** `POST /api/applications/:id/attend-interview`

**Request:**
```javascript
{
  "attended": true,
  "notes": "Interview completed successfully"
}
```

**Response (200):**
```javascript
{
  "message": "Interview attendance recorded"
}
```

---

## 5. Interview APIs

### 5.1 Get My Interviews

**Endpoint:** `GET /api/interviews/my`

**Frontend:** [src/pages/job-seeker/interviews.tsx](src/pages/job-seeker/interviews.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token"
}
```

**Response (200):**
```javascript
{
  "interviews": [
    {
      "id": 1,
      "applicationId": 1,
      "jobTitle": "Senior Software Engineer",
      "company": "Tech Corp",
      "date": "2026-04-20T14:00:00Z",
      "type": "video",
      "zoomLink": "https://zoom.us/...",
      "status": "scheduled",
      "completed": false,
      "feedback": null
    },
    // ... more interviews
  ]
}
```

---

### 5.2 Ask Interview Question (AI)

**Endpoint:** `POST /api/interviews/ask`

**Frontend:** [src/components/VoiceInterview.tsx](src/components/VoiceInterview.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token",
  "Content-Type": "application/json"
}
```

**Request:**
```javascript
{
  "sessionId": "interview-session-123",
  "jobRole": "Senior Software Engineer",
  "questionNumber": 1
}
```

**Response (200):**
```javascript
{
  "question": "Tell me about your experience with React and state management",
  "questionNumber": 1,
  "totalQuestions": 5
}
```

**AI Implementation:**
- Uses OpenAI API
- Context-aware questions based on job role
- Difficulty adaptive
- Response analysis ready

---

### 5.3 Submit Interview Answer

**Endpoint:** `POST /api/interviews/answer`

**Frontend:** [src/components/VoiceInterview.tsx](src/components/VoiceInterview.tsx)

**Request:**
```javascript
{
  "sessionId": "interview-session-123",
  "questionNumber": 1,
  "audioBlob": "base64-encoded-audio",
  "transcript": "Full text of audio response",
  "duration": 45
}
```

**Response (200):**
```javascript
{
  "message": "Answer recorded",
  "nextQuestion": {
    "question": "Describe your approach to debugging...",
    "questionNumber": 2
  }
}
```

---

### 5.4 Score Interview

**Endpoint:** `POST /api/interviews/score`

**Frontend:** Auto-triggered after interview completion

**Request:**
```javascript
{
  "sessionId": "interview-session-123",
  "interviewData": {
    "answers": [...],
    "duration": 600,
    "completionPercentage": 100
  }
}
```

**Response (200):**
```javascript
{
  "score": {
    "overall": 82,
    "communicationSkills": 85,
    "technicalKnowledge": 80,
    "confidence": 78,
    "clarity": 88,
    "relevance": 80
  },
  "feedback": "Strong technical background with excellent communication skills...",
  "recommendation": "Consider for hire",
  "summary": "Candidate demonstrated solid understanding of React and good problem-solving abilities..."
}
```

---

### 5.5 Get Interview Results

**Endpoint:** `GET /api/interviews/:id/results`

**Frontend:** [src/pages/job-seeker/interviews.tsx](src/pages/job-seeker/interviews.tsx)

**Response (200):**
```javascript
{
  "interview": {
    "id": 1,
    "applicationId": 1,
    "date": "2026-04-20T14:00:00Z",
    "completed": true,
    "score": 82,
    "feedback": "Strong candidate with good communication...",
    "duration": 600,
    "questionsAsked": 5,
    "transcripts": [...],
    "recommendation": "Consider for hire"
  }
}
```

---

## 6. Payment APIs

### 6.1 Initiate Payment

**Endpoint:** `POST /api/payment/initiate`

**Frontend:** [src/components/MpesaPaymentModal.tsx](src/components/MpesaPaymentModal.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token",
  "Content-Type": "application/json"
}
```

**Request:**
```javascript
{
  "applicationId": 1,
  "amount": 30000,
  "currency": "KES",
  "phoneNumber": "254712345678",
  "paymentMethod": "mpesa",
  "paymentType": "visa_processing"
}
```

**Response (200):**
```javascript
{
  "message": "Payment initiated",
  "payment": {
    "id": 1,
    "transactionId": "MPY_230234857263847",
    "applicationId": 1,
    "amount": 30000,
    "currency": "KES",
    "status": "pending",
    "paymentMethod": "mpesa",
    "phoneNumber": "254712345678",
    "createdAt": "2026-04-05T10:00:00Z"
  }
}
```

**M-Pesa Flow:**
1. Backend initiates M-Pesa STK push
2. Customer receives STK prompt on phone
3. Customer enters PIN
4. Payment processed
5. Callback received

---

### 6.2 Verify Payment

**Endpoint:** `POST /api/payment/verify`

**Frontend:** Called after payment completion

**Request:**
```javascript
{
  "transactionId": "MPY_230234857263847"
}
```

**Response (200):**
```javascript
{
  "message": "Payment verified successfully",
  "payment": {
    "id": 1,
    "transactionId": "MPY_230234857263847",
    "status": "completed",
    "verifiedAt": "2026-04-05T10:05:00Z"
  }
}
```

**Backend Actions:**
1. Verify with M-Pesa API
2. Update payment status
3. Update application status to `visa_processing`
4. Create visa processing record
5. Queue visa processing task
6. Send confirmation email

---

### 6.3 Payment Callback (Webhook)

**Endpoint:** `POST /api/payment/callback`

**Source:** M-Pesa backend

**Request:**
```javascript
{
  "Result": {
    "ResultCode": 0,
    "ResultDesc": "The service request has been processed successfully.",
    "OriginatorConversationID": "123456",
    "ConversationID": "AG_20190606_00001234567890123456",
    "TransactionID": "LH7819MP0LU",
    "ResultParameters": {
      "ResultParameter": [
        {
          "Key": "Amount",
          "Value": 30000
        },
        {
          "Key": "MpesaReceiptNumber",
          "Value": "LH7819MP0LU"
        },
        {
          "Key": "Balance",
          "Value": 50000
        }
      ]
    }
  }
}
```

---

### 6.4 Get Payment Status

**Endpoint:** `GET /api/payment/:id`

**Frontend:** [src/pages/job-seeker/applications.tsx](src/pages/job-seeker/applications.tsx)

**Response (200):**
```javascript
{
  "payment": {
    "id": 1,
    "transactionId": "MPY_230234857263847",
    "amount": 30000,
    "currency": "KES",
    "status": "completed",
    "createdAt": "2026-04-05T10:00:00Z",
    "completedAt": "2026-04-05T10:05:00Z"
  }
}
```

---

## 7. Admin APIs

### 7.1 Admin Dashboard Stats

**Endpoint:** `GET /api/admin/dashboard/stats`

**Frontend:** [src/pages/admin/dashboard/index.tsx](src/pages/admin/dashboard/index.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token" // Admin only
}
```

**Response (200):**
```javascript
{
  "stats": {
    "totalApplications": 234,
    "pendingApplications": 45,
    "shortlistedCandidates": 67,
    "interviewsScheduled": 23,
    "hiredCandidates": 12,
    "rejectedApplications": 87,
    "totalJobs": 15,
    "activeJobs": 12,
    "visaPaymentsPending": 8,
    "totalRevenue": 240000
  }
}
```

---

### 7.2 Create Job (Admin)

**Endpoint:** `POST /api/jobs`

**Frontend:** [src/pages/admin/jobs.tsx](src/pages/admin/jobs.tsx)

**Headers:**
```javascript
{
  "Authorization": "Bearer token" // Admin only
}
```

**Request:**
```javascript
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "Toronto, Canada",
  "salary": "$120,000 - $150,000 CAD",
  "jobType": "full-time",
  "description": "We are looking for...",
  "responsibilities": ["Lead development", "Code reviews"],
  "requirements": ["5+ years experience", "JavaScript"],
  "benefits": ["Health insurance", "401k"],
  "deadline": "2026-05-01T00:00:00Z",
  "visaSponsored": true
}
```

**Response (201):**
```javascript
{
  "message": "Job created successfully",
  "job": {
    "id": 1,
    "title": "Senior Software Engineer",
    // ... all fields
    "createdAt": "2026-04-05T10:00:00Z"
  }
}
```

---

### 7.3 Update Job (Admin)

**Endpoint:** `PUT /api/jobs/:id`

**Request:** Same as 7.2

**Response (200):** Updated job object

---

### 7.4 Delete Job (Admin)

**Endpoint:** `DELETE /api/jobs/:id`

**Response (200):**
```javascript
{
  "message": "Job deleted successfully"
}
```

---

### 7.5 Create Job Category (Admin)

**Endpoint:** `POST /api/jobs/categories`

**Request:**
```javascript
{
  "name": "Engineering",
  "description": "Engineering jobs"
}
```

**Response (201):**
```javascript
{
  "message": "Category created",
  "category": {
    "id": 1,
    "name": "Engineering"
  }
}
```

---

### 7.6 Interview Pipeline

**Endpoint:** `GET /api/admin/dashboard/interview-pipeline`

**Frontend:** [src/pages/admin/dashboard/index.tsx](src/pages/admin/dashboard/index.tsx)

**Response (200):**
```javascript
{
  "pipeline": {
    "pending": 45,
    "reviewed": 23,
    "shortlisted": 67,
    "interview_scheduled": 15,
    "interview_completed": 12,
    "visa_payment_pending": 8,
    "hired": 5,
    "rejected": 87
  }
}
```

---

## Error Handling

### Standard Error Response Format

```javascript
{
  "message": "Error description",
  "error": "ErrorCode",
  "statusCode": 400,
  "timestamp": "2026-04-05T10:00:00Z"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Operation completed |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate email |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

### Common Errors

```javascript
// Invalid Credentials
{
  "message": "Invalid email or password",
  "error": "InvalidCredentials",
  "statusCode": 400
}

// Email Already Registered
{
  "message": "Email already registered",
  "error": "EmailAlreadyExists",
  "statusCode": 409
}

// Unauthorized
{
  "message": "Not authenticated",
  "error": "Unauthorized",
  "statusCode": 401
}

// Forbidden
{
  "message": "Access denied",
  "error": "Forbidden",
  "statusCode": 403
}

// Job Not Found
{
  "message": "Job not found",
  "error": "JobNotFound",
  "statusCode": 404
}

// Duplicate Application
{
  "message": "You have already applied for this job",
  "error": "DuplicateApplication",
  "statusCode": 400
}
```

---

## Request/Response Examples

### Complete Flow Example: Registration → Login → Apply → Payment

#### 1. Register
```bash
curl -X POST https://airswift-backend-fjt3.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully! OTP sent to email.",
  "user": {
    "id": 42,
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "role": "user",
    "isVerified": false
  }
}
```

#### 2. Verify OTP
```bash
curl -X POST https://airswift-backend-fjt3.onrender.com/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@example.com",
    "otp": "123456"
  }'
```

#### 3. Login
```bash
curl -X POST https://airswift-backend-fjt3.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 42,
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Apply for Job
```bash
curl -X POST https://airswift-backend-fjt3.onrender.com/api/applications/apply \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "jobId=1" \
  -F "coverLetter=I am interested..." \
  -F "cv=@resume.pdf" \
  -F "passport=@passport.pdf" \
  -F "nationalId=@national_id.pdf"
```

#### 5. Initiate Payment
```bash
curl -X POST https://airswift-backend-fjt3.onrender.com/api/payment/initiate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 1,
    "amount": 30000,
    "currency": "KES",
    "phoneNumber": "254712345678",
    "paymentMethod": "mpesa"
  }'
```

---

## Implementation Notes

### Token Handling
- JWT tokens expire after 24 hours
- Refresh tokens valid for 30 days
- Store in `localStorage` on frontend
- Send via `Authorization: Bearer {token}` header

### File Uploads
- Maximum file size: 5MB
- Supported formats: PDF, JPG, PNG
- Encrypted before storage
- Virus scanned

### Rate Limiting
- 100 requests per minute per IP
- 5 failed login attempts = 15 minute lockout
- Payment endpoints: 10 requests per hour

### CORS Headers
```
Access-Control-Allow-Origin: https://airswift-frontend-*.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Security Headers
- HTTPS enforcement
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

---

## Related Documentation

- [Frontend Implementation Guide](./WEBSITE_FLOW_IMPLEMENTATION.md)
- [Frontend Visual Map](./WEBSITE_FLOW_VISUAL_MAP.md)
- [Environment Variables](./src/.env.example)

---

## Support

For API issues or questions:
- **Backend Repository:** [Airswift-Backend](https://github.com/EMANUELKIRUI/Airswift-Backend)
- **API Base URL:** https://airswift-backend-fjt3.onrender.com
- **Documentation:** Check backend README.md

