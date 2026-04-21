# Step-by-Step Testing Guide: Visual Walkthrough

## 🎯 Objective
Test that applications submitted by users appear in the Admin Dashboard.

---

## 📋 Phase 1: Setup (5 minutes)

### Step 1.1: Start Development Server

```bash
cd /workspaces/Airswift-Frontend
npm run dev
```

**Wait for output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Screenshot expectation:**
- Terminal shows "ready" message
- No critical errors in console
- App is running on localhost:3000

---

### Step 1.2: Prepare Test Data

Before testing, ensure you have:
- ✅ Regular user account (with non-admin role)
- ✅ Admin user account (with admin role)
- ✅ Sample files for upload (CV PDF, Passport PDF, National ID PDF)

If you need to create test users:
1. Go to `/register`
2. Create a regular user (test@example.com)
3. Create an admin user (admin@example.com) with role='admin'

---

## 🚀 Phase 2: Submit Application (10 minutes)

### Step 2.1: Navigate to Application Form

1. Open browser: `http://localhost:3000/apply`
2. You should see the application form

**Expected Screen:**
```
┌─────────────────────────────────────────┐
│  Application Form                       │
│                                         │
│  Job: [📌 Select Job ▼]                │
│  Phone: [+254________]                 │
│  National ID: [__________]             │
│                                         │
│  ❌ Errors (if any)                    │
│                                         │
│  [Upload CV]         [Upload Passport] │
│  [Upload National ID] [Passport Photo] │
│                                         │
│              [Submit →]                 │
└─────────────────────────────────────────┘
```

---

### Step 2.2: Check Authentication

❌ **If you see "Not authenticated":**
- Click "Login"
- Log in with regular user account
- Come back to `/apply`

✅ **If you see the form:**
- Proceed to next step

---

### Step 2.3: Fill Application Form

Fill in the form with test data:

```
Job Title:        Select any available job
Phone:            +254712345678
National ID:      12345678
```

**Visual Check:**
```
Job dropdown shows available jobs
Phone field accepts numbers and +
National ID field accepts numbers
```

---

### Step 2.4: Upload Documents

Click each upload button and select files:

**CV Upload:**
- Click "Upload CV" button
- Select a PDF file (any PDF works for testing)
- Verify file name appears below button

**Expected:**
```
┌─────────────────┐
│ Upload CV       │  ← Click here
│ [cv-file.pdf]   │  ← File appears here
└─────────────────┘
```

Repeat for:
- ✅ Passport file
- ✅ National ID file

**After uploading all:**
```
✓ CV: [resume.pdf]
✓ Passport: [passport.pdf]
✓ National ID: [id.pdf]
```

---

### Step 2.5: Submit Application

1. Click the **"Submit"** button
2. **Wait 3-5 seconds** for processing

**Expected Outcomes:**

✅ **Success Case:**
```
┌─────────────────────────────────────┐
│ ✓ Application Submitted!            │
│                                     │
│ Your application has been received. │
│ Redirecting to dashboard...         │
└─────────────────────────────────────┘

Browser URL changes to: /job-seeker/dashboard
```

❌ **Error Case (if something fails):**
```
┌─────────────────────────────────────┐
│ ✗ Error Submitting Application      │
│                                     │
│ Error: [error message here]         │
│                                     │
│ Check console (F12) for details     │
└─────────────────────────────────────┘
```

**If error occurs:**
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Go to Network tab
- Find POST `/api/applications` request
- Check Response status (should be 201)

---

## ✅ Phase 3: Verify in Admin Dashboard (10 minutes)

### Step 3.1: Log Out

1. Click profile/menu icon (top right)
2. Click "Logout"
3. Verify you're logged out

**Expected:**
- URL shows `/login` or `/`
- Navigation shows "Login" button

---

### Step 3.2: Log In as Admin

1. Go to `/login`
2. Enter admin user credentials
3. Click "Login"

**Verification:**
```
Admin Dashboard should show:
- Admin user name (top right)
- Admin navigation menu
- Links to admin pages
```

---

### Step 3.3: Navigate to Applications

1. Click menu or go directly to: `http://localhost:3000/admin/applications`

**Expected Page Layout:**
```
┌─────────────────────────────────────────────┐
│  📊 Admin Dashboard                         │
│  ┌─────────────────────────────────────────┐│
│  │ Applications & Applicants                ││
│  │ Review and manage all applications       ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Statistics:                                │
│  ┌──────────────────────────────────────┐  │
│  │ Total: [1]  │ Pending: [1] │ ...     │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Applications Table:                        │
│  ┌──────────────────────────────────────┐  │
│  │ Applicant │ Job │ Status │ Date      │  │
│  │───────────────────────────────────── │  │
│  │ Test User │ Eng │ Pending│ Apr 21   │  │ ← YOUR APPLICATION
│  │───────────────────────────────────── │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  [View Details] [Shortlist] [Accept]       │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Step 3.4: Verify Your Application

**Check these fields appear:**

|  Field | Expected Value | Check |
|--------|---|---|
| Applicant Name | Your name | ✓ |
| Email | Your email | ✓ |
| Job Title | The job you selected | ✓ |
| Status | "pending" | ✓ |
| Date | Today's date (Apr 21, 2026) | ✓ |

**Visual Indicators:**
- ✅ Application row is highlighted/visible
- ✅ Status badge shows "pending" (yellow)
- ✅ Recent date shown
- ✅ All data is legible

**If NOT visible:**
- Wait 5 seconds (polling updates every 5 seconds)
- Click refresh (F5)
- Check browser console for errors

---

## 🔧 Phase 4: Test Admin Actions (10 minutes)

### Step 4.1: View Application Details

1. Click on the application row
2. Verify modal/panel opens with full details

**Expected Details:**
```
Applicant Name:           [Your Name]
Email:                    [your@email.com]
Phone:                    [+254712345678]
Job Applied For:          [Job Title]
Status:                   [Pending]
Date Submitted:           [Apr 21, 2026]
CV:                       [Download Link]
Passport:                 [Download Link]
National ID:              [Download Link]
Notes:                    [Empty or Previous Notes]
```

---

### Step 4.2: Download Documents

1. Find the document links (CV, Passport, National ID)
2. Click each link
3. Verify browser downloads the file

**For each document:**
```
CV Row:
├─ "View CV" link      → Opens in new tab
└─ "Download CV" link  → Downloads to /Downloads/

Passport Row:
├─ "View Passport" link      → Opens in new tab
└─ "Download Passport" link  → Downloads to /Downloads/

National ID Row:
├─ "View ID" link      → Opens in new tab
└─ "Download ID" link  → Downloads to /Downloads/
```

---

### Step 4.3: Add Admin Notes

1. Scroll to "Notes" field
2. Click in the notes textarea
3. Type: `Testing application intake - verified documents`
4. Click outside the field (or press Tab)

**Expected:**
```
✓ Notes appear in the field
✓ Notes persist after refresh (F5)
✓ Notes sync to database
```

---

### Step 4.4: Change Application Status

Click each status button and observe changes:

**Option 1: Shortlist**
1. Click "Shortlist" button
2. Observe: Status badge changes from yellow to blue/green
3. Verify: Application still appears in table

**Option 2: Accept**
1. Click "Accept" button
2. Observe: Status badge changes color
3. Verify: Table updates

**Option 3: Reject**
1. Click "Reject" button
2. Observe: Status badge turns red
3. Verify: Table updates

**Expected Visual:**
```
Before:              After:
[Pending]     →      [Shortlisted]
  (yellow)             (blue)

[Pending]     →      [Accepted]
  (yellow)             (green)

[Pending]     →      [Rejected]
  (yellow)             (red)
```

---

## 📊 Phase 5: Verify Statistics (5 minutes)

### Step 5.1: Check Statistics Cards

At the top of the applications page:

```
┌──────────┬──────────┬────────────┬───────────┬──────────┐
│  Total   │ Pending  │ Shortlist  │ Interviews│ Rejected │
│   [1]    │   [0]    │     [1]    │    [0]    │   [0]    │
└──────────┴──────────┴────────────┴───────────┴──────────┘
```

**After your tests**, numbers should show:
- Total: = number of applications submitted
- Pending: = applications still in pending status
- Shortlisted: = applications you shortlisted
- Interviews: = applications with interviews scheduled
- Rejected: = applications you rejected

**Verification:**
- ✅ Numbers update after status changes
- ✅ Numbers are accurate
- ✅ Statistics match table content

---

## 📱 Phase 6: Browser DevTools Verification (5 minutes)

### Step 6.1: Open DevTools

Press `F12` or Right-click → "Inspect"

### Step 6.2: Network Tab Verification

1. Go to **Network** tab
2. Filter by `XHR` (XMLHttpRequest)
3. Refresh the page with `F5`
4. Look for these requests:

**Application Submission (from Step 2):**
```
Request:  POST /api/applications
Status:   201 Created
Response: { success: true, application: {...} }
```

**Admin Fetch (from Step 3):**
```
Request:  GET /api/applications/admin
Status:   200 OK
Response: {
  success: true,
  applications: [...],
  pagination: { total: 1, page: 1, ... }
}
```

### Step 6.3: Console Verification

1. Go to **Console** tab
2. Look for these log entries:
```
[Admin Applications] Total applications in DB: 1
[Admin Applications] Fetched 1 applications for page 1
```

**Should NOT see:**
- ❌ Red error messages (except pre-existing test errors)
- ❌ 401/403 authentication errors
- ❌ 500 server errors

---

## 🎉 Final Verification Checklist

Check all boxes to confirm success:

- [ ] ✅ Application submitted successfully
- [ ] ✅ Success message displayed
- [ ] ✅ Application appears in admin dashboard
- [ ] ✅ Applicant name correct
- [ ] ✅ Job title correct
- [ ] ✅ Status shows "pending"
- [ ] ✅ Created date is today's date
- [ ] ✅ Can download documents
- [ ] ✅ Can add notes
- [ ] ✅ Can change status (shortlist/accept/reject)
- [ ] ✅ Statistics update correctly
- [ ] ✅ Network requests show correct status codes
- [ ] ✅ Console shows no critical errors
- [ ] ✅ Application appears within 5 seconds
- [ ] ✅ Page is responsive and performs well

---

## 🎓 If Something Goes Wrong

### Console Shows: `Cannot find module 'xxx'`
**Solution:**
```bash
npm install
npm run dev
```

### Page shows `Unauthorized`
**Solution:**
- Verify you're logged in as admin
- Check admin user has role='admin'
- Log out and log back in

### Application doesn't appear
**Solution:**
1. Wait 5 seconds (polling interval)
2. Refresh page (F5)
3. Check MongoDB: `db.applications.find()`
4. Check Network tab for GET request response

### Files don't download
**Solution:**
- Check files exist in `/public/uploads/applications/`
- Verify file paths in database
- Try accessing URL directly

---

## 📞 Test Complete!

If all checkboxes are ticked ✅, the implementation is working correctly!

**Next Steps:**
1. Document any issues found
2. Take screenshots of each phase
3. Report results to development team
4. Proceed to production deployment if approved

---

**Test Date:** April 21, 2026  
**Estimated Duration:** 40 minutes  
**Difficulty Level:** 🟢 Easy (follow steps 1-6)
