# Airswift Job Portal - Complete System Documentation

## Overview
Airswift is a comprehensive job portal platform designed specifically for Canada-based immigration jobs. The system connects job seekers with employers through an AI-powered application process, featuring voice interviews, automated CV analysis, and secure document management.

)## Architecture Overview

### Tech Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens with Passport.js (Google OAuth)
- **Real-time Communication**: Socket.io for voice interviews
- **AI Integration**: OpenAI GPT-4 for CV analysis and voice interviews
- **File Storage**: Cloudinary for document uploads
- **Email Service**: Brevo (Sendinblue) for notifications
- **Payment Processing**: Integrated payment system for interview fees

### Core Components
1. **User Management System** - Registration, authentication, and profile management
2. **Job Management** - Admin-controlled job postings with categories
3. **Application System** - Secure application submission with document encryption
4. **AI-Powered Features** - CV analysis, voice interviews, skill matching
5. **Payment Integration** - Interview fees and visa processing payments
6. **Audit & Compliance** - Complete logging system for regulatory compliance

## User Roles & Permissions

### 1. Job Seekers (Users)
- Register and verify email with OTP
- Complete profile with CV, passport, and national ID
- Browse and apply for active jobs
- Track application status
- Participate in voice/video interviews
- Make payments for interview fees and visa processing

### 2. Administrators
- Create and manage job postings
- Review and shortlist applications
- Schedule interviews
- Update application statuses
- Access audit logs and reports
- Manage system settings

## Application Workflow

### Job Seeker Journey

#### Phase 1: Registration & Profile Setup
1. **User Registration**
   - Submit name, email, and password
   - Receive OTP verification email
   - Verify email with OTP code
   - Account becomes active

2. **Profile Completion**
   - Upload CV (PDF only)
   - Upload passport copy
   - Upload national ID
   - Documents are encrypted and stored securely

#### Phase 2: Job Discovery & Application
1. **Job Browsing**
   - View active job listings by category
   - Search jobs by keywords
   - Filter by location, salary range
   - View detailed job requirements

2. **Job Application**
   - Select job and submit cover letter
   - Upload required documents (CV, passport, national ID)
   - Documents are encrypted using AES-256
   - Application status set to "pending"

#### Phase 3: Application Review & Interview
1. **Application Review**
   - Admin reviews application
   - CV analyzed by AI for skill matching
   - Application status updated (shortlisted/rejected)

2. **Interview Process**
   - Shortlisted candidates pay interview fee (3 USD)
   - Interview scheduled by admin
   - Voice interview conducted via AI interviewer
   - Real-time conversation with speech analysis

#### Phase 4: Final Selection & Visa Processing
1. **Hiring Decision**
   - Admin updates status to "hired"
   - Candidate receives notification

2. **Visa Processing**
   - Pay visa processing fee (30,000 KSH)
   - Admin manages visa application process

### Admin Workflow

#### Job Management
1. **Create Job Postings**
   - Set job title, description, requirements
   - Assign to job category
   - Set salary range and location
   - Define expiry date
   - Post becomes active immediately

2. **Application Management**
   - View all applications with filters
   - Review CV and documents
   - Update application status
   - Schedule interviews
   - Send automated notifications

#### System Administration
- Access audit logs for compliance
- Generate reports
- Manage user accounts
- Configure system settings

## AI-Powered Features

### 1. CV Analysis & Skill Matching
- **Automatic CV Processing**: Extracts text from PDF documents
- **Skill Extraction**: Identifies technical and soft skills
- **Job Matching**: Calculates compatibility score (0-100)
- **Intelligent Recommendations**: Suggests suitable candidates

**Process Flow:**
```
PDF Upload → Text Extraction → AI Analysis → Skill Mapping → Match Score
```

### 2. AI Voice Interview System
- **Conversational AI**: Natural interview flow using GPT-4
- **Real-time Analysis**: Evaluates communication and technical skills
- **Speech Processing**: Analyzes voice responses for content and delivery
- **Session Management**: Persistent interview sessions with cleanup

**Technical Architecture:**
```
Frontend (WebRTC)
    ↓ Socket.io
Backend (Node.js)
    ↓ OpenAI API
AI Response Generation
    ↓ ElevenLabs (Optional)
Voice Synthesis
    ↓ Stream Back
```

### 3. Autonomous Recruiter AI
- **Bulk Processing**: Handles multiple applications simultaneously
- **Automated Screening**: Initial candidate evaluation
- **Smart Shortlisting**: AI-powered candidate ranking

## Security & Compliance

### Data Protection
- **Document Encryption**: AES-256 encryption for sensitive files
- **Secure Storage**: Cloudinary with access controls
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds

### Audit System
- **Complete Logging**: All user actions tracked
- **Compliance Ready**: Regulatory compliance logging
- **Admin Oversight**: Full visibility into system activities

### Rate Limiting & Security
- **API Rate Limiting**: Prevents abuse and DoS attacks
- **Input Validation**: Joi schema validation for all inputs
- **File Type Restrictions**: PDF-only uploads with size limits

## Payment Integration

### Interview Fees
- **Amount**: 3 USD per interview
- **Purpose**: Covers AI interview processing costs
- **Payment Methods**: Integrated payment gateway

### Visa Processing Fees
- **Amount**: 30,000 KSH
- **Purpose**: Administrative and processing fees
- **Payment Methods**: Local payment integration

## API Architecture

### Authentication Endpoints
```
POST /api/auth/register          - User registration
POST /api/auth/verify-otp        - Email verification
POST /api/auth/login             - User login
GET  /api/auth/google            - Google OAuth initiation
GET  /api/auth/google/callback   - Google OAuth callback
GET  /api/auth/me                - Get current user info
```

### Job Management
```
GET  /api/jobs                   - List active jobs
GET  /api/jobs/:id               - Get job details
POST /api/admin/jobs             - Create job (admin)
PUT  /api/admin/jobs/:id         - Update job (admin)
DELETE /api/admin/jobs/:id       - Delete job (admin)
```

### Application System
```
POST /api/applications/apply     - Submit job application
GET  /api/applications/my        - Get user's applications
GET  /api/admin/applications     - List all applications (admin)
PUT  /api/admin/applications/:id/status - Update application status
```

### AI Features
```
POST /api/ai/analyze-cv          - Analyze CV with AI
POST /api/interviews/start-voice - Start AI voice interview
WebSocket: voice-response        - Send voice response
WebSocket: end-voice-interview   - End interview session
```

## Database Schema

### Core Tables
- **Users**: User accounts with authentication data
- **Jobs**: Job postings with requirements and metadata
- **Applications**: Job applications with document links
- **Profiles**: Extended user profile information
- **Payments**: Payment transactions and records
- **Interviews**: Interview scheduling and results
- **AuditLogs**: System activity logging

### Key Relationships
- User → Applications (one-to-many)
- Job → Applications (one-to-many)
- Application → Payments (one-to-one)
- Application → Interviews (one-to-one)

## Real-time Features

### Socket.io Integration
- **Voice Interviews**: Real-time audio streaming
- **Live Updates**: Application status notifications
- **Interview Sessions**: Persistent WebRTC connections

### WebRTC Implementation
- **Video Calling**: Peer-to-peer video communication
- **Screen Sharing**: Document sharing during interviews
- **Recording**: Optional interview recording for review

## Deployment & Scaling

### Production Environment
- **Backend**: Render.com hosting
- **Database**: PostgreSQL on cloud provider
- **File Storage**: Cloudinary CDN
- **Email Service**: Brevo SMTP

### Environment Configuration
```env
# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=airswift_db

# Authentication
JWT_SECRET=your-jwt-secret

# External Services
OPENAI_API_KEY=your-openai-key
BREVO_API_KEY=your-brevo-key
CLOUDINARY_URL=your-cloudinary-url

# Application
FRONTEND_URL=https://airswift-frontend.vercel.app
PORT=5000
```

## Monitoring & Maintenance

### System Health Checks
- **Database Connectivity**: Automatic health monitoring
- **API Response Times**: Performance tracking
- **Error Logging**: Comprehensive error tracking
- **Background Jobs**: Automated task monitoring

### Backup & Recovery
- **Database Backups**: Automated daily backups
- **File Backups**: Cloud storage redundancy
- **Disaster Recovery**: Failover procedures documented

## Future Enhancements

### Planned Features
- **Mobile Application**: React Native mobile app
- **Advanced Analytics**: Detailed recruitment analytics
- **Multi-language Support**: Internationalization
- **Integration APIs**: Third-party HR system integration
- **Advanced AI**: Machine learning for better matching

### Scalability Improvements
- **Microservices Architecture**: Service decomposition
- **Redis Caching**: Performance optimization
- **Load Balancing**: Horizontal scaling support
- **CDN Integration**: Global content delivery

---

## Quick Start Guide

### For Job Seekers
1. Register account at https://airswift-frontend.vercel.app
2. Verify email with OTP
3. Complete profile with documents
4. Browse and apply for jobs
5. Pay interview fee when shortlisted
6. Complete AI voice interview
7. Pay visa processing fee when hired

### For Administrators
1. Login with admin credentials
2. Create job postings in admin panel
3. Review applications and update statuses
4. Schedule interviews for shortlisted candidates
5. Monitor system activity via audit logs

This comprehensive system provides a complete solution for AI-powered recruitment with end-to-end security, compliance, and user experience optimization.
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── public/                 # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🔗 API Integration

The frontend integrates with the Airswift backend API. Key endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Jobs**: `/api/jobs`, `/api/jobs/:id`
- **Applications**: `/api/applications/apply`, `/api/applications/my`
- **Profile**: `/api/profile`, `/api/profile/upload-cv`
- **Admin**: `/api/admin/jobs`, `/api/admin/applications`

## 🎨 Design System

- **Colors**: Primary (Teal), Secondary (Cyan), Accent (Amber)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Consistent button styles, form inputs, and layouts
- **Responsive**: Mobile-first design that works on all devices

## 🔐 Security

- JWT-based authentication with secure cookie storage
- Protected routes for authenticated users
- Input validation and sanitization
- File upload restrictions (PDF only, size limits)

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `out` folder to Netlify
3. Configure environment variables

## 🧪 Testing

```bash
npm run build  # Check for build errors
npm run lint   # Check code quality
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Airswift** - Connecting talent with opportunity in Canada 🇨🇦