# Admin Dashboard - Applications Integration Guide

## Overview
This document explains how applications submitted by users are fetched and displayed in the Admin Dashboard.

## Complete Data Flow

### 1. Application Submission (User Side)
- Users fill out the application form in `/pages/apply.tsx` or `/pages/admin/applications.tsx`
- Application is submitted via `ApplicationForm` or `SafeApplicationForm` component
- Data is sent to: **POST `/api/applications`**

### 2. Application Storage (Backend)
- The POST endpoint (`/pages/api/applications/index.ts`) processes the form data:
  - ✅ Validates user authentication
  - ✅ Validates required fields (jobId, phone, nationalId)
  - ✅ Uploads CV and Passport files to `/public/uploads/applications/`
  - ✅ Creates an Application record in MongoDB with:
    - `user_id`: Reference to the applicant user
    - `job_id`: Reference to the job they applied for
    - `status`: Set to 'pending' by default
    - `cv_path`: Path to uploaded CV file
    - `passport_path`: Path to uploaded Passport file
    - `created_at`: Timestamp
  - ✅ Returns 201 with the created application

### 3. Admin Dashboard Fetching (Display)
- Admin navigates to `/admin/applications`
- Page component (`/pages/admin/applications.tsx`) calls `adminService.getAllApplications()`
- Service method calls: **GET `/api/applications/admin`**

### 4. Admin Fetch Endpoint
The endpoint `/pages/api/applications/admin.ts`:
- ✅ Verifies admin authentication via JWT token
- ✅ Checks user role is 'admin'
- ✅ Queries MongoDB Application collection with all records
- ✅ Populates user and job details via references
- ✅ Sorts by creation date (newest first)
- ✅ Supports pagination (page, limit parameters)
- ✅ Returns applications with document URLs

### 5. Real-time Updates (Optional - Socket.IO)
- Admin dashboard listens for socket events:
  - `newApplication`: New application submitted
  - `statusUpdate`: Application status changed
  - `application_updated`: Application modified
- Events should be emitted from backend when applications are created/updated
- **Note**: Currently set up to receive, but backend may need to emit these events

### 6. Display in Admin UI
- Statistics cards show:
  - Total applications count
  - Pending applications
  - Shortlisted applications
  - Interviews scheduled
  - Rejected applications
- Applications table displays with:
  - Applicant name and email
  - Job title
  - CV and Passport document links
  - Status badge
  - Notes textarea for admin notes
  - Action buttons (Shortlist, Accept, Reject, Interview)

## API Endpoints

### Application Submission
```
POST /api/applications
Content-Type: multipart/form-data

Fields:
- jobId: string (required)
- phone: string (required)
- nationalId: string (required)
- cv: File (required)
- passport: File (required)
- nationalId: File (required) - document file

Response: 201 Created
{
  success: true,
  application: { ... }
}
```

### Admin Fetch All Applications
```
GET /api/applications/admin
Headers: Authorization: Bearer {token}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)

Response: 200 OK
{
  success: true,
  applications: [ ... ],
  pagination: {
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}
```

### Alternative Endpoints
There are also fallback endpoints for compatibility:
- `GET /api/applications` - Returns all apps for admin (same response structure)
- `GET /admin/applications` - Proxies to backend (requires backend API)

## Database Schema

### Application Collection
```typescript
{
  _id: ObjectId
  user_id: ObjectId (ref: User)
  job_id: ObjectId (ref: Job)
  national_id: string
  phone: string
  passport_path: string (e.g., "/uploads/applications/1234567890/file.pdf")
  cv_path: string (e.g., "/uploads/applications/1234567890/cv.pdf")
  status: "pending" | "shortlisted" | "accepted" | "rejected"
  notes: string (optional)
  created_at: Date
  updated_at: Date
}
```

## Testing the Integration

### 1. Manual Testing
1. Log in as a regular user (job seeker)
2. Submit an application with all required fields and documents
3. Log in as an admin user
4. Navigate to `/admin/applications`
5. Verify the application appears in the list
6. Check that applicant name, job, and documents are displayed correctly

### 2. API Testing with cURL
```bash
# Submit application
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -F "jobId=507f1f77..." \
  -F "phone=+254712345678" \
  -F "nationalId=12345678" \
  -F "cv=@/path/to/cv.pdf" \
  -F "passport=@/path/to/passport.pdf" \
  -F "nationalId=@/path/to/national_id.pdf"

# Fetch applications (as admin)
curl -X GET http://localhost:3000/api/applications/admin \
  -H "Authorization: Bearer {ADMIN_JWT_TOKEN}"
```

### 3. Browser DevTools Testing
1. Open Network tab in DevTools
2. Submit an application - should see POST request to `/api/applications`
3. Navigate to admin panel
4. Check Network tab for GET request to `/api/applications/admin`
5. Verify response contains applications array

## Troubleshooting

### Issue: Applications not showing in admin dashboard
**Possible Causes:**
1. **Not logged in as admin** - Verify user role is 'admin'
2. **Invalid token** - Try logging out and logging back in
3. **Database connection issue** - Check MongoDB connection string in `.env`
4. **Applications not in database** - Submit a test application from user account
5. **API endpoint not working** - Test endpoint directly via cURL

**Debug Steps:**
```
1. Check browser console for errors
2. Check Network tab for API responses
3. Check server logs for error messages
4. Verify MongoDB has application documents: 
   db.applications.countDocuments()
5. Test endpoint with different auth tokens
```

### Issue: Documents (CV/Passport) not loading
**Possible Causes:**
1. **Files not uploaded** - Check if files exist in `/public/uploads/applications/`
2. **Wrong file paths stored** - Check database `cv_path` and `passport_path` fields
3. **CORS issue** - Verify file serving is enabled in Next.js

**Debug Steps:**
```
1. Check file paths in database
2. Verify files exist in public folder
3. Try accessing file directly: 
   http://localhost:3000{cv_path}
```

## Configuration Required

### Environment Variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
# or for production:
NEXT_PUBLIC_API_URL=https://airswift-frontend.vercel.app

JWT_SECRET=your_secret_key_here
```

### MongoDB
- Ensure MongoDB is running
- Database connection is configured in `/src/lib/mongodb.ts`
- Verify `Application`, `User`, and `Job` models are properly registered

## Features Implemented

✅ Application submission with file uploads
✅ Admin authentication and authorization
✅ Fetching all applications for admin
✅ Document storage and URL generation
✅ Application status tracking
✅ Admin notes on applications
✅ Pagination support
✅ Auto-population of user and job details
✅ Status filtering and search (in admin UI)
✅ Real-time socket.io listeners (when backend emits)
✅ Fallback polling mechanism (see `useApplicationPolling` hook)

## Architecture Diagram

```
User Application Flow:
├─ User fills form
├─ User uploads CV, Passport, National ID
├─ POST /api/applications
│  ├─ Validate user auth
│  ├─ Upload files to /public/uploads/applications/{timestamp}/
│  └─ Save application record to MongoDB
└─ User sees success message

Admin Dashboard Flow:
├─ Admin logs in
├─ Navigate to /admin/applications
├─ GET /api/applications/admin
│  ├─ Verify admin auth
│  ├─ Query MongoDB for all applications
│  ├─ Populate user and job references
│  └─ Return with document URLs
├─ Display applications in table
├─ Admin can view, filter, and manage applications
└─ Optional: Socket.io updates when new apps arrive
```

## Next Steps / Future Improvements

1. **Socket.io Emissions** - Backend should emit events when applications are created
2. **Bulk Operations** - Allow bulk approve/reject
3. **CV Analysis** - Use CV parsing service for automatic scoring
4. **Email Notifications** - Send email to admins when new applications arrive
5. **Export Applications** - Allow CSV/PDF export of all applications
6. **Application Templates** - Save draft application templates
7. **Status Tracking** - Detailed timeline of application status changes
8. **Communication Tools** - Send messages directly to applicants

---

**Last Updated**: April 21, 2026
**Version**: 1.0
