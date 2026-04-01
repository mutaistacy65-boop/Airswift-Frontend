# Airswift Frontend

A modern, responsive web application for the Airswift job portal, connecting job seekers with Canada-based immigration opportunities.

## 🌟 Features

### For Job Seekers
- **Browse Jobs**: Search and filter jobs by category, location, and salary
- **Apply Easily**: One-click application with CV upload
- **Track Applications**: Real-time status updates (pending, reviewed, accepted, rejected)
- **Interview Management**: Scheduled interviews with meeting links
- **Profile Management**: Complete profile with CV upload and skills
- **Payment Integration**: Secure mobile money payments for interview fees (3 KSH) and visa processing (30,000 KSH)

### For Admins
- **Job Management**: Create, edit, and manage job postings
- **Application Review**: View and update application statuses
- **Interview Scheduling**: Schedule interviews with candidates
- **User Management**: Manage user accounts and permissions
- **Dashboard Analytics**: Overview of jobs, applications, and users

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT with secure cookie storage
- **File Upload**: Support for PDF CV uploads
- **Notifications**: Toast notifications for user feedback

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/EMANUELKIRUI/Airswift-Frontend.git
cd Airswift-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
airswift-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Shared components (Navbar, Footer, etc.)
│   │   ├── auth/           # Authentication components
│   │   ├── jobs/           # Job-related components
│   │   └── ...
│   ├── pages/              # Next.js pages
│   │   ├── index.tsx       # Home page
│   │   ├── jobs/           # Job pages
│   │   ├── login.tsx       # Login page
│   │   ├── register.tsx    # Registration page
│   │   ├── job-seeker/     # Job seeker dashboard
│   │   └── admin/          # Admin dashboard
│   ├── layouts/            # Layout components
│   ├── context/            # React contexts
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
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