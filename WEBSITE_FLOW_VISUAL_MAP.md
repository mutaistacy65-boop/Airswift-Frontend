# Airswift User Journey - Visual Flow Map

## Complete Website Flow Visualization

```
╔════════════════════════════════════════════════════════════════════════════╗
║                        AIRSWIFT USER JOURNEY MAP                           ║
╚════════════════════════════════════════════════════════════════════════════╝

STAGE 1: LANDING PAGE
┌─────────────────────────────────────────────────────────────────────────┐
│ URL: /                                                                   │
│ Component: src/pages/index.tsx                                          │
│                                                                          │
│  [🏠 AIRSWIFT HOMEPAGE]                                                 │
│  ├─ Hero Section                   ├─ Navigation Bar                    │
│  ├─ Features Showcase              ├─ Login Button                      │
│  ├─ Testimonials                   ├─ Register Button                   │
│  └─ Footer                         └─ Google OAuth (ready)              │
│                                                                          │
│ CTA Options:                                                             │
│  └─ [Register] → /register                                              │
│  └─ [Login] → /login                                                    │
└─────────────────────────────────────────────────────────────────────────┘


STAGE 2: REGISTRATION
┌─────────────────────────────────────────────────────────────────────────┐
│ Registration Flow (3 steps)                                              │
│                                                                          │
│ Step 1: REGISTRATION FORM                                               │
│ ┌──────────────────────────────────────────────────────────────┐        │
│ │ URL: /register                                               │        │
│ │ Component: src/pages/register.tsx                           │        │
│ │                                                              │        │
│ │ [📝 REGISTER]                                               │        │
│ │ ├─ Full Name Input                                         │        │
│ │ ├─ Email Input                                             │        │
│ │ ├─ Password Input                                          │        │
│ │ ├─ Register Button                                         │        │
│ │ └─ Login Link                                              │        │
│ │                                                              │        │
│ │ Action: POST /api/auth/register                            │        │
│ │ Storage: localStorage.setItem('pendingEmail', email)       │        │
│ └──────────────────────────────────────────────────────────────┘        │
│                           ↓                                              │
│ Step 2: OTP VERIFICATION                                                │
│ ┌──────────────────────────────────────────────────────────────┐        │
│ │ URL: /verify-otp                                             │        │
│ │ Component: src/pages/verify-otp.tsx                         │        │
│ │                                                              │        │
│ │ [🔐 VERIFY EMAIL]                                           │        │
│ │ ├─ Email Display (pre-filled)                              │        │
│ │ ├─ OTP Code Input                                          │        │
│ │ ├─ Verify Button                                           │        │
│ │ └─ Resend OTP Link                                         │        │
│ │                                                              │        │
│ │ Action: POST /api/auth/verify-otp                          │        │
│ └──────────────────────────────────────────────────────────────┘        │
│                           ↓                                              │
│ Step 3: SUCCESS & REDIRECT                                              │
│ ┌──────────────────────────────────────────────────────────────┐        │
│ │ ✅ Email verified successfully!                             │        │
│ │ → Automatically redirect to /login                          │        │
│ │ → localStorage cleared                                      │        │
│ │ → Ready to login                                            │        │
│ └──────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘


STAGE 3: LOGIN
┌─────────────────────────────────────────────────────────────────────────┐
│ URL: /login                                                              │
│ Component: src/pages/login.tsx                                           │
│                                                                          │
│ [🔑 LOGIN]                                                               │
│ ├─ Email Input                                                          │
│ ├─ Password Input                                                       │
│ ├─ Login Button                                                         │
│ ├─ Forgot Password Link → /forgot-password                             │
│ ├─ Register Link → /register                                           │
│ └─ Test Credentials Display                                             │
│                                                                          │
│ Action: POST /api/auth/login                                            │
│ (email + password)                                                       │
│                                                                          │
│ Response:                                                                │
│ {                                                                        │
│   "user": {                                                              │
│     "id": 1, "name": "...", "email": "...",                            │
│     "role": "admin" | "user"   ← Determines route                      │
│   },                                                                     │
│   "accessToken": "eyJhbGc..."                                          │
│ }                                                                        │
│                                                                          │
│ Storage:                                                                 │
│ localStorage.setItem('token', accessToken)                              │
│ localStorage.setItem('user', JSON.stringify(user))                      │
│ sessionStorage.setItem('accessToken', token)                            │
└─────────────────────────────────────────────────────────────────────────┘
                           ↓
                    [Token Stored]
                           ↓
                   Check User Role
                    /    ↓      \
                   /             \
            ADMIN?            USER?
             /                   \
            ↓                     ↓


STAGE 4: DASHBOARD ROUTING
┌──────────────────────────────────┬──────────────────────────────────┐
│         ADMIN DASHBOARD          │     JOB SEEKER DASHBOARD         │
├──────────────────────────────────┼──────────────────────────────────┤
│ URL: /admin/dashboard            │ URL: /job-seeker/dashboard       │
│                                  │                                  │
│ [👑 ADMIN DASHBOARD]             │ [👤 USER DASHBOARD]              │
│ ├─ View Applications Kanban      │ ├─ Profile Summary               │
│ ├─ Schedule Interviews           │ ├─ Browse Jobs Button            │
│ ├─ AI CV Analysis                │ ├─ My Applications Button        │
│ ├─ Manage Jobs Posted            │ ├─ My Interviews Button          │
│ ├─ Settings                      │ ├─ View Saved Jobs               │
│ └─ User Statistics               │ └─ Quick Stats                   │
└──────────────────────────────────┴──────────────────────────────────┘


STAGE 5: PROFILE & CV SETUP (Job Seekers)
┌─────────────────────────────────────────────────────────────────────────┐
│ URL: /job-seeker/profile                                                │
│ Component: src/pages/job-seeker/profile.tsx                             │
│                                                                          │
│ [👥 COMPLETE PROFILE]                                                    │
│ ├─ Personal Information                                                  │
│ │  ├─ Full Name                                                         │
│ │  ├─ Email                                                             │
│ │  ├─ Phone Number                                                      │
│ │  └─ Location                                                          │
│ │                                                                        │
│ ├─ Professional Details                                                  │
│ │  ├─ Bio / About You                                                   │
│ │  ├─ Skills (Add multiple)                                            │
│ │  ├─ Experience                                                        │
│ │  └─ Education                                                         │
│ │                                                                        │
│ └─ Document Uploads                                                      │
│    ├─ 📄 CV (PDF) - Drag & Drop                                        │
│    │   with AI Analysis:                                                │
│    │   ├─ Skill Extraction                                              │
│    │   ├─ Match Score                                                   │
│    │   └─ Recommendation (Reject/Shortlist/Hire)                       │
│    │                                                                     │
│    ├─ 🛂 Passport (Scan)                                                │
│    └─ 🪪 National ID (Scan)                                             │
│                                                                          │
│ Action: PATCH /api/users/profile (update)                              │
│         POST /api/cv/analyze (analyze CV)                              │
│         POST /api/documents/upload (upload files)                      │
└─────────────────────────────────────────────────────────────────────────┘
                           ↓
                    [Profile Complete]
                           ↓


STAGE 6: JOB BROWSING
┌─────────────────────────────────────────────────────────────────────────┐
│ URL: /jobs                                                               │
│ Component: src/pages/jobs/index.tsx                                      │
│                                                                          │
│ [💼 BROWSE JOBS]                                                         │
│ ├─ Search Bar (Search by keyword)                                       │
│ ├─ Filter by Job Type (Full-time, Part-time, Contract, etc.)           │
│ ├─ Filter by Company                                                    │
│ ├─ Pagination                                                           │
│ │                                                                        │
│ └─ Job Cards Grid                                                       │
│    ├─ [EACH JOB CARD]                                                   │
│    │  ├─ Job Title                                                      │
│    │  ├─ Company Name                                                   │
│    │  ├─ Location                                                       │
│    │  ├─ Salary Range                                                   │
│    │  ├─ Job Type Badge (Red)                                          │
│    │  ├─ Brief Description (truncated)                                 │
│    │  ├─ Required Skills (first 3)                                     │
│    │  ├─ Posted Date                                                    │
│    │  └─ [View Details] → /jobs/[id]                                   │
│    └─ [MORE CARDS...]                                                   │
│                                                                          │
│ Action: GET /jobs?page=1&limit=10&search=...&type=...                 │
└─────────────────────────────────────────────────────────────────────────┘
                           ↓
                    Click [View Details]
                           ↓


STAGE 6a: JOB DETAILS
┌─────────────────────────────────────────────────────────────────────────┐
│ URL: /jobs/[id]                                                          │
│ Component: src/pages/jobs/[id].tsx                                       │
│                                                                          │
│ [📋 JOB DETAILS]                                                         │
│ ├─ Job Title (Large)                                                    │
│ ├─ Company Logo & Name                                                  │
│ ├─ ⭐ Rating (if available)                                              │
│ │                                                                        │
│ ├─ Quick Stats                                                          │
│ │  ├─ 📍 Location                                                       │
│ │  ├─ 💰 Salary                                                         │
│ │  ├─ 📅 Posted Date                                                    │
│ │  ├─ 📊 Job Type                                                       │
│ │  └─ 👥 Applications Count                                             │
│ │                                                                        │
│ ├─ Full Description                                                      │
│ ├─ Key Responsibilities                                                 │
│ ├─ Requirements (List)                                                  │
│ ├─ Benefits                                                             │
│ │                                                                        │
│ └─ [APPLY NOW] Button → /jobs/[id]/apply                               │
│                                                                          │
│ Action: GET /jobs/[id]                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                           ↓
                    Click [APPLY NOW]
                           ↓


STAGE 7: JOB APPLICATION
┌─────────────────────────────────────────────────────────────────────────┐
│ URL: /jobs/[id]/apply                                                    │
│ Component: src/pages/jobs/apply/[id].tsx                                 │
│                                                                          │
│ [✒️ APPLICATION FORM]                                                    │
│                                                                          │
│ ┌─ Job Details (Pre-filled, Read-only)─────────────────────────────┐   │
│ │ Job Title: [...]  |  Company: [...]                              │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ Applicant Information─────────────────────────────────────────────┐   │
│ │ Name: [Pre-filled]                                                 │   │
│ │ Email: [Pre-filled]                                                │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ Required Documents (with drag-drop)───────────────────────────────┐   │
│ │ [📄 CV Upload]         [5MB max] {Drag CV here}                   │   │
│ │ [🛂 Passport Upload]    [5MB max] {Drag Passport here}            │   │
│ │ [🪪 National ID Upload] [5MB max] {Drag National ID here}         │   │
│ │ [📎 Certificates* ]    [Optional, multiple files]                 │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌─ Additional Information────────────────────────────────────────────┐   │
│ │ Job Category: [Dropdown: Accounting, Business, ..., Web Designer] │   │
│ │                                                                     │   │
│ │ Cover Letter: [Textarea]                                          │   │
│ │ "Tell us why you're interested in this position..."               │   │
│ │                                                                     │   │
│ │ [ ] Terms & Conditions accepted                                   │   │
│ └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ Actions:                                                                 │
│ [SUBMIT APPLICATION] → Validates all → POST /jobs/[id]/apply           │
│ [BACK] → Return to /jobs/[id]                                          │
│                                                                          │
│ Validation:                                                              │
│ ✓ All required files uploaded                                           │
│ ✓ File sizes < 5MB                                                      │
│ ✓ File formats valid                                                    │
│ ✓ User not already applied                                              │
│ ✓ Job is still active                                                   │
│                                                                          │
│ On Success:                                                              │
│ ✅ Application created                                                   │
│ 📧 Confirmation email sent                                              │
│ → Redirect to /job-seeker/applications                                  │
└─────────────────────────────────────────────────────────────────────────┘


STAGE 8: APPLICATION STATUS & SHORTLISTING
┌──────────────────────────────────┬──────────────────────────────────┐
│      JOB SEEKER VIEW             │      ADMIN VIEW                  │
├──────────────────────────────────┼──────────────────────────────────┤
│ URL: /job-seeker/applications    │ URL: /admin/applications         │
│ Component: applications.tsx      │ Component: applications.tsx      │
│                                  │                                  │
│ [📊 MY APPLICATIONS]             │ [📋 ALL APPLICATIONS]            │
│ ├─ Application List              │ ├─ Applications Table            │
│ │                               │                                  │
│ ├─ EACH APPLICATION CARD:        │ ├─ EACH APPLICATION ROW:         │
│ │  ├─ Job Title                 │  ├─ Candidate Name               │
│ │  ├─ Company                   │  ├─ Job Applied For              │
│ │  ├─ Applied Date              │  ├─ CV Preview & Analysis        │
│ │  ├─ Status Badge:             │  ├─ Documents Attached           │
│ │  │   Pending (🟡)             │  ├─ Applied Date                 │
│ │  │   Reviewed (🔵)            │  ├─ Current Status               │
│ │  │   Accepted (🟢)            │  ├─ [View Full Application]      │
│ │  │   Interview (🟣)           │  ├─ [Update Status] Dropdown     │
│ │  │   Visa Payment (🟠)        │  │  ├─ pending                   │
│ │  │   Visa Ready (✅)           │  │  ├─ reviewed                  │
│ │  │   Rejected (❌)            │  │  ├─ accepted                  │
│ │  │                            │  │  ├─ interview_scheduled        │
│ │  ├─ Timeline View             │  │  ├─ interview_completed        │
│ │  │  ├─ Applied               │  │  ├─ visa_payment_pending       │
│ │  │  ├─ Under Review          │  │  ├─ visa_processing           │
│ │  │  ├─ Shortlisted           │  │  ├─ visa_ready                │
│ │  │  ├─ Interview             │  │  └─ rejected                  │
│ │  │  ├─ Visa Payment          │  │                                │
│ │  │  ├─ Processing            │  ├─ [Schedule Interview]         │
│ │  │  └─ Hired ✓               │  ├─ [Send Feedback]              │
│ │  │                            │  └─ [AI Analysis]                │
│ │  └─ [View Details]            │                                  │
│ │     └─ Full docs              │ Action: PUT                      │
│ │     └─ Feedback               │ /admin/applications/:id/status   │
│ │     └─ Interview Link          │                                  │
│ │                                │                                  │
│ └─ [Browse More Jobs]            │ On Status Change:                │
│                                  │ 📧 Email notification sent to    │
│ When status = paid_pending:      │    candidate                     │
│ └─ [Pay Visa Fee] Button         │                                  │
│    → Opens M-Pesa Modal          │                                  │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘

STAGE 8 STATUS FLOW:
┌────────────────────────────────────────────────────────────────┐
│ pending          Submitted, waiting for review                 │
│   ↓                                                             │
│ reviewed         Admin reviewed application                    │
│   ├→ Rejected ❌  Application rejected                         │
│   └→ accepted ✓   Candidate shortlisted                       │
│       ↓                                                         │
│ interview_       Interview scheduled by admin                 │
│ scheduled        Candidate joins interview                    │
│   ↓                                                             │
│ interview_       Interview completed                          │
│ completed        ├→ Rejected ❌  Not selected                 │
│   ├→ Rejected ❌  └→ visa_payment_pending (Hired!) 🎉         │
│   │                                                            │
│   └─ visa_payment_pending → Awaiting fee payment              │
│       ├→ [cancelled]                                           │
│       └→ visa_processing   (Payment received)                 │
│           ├→ visa_ready    (Approved, ready for onboarding)   │
│           └→ [rejected]    (Visa denied)                      │
│                                                                 │
│ At any stage: → rejected ❌ (Final status)                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘


STAGE 9: INTERVIEW SCHEDULING & EXECUTION
┌──────────────────────────────────┬──────────────────────────────────┐
│      ADMIN SCHEDULES             │   CANDIDATE PARTICIPATES         │
├──────────────────────────────────┼──────────────────────────────────┤
│ URL: /admin/interviews           │ URL: /job-seeker/interviews      │
│                                  │                                  │
│ ┌─ Select Application ─────────┐ │ ┌─ View Scheduled Interviews ┐  │
│ │ from pending or accepted      │ │ │                           │  │
│ │ candidates                    │ │ └─ EACH INTERVIEW CARD ────┘  │
│ └───────────────────────────────┘ │                               │
│                ↓                   │ ├─ Interview Type:            │
│ ┌─ Schedule Interview Form ────┐ │ │  ├─ Video (Zoom/WebRTC)     │
│ │ Date: [Calendar picker]      │ │ │  └─ AI Voice Interview      │
│ │ Time: [Time picker]          │ │ │                               │
│ │ Type: Video / AI Voice       │ │ ├─ Date & Time                │
│ │ Zoom Link: [Input]           │ │ ├─ Company Name               │
│ │ Job Role: [Input]            │ │ ├─ Job Title                  │
│ │ Notes: [Textarea]            │ │ │                               │
│ │ [SCHEDULE] Button            │ │ ├─ ACTION OPTIONS:            │
│ └───────────────────────────────┘ │ │  ├─ [Join Video Interview]  │
│                ↓                   │ │  │  → Opens Zoom/WebRTC    │
│ PUT /admin/interviews/schedule    │ │  │  → Canvas recording       │
│ ✓ Status updated to               │ │  │  → Live audio/video       │
│   "interview_scheduled"            │ │  │                           │
│ 📧 Notification sent               │ │  └─ [Start AI Interview]    │
│                                   │ │     → Opens Modal           │
│ ADMIN VIEW:                       │ │     → Microphone access     │
│ ├─ Scheduled Interviews List      │ │     → AI asks questions     │
│ ├─ [Reschedule] → Changes date    │ │     → Records responses     │
│ ├─ [Complete] → Mark as done      │ │     → Analyzes confidence   │
│ ├─ [Feedback] → Add notes         │ │     → Generates summary     │
│ └─ [Cancel] → Cancel interview    │ │                               │
│                                   │ └─ Post Interview:            │
│ On Completion:                    │    ├─ [View Feedback]         │
│ ├─ interview_completed            │    ├─ [Download Transcript]   │
│ ├─ Feedback generated             │    └─ [See Score]            │
│ └─ Ready for next step            │                               │
│                                   │ VOICE INTERVIEW FLOW:         │
│                                   │ [Start] → Microphone → AI    │
│                                   │ asks question → Wait for     │
│                                   │ candidate response → Record  │
│                                   │ → Analyze → Next question    │
│                                   │ → ... → Summary → [Done]    │
│                                   │                               │
└──────────────────────────────────┴──────────────────────────────────┘


STAGE 10: POST-INTERVIEW FLOW
┌─────────────────────────────────────────────────────────────────────────┐
│ After Interview Completed (Status: interview_completed)                  │
│                                                                          │
│ ADMIN DECISION:                                                          │
│ ├─ [Accept] → Status: visa_payment_pending (Candidate hired! 🎉)       │
│ │  └─ Notification: "Congratulations! You've been hired!"              │
│ │     "Please complete visa fee payment"                                │
│ │                                                                        │
│ └─ [Reject] → Status: rejected                                          │
│    └─ Notification: "Thank you for applying..."                         │
│                                                                          │
│ CANDIDATE VIEW (if hired):                                              │
│ ├─ Dashboard shows: "Visa Payment Pending"                             │
│ ├─ My Applications page shows status badge                              │
│ └─ [Pay Visa Fee] button visible                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘


STAGE 11: PAYING VISA FEE
┌─────────────────────────────────────────────────────────────────────────┐
│ When Status = visa_payment_pending                                       │
│                                                                          │
│ [💳 PAY VISA FEE MODAL]                                                  │
│                                                                          │
│ ┌─ Payment Details ──────────────────────────────────────────────────┐  │
│ │ Position: Software Engineer                                       │  │
│ │ Company: Tech Corp                                                │  │
│ │ Fee Amount: 30,000 KES (≈ $230 USD)                              │  │
│ │ Currency: KES (Kenyan Shilling)                                  │  │
│ │ Payment Method: M-Pesa                                           │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ ┌─ Phone Number Input ──────────────────────────────────────────────┐  │
│ │ Enter Phone Number:                                              │  │
│ │ [+254 712 345 678     ] (or 0712345678)                         │  │
│ │                                                                   │  │
│ │ ℹ️ Format accepted:                                              │  │
│ │ • 0712345678 (Kenyan)                                            │  │
│ │ • 254712345678 (International)                                   │  │
│ │ • +254712345678 (International with +)                           │  │
│ │                                                                   │  │
│ │ [CONFIRM & PAY] ──→ POST /payment/initiate                      │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                            ↓                                             │
│ ┌─ M-Pesa STK Prompt ────────────────────────────────────────────────┐  │
│ │ 📱 M-Pesa prompt sent to phone                                    │  │
│ │ Candidate enters PIN on phone                                    │  │
│ │ Payment processed                                                │  │
│ │ Response received                                                │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                            ↓                                             │
│ ┌─ Backend Verification ────────────────────────────────────────────┐  │
│ │ POST /payment/verify                                             │  │
│ │ ✓ Payment successful                                             │  │
│ │ ✓ Status updated to: visa_processing                            │  │
│ │ ✓ Database record created                                        │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                            ↓                                             │
└─────────────────────────────────────────────────────────────────────────┘


STAGE 12: FINAL OUTCOME
┌─────────────────────────────────────────────────────────────────────────┐
│ URL: /job-seeker/payment-success                                        │
│ Component: src/pages/job-seeker/payment-success.tsx                     │
│                                                                          │
│ [✅ PAYMENT SUCCESS PAGE]                                                │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ 🎉 CONGRATULATIONS! 🎉                                           │   │
│ │                                                                  │   │
│ │ Your visa processing fee has been received!                    │   │
│ │                                                                  │   │
│ │ Transaction Details:                                            │   │
│ │ ├─ Transaction ID: MPY_230234857263847                         │   │
│ │ ├─ Amount Paid: 30,000 KES                                     │   │
│ │ ├─ Date: April 5, 2026 - 2:34 PM                              │   │
│ │ ├─ Status: ✓ COMPLETED                                        │   │
│ │ └─ Service: Visa Processing Fee                                │   │
│ │                                                                  │   │
│ │ Next Steps:                                                      │   │
│ │ ☐ You'll receive periodic updates via email                    │   │
│ │ ☐ Visa processing typically takes 14-21 business days         │   │
│ │ ☐ Check your dashboard for status updates                     │   │
│ │                                                                  │   │
│ │ [📥 Download Receipt] [📊 View Dashboard] [🏠 Go Home]         │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ BACKEND STATUS PROGRESSION:                                             │
│ visa_payment_pending → visa_processing → visa_ready (7-14 days)        │
│                                                                          │
│ FINAL SCENARIOS:                                                         │
│ ┌─ IF APPROVED ────────────────────────────────────────────────────┐   │
│ │ Status: visa_ready ✅                                            │   │
│ │ Email: "Your visa has been approved! Ready for onboarding."     │   │
│ │ Action: Ready for employment                                    │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│ ┌─ IF REJECTED ────────────────────────────────────────────────────┐   │
│ │ Status: visa_rejected ❌                                         │   │
│ │ Email: "Visa application was not approved. Next steps..."       │   │
│ │ Action: View feedback, apply to other jobs                      │   │
│ └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

COMPLETE USER JOURNEY SUMMARY:

1. 🏠 Landing Page → Info about platform
2. ✍️ Register → Email verification with OTP
3. 🔐 Login → JWT token issued
4. 📊 Dashboard → Role-based routing
5. 👤 Profile → Complete profile & upload CV
6. 💼 Browse Jobs → Search & filter available positions
7. ✒️ Apply → Submit with documents & cover letter
8. 📋 Application Status → Admin reviews & updates status
9. 📞 Interviews → Video or AI voice interview
10. 📈 Post-Interview → Accept/reject decision
11. 💳 Payment → Pay visa fee via M-Pesa
12. ✅ Final Outcome → Visa processing → Employment ready

═══════════════════════════════════════════════════════════════════════════════

KEY STATUS BADGES COLOR CODES:
🟡 Pending     (Yellow)    - Waiting action
🔵 Reviewed    (Blue)      - Admin reviewing
🟢 Accepted    (Green)     - Shortlisted
🟣 Interview   (Purple)    - Interview stage
🟠 Visa        (Orange)    - Visa processing
✅ Ready       (Green)     - Ready for work
❌ Rejected    (Red)       - Application rejected

═══════════════════════════════════════════════════════════════════════════════
```

## Quick Navigation Reference

| Step | Page | URL | Component |
|------|------|-----|-----------|
| 1 | Landing Page | `/` | `src/pages/index.tsx` |
| 2 | Register | `/register` | `src/pages/register.tsx` |
| 2a | Verify OTP | `/verify-otp` | `src/pages/verify-otp.tsx` |
| 3 | Login | `/login` | `src/pages/login.tsx` |
| 4 | Dashboard Router | `/dashboard` | `src/pages/dashboard.tsx` |
| 4a | Admin Dashboard | `/admin/dashboard` | `src/pages/admin/dashboard/index.tsx` |
| 4b | User Dashboard | `/job-seeker/dashboard` | `src/pages/job-seeker/dashboard/index.tsx` |
| 5 | Profile Setup | `/job-seeker/profile` | `src/pages/job-seeker/profile.tsx` |
| 6 | Browse Jobs | `/jobs` | `src/pages/jobs/index.tsx` |
| 6a | Job Details | `/jobs/[id]` | `src/pages/jobs/[id].tsx` |
| 7 | Apply for Job | `/jobs/[id]/apply` | `src/pages/jobs/apply/[id].tsx` |
| 8 | My Applications | `/job-seeker/applications` | `src/pages/job-seeker/applications.tsx` |
| 8a | Admin Applications | `/admin/applications` | `src/pages/admin/applications.tsx` |
| 9 | My Interviews | `/job-seeker/interviews` | `src/pages/job-seeker/interviews.tsx` |
| 9a | Admin Interviews | `/admin/interviews` | `src/pages/admin/interviews.tsx` |
| 11 | Payment Success | `/job-seeker/payment-success` | `src/pages/job-seeker/payment-success.tsx` |

