# Airswift Documentation Index

Complete documentation suite for the Airswift platform - frontend and backend integration.

---

## 📚 Documentation Files

### 1. **Website Flow Implementation** 
📄 [`WEBSITE_FLOW_IMPLEMENTATION.md`](./WEBSITE_FLOW_IMPLEMENTATION.md)

Complete mapping of the 12-stage user journey with corresponding frontend implementation details.

**What's Included:**
- Landing page to final outcome mapping
- Frontend file locations and component references
- Feature descriptions for each stage
- Service layer documentation
- Context providers and state management
- Environment variables required
- Testing checklist

**Best For:** Understanding the complete flow from landing to visa payment

---

### 2. **Website Flow Visual Map**
📄 [`WEBSITE_FLOW_VISUAL_MAP.md`](./WEBSITE_FLOW_VISUAL_MAP.md)

ASCII art visual representation of the entire user journey with UI mockups.

**What's Included:**
- Visual flowcharts for each user journey stage
- UI mockup descriptions
- Status color coding
- User action flows
- Quick navigation reference table
- Status badge meanings

**Best For:** Visual learners and overview understanding

---

### 3. **Backend API Routes**
📄 [`BACKEND_API_ROUTES.md`](./BACKEND_API_ROUTES.md)

Complete backend API endpoint documentation organized by feature.

**What's Included:**
- All 50+ API endpoints documented
- Request/response examples for each endpoint
- Authentication flows (email/password + OAuth)
- Profile management endpoints
- Job browsing and search endpoints
- Application submission and tracking
- Interview scheduling and AI voice interviews
- M-Pesa payment integration
- Admin portal endpoints
- Error handling and HTTP status codes
- Rate limiting information
- Security headers

**Best For:** Developers implementing API calls

---

### 4. **Frontend API Integration**
📄 [`FRONTEND_API_INTEGRATION.md`](./FRONTEND_API_INTEGRATION.md)

Maps frontend components and pages to backend API calls.

**What's Included:**
- Quick reference table of components → API endpoints
- Service layer organization
- Protected routes and authentication
- Real-time WebSocket events
- Error handling patterns
- API client interceptors
- Notification system
- File upload handling
- Quick start guide for adding new endpoints
- Troubleshooting common API issues

**Best For:** Frontend developers integrating APIs

---

### 5. **API Endpoints Quick Reference**
📄 [`API_ENDPOINTS_REFERENCE.md`](./API_ENDPOINTS_REFERENCE.md)

Cheat sheet for all API endpoints organized by category.

**What's Included:**
- All endpoints in quick-reference tables
- Endpoint summary by user journey phase
- HTTP status codes
- Common request headers
- Rate limiting rules
- File upload specifications
- WebSocket events
- Common errors and solutions
- Copy-paste URLs
- Testing with cURL and Postman

**Best For:** Quick lookups and reference

---

## 🎯 Which Documentation to Read?

### For Project Managers
1. Start with [Website Flow Visual Map](./WEBSITE_FLOW_VISUAL_MAP.md)
2. Reference [Website Flow Implementation](./WEBSITE_FLOW_IMPLEMENTATION.md) for details

### For Frontend Developers
1. [Frontend API Integration](./FRONTEND_API_INTEGRATION.md) - Component to API mapping
2. [API Endpoints Quick Reference](./API_ENDPOINTS_REFERENCE.md) - Endpoint list
3. [Backend API Routes](./BACKEND_API_ROUTES.md) - Full endpoint details

### For Backend Developers
1. [Backend API Routes](./BACKEND_API_ROUTES.md) - Full documentation
2. [API Endpoints Quick Reference](./API_ENDPOINTS_REFERENCE.md) - Endpoint summary

### For New Team Members
1. [Website Flow Visual Map](./WEBSITE_FLOW_VISUAL_MAP.md) - Overview
2. [Website Flow Implementation](./WEBSITE_FLOW_IMPLEMENTATION.md) - Detailed flow
3. [Frontend API Integration](./FRONTEND_API_INTEGRATION.md) - How it all connects

### For Testing/QA
1. [API Endpoints Quick Reference](./API_ENDPOINTS_REFERENCE.md) - All endpoints
2. [Website Flow Implementation](./WEBSITE_FLOW_IMPLEMENTATION.md) - Expected behaviors
3. [Testing checklist](./WEBSITE_FLOW_IMPLEMENTATION.md#testing-checklist) in implementation guide

---

## 📊 Platform Overview

### Technology Stack

**Frontend:**
- Next.js 14.0+ (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Socket.io (real-time)
- Axios (HTTP client)

**Backend:**
- Node.js + Express (API server)
- MongoDB (database)
- JWT (authentication)
- OpenAI (AI features)
- M-Pesa (payments)
- SendGrid (email)

---

## 🔄 Complete User Journey at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    AIRSWIFT USER JOURNEY                     │
└─────────────────────────────────────────────────────────────┘

1. 🏠 Landing Page
   └─→ Register / Login

2. ✍️ Registration
   └─→ Email verification with OTP

3. 🔐 Login
   └─→ JWT token issued

4. 📊 Dashboard
   └─→ Role-based routing (Admin/User)

5. 👤 Profile Setup
   ├─→ Personal info
   ├─→ CV upload + AI analysis
   └─→ Document uploads

6. 💼 Browse Jobs
   └─→ Search, filter, view details

7. ✒️ Apply for Job
   └─→ Submit documents + cover letter

8. 📋 Application Review
   ├─→ Admin reviews CV + AI analysis
   └─→ Status updates sent to candidate

9. 📞 Interview
   ├─→ Video interview (Zoom)
   └─→ AI voice interview

10. 📈 Post-Interview
    └─→ Accept/reject decision

11. 💳 Visa Fee Payment
    └─→ M-Pesa payment processing

12. ✅ Final Outcome
    └─→ Visa processing status
```

---

## 🔑 Key Features Implemented

### Authentication
- ✅ Email/password registration with OTP verification
- ✅ JWT-based authentication
- ✅ Google OAuth 2.0 integration
- ✅ Password reset functionality
- ✅ Token refresh mechanism
- ✅ Rate-limited login attempts

### Profile Management
- ✅ User profile CRUD operations
- ✅ CV upload and AI-powered analysis
- ✅ Skill extraction from CV
- ✅ Document management (Passport, National ID)
- ✅ Profile picture upload

### Job Management
- ✅ Job listing with pagination
- ✅ Advanced search and filtering
- ✅ Job category management
- ✅ Visa sponsorship indication
- ✅ Job application count tracking

### Application Tracking
- ✅ Multi-stage application workflow
- ✅ Real-time status updates
- ✅ Document encryption and storage
- ✅ AI-powered CV matching
- ✅ Email notifications

### Interview System
- ✅ Interview scheduling by admins
- ✅ Video interview via Zoom/WebRTC
- ✅ AI-powered voice interviews
- ✅ Real-time Q&A scoring
- ✅ Interview feedback generation
- ✅ Transcript and analysis

### Payment Integration
- ✅ M-Pesa payment gateway
- ✅ STK push for mobile payments
- ✅ Payment verification and confirmation
- ✅ Receipt generation
- ✅ Transaction history

### Admin Dashboard
- ✅ Application kanban board
- ✅ Interview pipeline visualization
- ✅ Real-time statistics
- ✅ Job management
- ✅ Category management
- ✅ Settings and configuration

---

## 📡 API Statistics

| Category | Count |
|----------|-------|
| Authentication Endpoints | 13 |
| Profile Endpoints | 4 |
| Job Endpoints | 10 |
| Application Endpoints | 6 |
| Interview Endpoints | 9 |
| Payment Endpoints | 5 |
| Admin Endpoints | 4 |
| AI/Analysis Endpoints | 3 |
| **TOTAL** | **54** |

---

## 🔗 Database Models

### Core Models
- **User** - Candidate and admin accounts
- **Job** - Job listings
- **Application** - Job applications with documents
- **Interview** - Interview records and results
- **Payment** - Payment transactions
- **JobCategory** - Job classification

### Key Fields
- User: `email`, `password`, `role`, `profile`, `cvUrl`, `isVerified`
- Job: `title`, `company`, `salary`, `location`, `requirements`, `isActive`
- Application: `jobId`, `userId`, `status`, `documents`, `cvScore`, `matchScore`
- Interview: `applicationId`, `type`, `date`, `zoomLink`, `feedback`, `score`
- Payment: `applicationId`, `amount`, `status`, `transactionId`, `paymentMethod`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB connection
- M-Pesa merchant account
- Google OAuth credentials
- OpenAI API key
- SendGrid API key

### Environment Setup
```
.env.local file should contain:
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_EMAILJS_*
- Database connection strings
- Payment provider keys
- OAuth credentials
```

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Document encryption
- HTTPS enforcement
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure headers (CSP, HSTS, etc.)

---

## 📞 Support & Resources

### Documentation Files
| File | Purpose |
|------|---------|
| [WEBSITE_FLOW_IMPLEMENTATION.md](./WEBSITE_FLOW_IMPLEMENTATION.md) | Complete flow mapping |
| [WEBSITE_FLOW_VISUAL_MAP.md](./WEBSITE_FLOW_VISUAL_MAP.md) | Visual diagrams |
| [BACKEND_API_ROUTES.md](./BACKEND_API_ROUTES.md) | API documentation |
| [FRONTEND_API_INTEGRATION.md](./FRONTEND_API_INTEGRATION.md) | Integration guide |
| [API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md) | Quick reference |

### External Links
- Backend Repository: https://github.com/EMANUELKIRUI/Airswift-Backend
- Frontend Repository: https://github.com/EMANUELKIRUI/Airswift-Frontend
- Backend API URL: https://airswift-backend-fjt3.onrender.com
- Frontend URL: https://airswift-frontend.vercel.app

---

## 👥 Key Contacts

- **Project Lead:** [Your name/email]
- **Backend Developer:** [Contact info]
- **Frontend Developer:** [Contact info]
- **DevOps:** [Contact info]

---

## 📝 Documentation Changelog

| Date | Changes | Author |
|------|---------|--------|
| 2026-04-05 | Initial documentation suite | Copilot |
| 2026-04-05 | Added API endpoints reference | Copilot |
| 2026-04-05 | Created visual flow map | Copilot |
| 2026-04-05 | Frontend integration guide | Copilot |

---

## 📋 Quick Links

| Purpose | Document |
|---------|----------|
| "Show me everything" | [Website Flow Implementation](./WEBSITE_FLOW_IMPLEMENTATION.md) |
| "Show me pictures" | [Visual Flow Map](./WEBSITE_FLOW_VISUAL_MAP.md) |
| "How do I call this API?" | [Frontend API Integration](./FRONTEND_API_INTEGRATION.md) |
| "What endpoints exist?" | [API Quick Reference](./API_ENDPOINTS_REFERENCE.md) |
| "Tell me all details" | [Backend API Routes](./BACKEND_API_ROUTES.md) |

---

## ✅ Documentation Quality Checklist

- ✅ All 12 user journey stages documented
- ✅ 50+ API endpoints documented
- ✅ Frontend file locations referenced
- ✅ Request/response examples provided
- ✅ Error handling documented
- ✅ Real-time events documented
- ✅ Admin features documented
- ✅ Payment flow documented
- ✅ Authentication flows documented
- ✅ Visual diagrams included
- ✅ Quick reference tables provided
- ✅ Troubleshooting guide included

---

## 🎓 Learning Paths

### For Understanding the Product (30 minutes)
1. Read [Visual Flow Map](./WEBSITE_FLOW_VISUAL_MAP.md) - 10 min
2. Read [Implementation Guide](./WEBSITE_FLOW_IMPLEMENTATION.md) - first 3 sections - 15 min
3. Review [Quick Reference](./API_ENDPOINTS_REFERENCE.md) - 5 min

### For Frontend Development (2 hours)
1. [Frontend API Integration](./FRONTEND_API_INTEGRATION.md) - 45 min
2. [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md) - 30 min
3. Code review: `src/services/` - 30 min
4. Code review: `src/pages/` - 15 min

### For Backend Development (2 hours)
1. [Backend API Routes](./BACKEND_API_ROUTES.md) - 60 min
2. [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md) - 30 min
3. Backend code review - 30 min

### For QA/Testing (1.5 hours)
1. [Implementation Guide](./WEBSITE_FLOW_IMPLEMENTATION.md) - Testing section - 20 min
2. [Quick Reference](./API_ENDPOINTS_REFERENCE.md) - 30 min
3. [Backend API Routes](./BACKEND_API_ROUTES.md) - Error section - 20 min
4. Manual testing - 40 min

---

## 📞 Document Version Control

**Current Version:** 1.0.0  
**Last Updated:** April 5, 2026  
**Status:** Complete & Ready for Use  
**Reviewed By:** Development Team  

---

## 📄 License

All documentation is part of the Airswift project and follows the project's license terms.

---

**Ready to get started?** Pick a document above based on your role! 🚀

