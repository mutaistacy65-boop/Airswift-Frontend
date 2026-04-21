# Quick Reference: Testing Admin Applications

## 🎯 What Was Implemented

### Core Feature
✅ **Users can submit applications** → **Admins can view them in the dashboard**

### Key Components

1. **Application Submission Endpoint** (Already Existed)
   - `POST /api/applications`
   - Accepts CV, Passport, National ID files
   - Saves to MongoDB
   - Returns 201 Created

2. **Admin Fetch Endpoint** (NEW)
   - `GET /api/applications/admin`
   - Only accessible to admins
   - Returns all applications with pagination
   - Includes document URLs for downloading

3. **Service Layer** (UPDATED)
   - `applicationService.getAllApplications()`
   - `adminService.getAllApplications()`
   - Both use the new admin endpoint with fallback

4. **Admin Dashboard** (ENHANCED)
   - Displays application statistics (Total, Pending, Shortlisted, etc.)
   - Shows applications in table format
   - Displays applicant info and documents
   - Allows status updates and notes
   - Real-time updates via socket.io OR polling fallback

5. **Polling Hook** (NEW)
   - `useApplicationPolling.ts`
   - Fallback for when socket.io isn't available
   - Refreshes applications every 5 seconds
   - Ensures applications always appear

## 🧪 Quick Testing Steps

### Step 1: Submit Application (as User)
1. Log in as a regular user (not admin)
2. Go to `/apply` or `/job-seeker/applications`
3. Fill out application form
4. Upload CV, Passport, and National ID files
5. Click Submit
6. Check for success message: "Application submitted successfully!"

**Expected Result**: ✅ Application saved to database

### Step 2: View in Admin Dashboard
1. Log out from user account
2. Log in as admin user (role: 'admin')
3. Navigate to `/admin/applications`
4. Look for the just-submitted application in the list

**Expected Result**: ✅ Application appears in the dashboard table

### Step 3: Verify Application Details
1. Check applicant name and email are displayed
2. Check job title is shown
3. Verify CV and Passport document links
4. Verify status is "pending"

**Expected Result**: ✅ All details visible and clickable

### Step 4: Test Admin Actions
1. Click "Shortlist" button → Change status to shortlisted
2. Click "Accept" button → Change status to accepted
3. Click "Reject" button → Change status to rejected
4. Add notes in the notes field
5. Verify all changes persist

**Expected Result**: ✅ Admin can manage applications

## 📊 Verification Checklist

### Endpoints
- [ ] GET `/api/applications/admin` returns 200 with applications
- [ ] Admin can fetch (with auth token)
- [ ] Non-admin blocked with 403
- [ ] Unauthenticated blocked with 401

### Database
- [ ] Application records created on submission
- [ ] Fields populated: user_id, job_id, status, files
- [ ] Documents saved to `/public/uploads/applications/`
- [ ] File paths stored in database

### Admin Dashboard
- [ ] Statistics show correct counts
- [ ] Applications table displays data
- [ ] Documents can be downloaded
- [ ] Status updates work
- [ ] Notes can be added
- [ ] Filters work (by status)

### Real-time Updates
- [ ] Polling works (new apps appear in 5 seconds)
- [ ] OR socket.io updates work (instant if backend emits)
- [ ] No console errors

## 🔍 Debugging

### Check Database
```javascript
// In MongoDB shell
db.applications.countDocuments()           // Count all applications
db.applications.findOne()                  // View one application
db.applications.find({ status: 'pending' }) // Find pending
```

### Check Network Requests
1. Open DevTools → Network tab
2. Submit application → Watch for POST request
3. Go to admin dashboard → Watch for GET request
4. Check request headers for Authorization token
5. Check response contains applications array

### Check Logs
1. Look for console logs with timestamps
2. [Admin Applications] logs show fetch count
3. [Admin Applications] logs show pagination info
4. Any errors should be visible in console

### Check File Storage
```bash
# Verify uploaded files exist
ls -la /workspaces/Airswift-Frontend/public/uploads/applications/
# Should show timestamped directories with PDF files
```

## 📋 API Response Examples

### Submit Application
```json
{
  "success": true,
  "application": {
    "_id": "507f1f77...",
    "user_id": "607f1f77...",
    "job_id": "707f1f77...",
    "status": "pending",
    "cv_path": "/uploads/applications/1234567890/cv.pdf",
    "passport_path": "/uploads/applications/1234567890/passport.pdf",
    "created_at": "2026-04-21T10:30:00Z"
  }
}
```

### Fetch Applications (Admin)
```json
{
  "success": true,
  "applications": [
    {
      "_id": "507f1f77...",
      "user_id": {
        "_id": "607f1f77...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "job_id": {
        "_id": "707f1f77...",
        "title": "Software Engineer"
      },
      "status": "pending",
      "cvUrl": "http://localhost:3000/uploads/applications/1234567890/cv.pdf",
      "passportUrl": "http://localhost:3000/uploads/applications/1234567890/passport.pdf",
      "notes": "Strong candidate",
      "created_at": "2026-04-21T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

## 🚀 Success Criteria

✅ **Implementation is successful if**:
1. User can submit application with files
2. Application appears in admin dashboard within seconds
3. Admin can view application details
4. Admin can perform actions (shortlist, accept, reject)
5. Admin can add notes
6. Documents can be downloaded
7. Status persists across page refreshes
8. Statistics show correct counts

## 🔧 Additional Configuration

### Optional: Adjust Polling Interval
In `/src/pages/admin/applications.tsx`, modify:
```typescript
useApplicationPolling(
  useCallback(() => fetchApplications(), []),
  3000,  // Change from 5000ms to 3000ms (faster polling)
  user?.role === 'admin' && !isConnected
)
```

### Optional: Disable Polling
To rely only on socket.io:
```typescript
useApplicationPolling(
  useCallback(() => fetchApplications(), []),
  5000,
  false  // Disable polling
)
```

## 📞 Support

If applications aren't appearing:
1. Check applicant is authenticated user
2. Check admin has 'admin' role
3. Check MongoDB connection (logs should show)
4. Check files uploaded to `/public/uploads/applications/`
5. Check Network tab for API responses
6. Check browser console for errors

See `ADMIN_APPLICATIONS_GUIDE.md` for comprehensive troubleshooting.

---

**Status**: ✅ Ready to Test
**Implementation Date**: April 21, 2026
