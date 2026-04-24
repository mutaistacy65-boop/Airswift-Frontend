# User Dashboard Implementation Guide

## Overview
This document outlines the comprehensive user dashboard system implemented for the Airswift Frontend application.

## ✅ Implemented Features

### 1. **User Dashboard Layout** (`UserDashboardLayout.tsx`)
- Responsive sidebar navigation (mobile & desktop)
- Top navigation bar with notifications bell
- User profile dropdown
- Real-time notification counter
- Role-based navigation items
- Logout functionality

**Navigation Items:**
- 🏠 Dashboard
- 📝 Apply
- 📂 Applications
- 📅 Interviews
- 💬 Messages
- ⚙️ Settings

### 2. **Enhanced Dashboard Page** (`/job-seeker/dashboard`)
- Welcome message with profile completion indicator
- Summary cards showing:
  - Total Applications
  - Pending Applications
  - Interviews Scheduled
  - Unread Messages
- Recent Activity feed (applications, interviews, messages)
- Profile completion reminder
- Quick links to key sections
- Pro tips section

### 3. **Messages Page** (`/job-seeker/messages`)
- Real-time chat interface with admin
- Message history
- File attachment support
- Message statistics
- Read/unread indicators
- Message guidelines and help section
- Socket.IO integration for real-time updates

### 4. **Settings/Profile Page** (`/job-seeker/settings`)
- Personal information editing (name, phone, location, bio)
- Skills and experience management
- Education details
- CV upload with validation
- Password change functionality
- Account information display
- Profile completion tracking

### 5. **Notifications Page** (`/job-seeker/notifications`)
- Notification list with filtering by type
- Mark as read functionality
- Delete notifications
- Mark all as read
- Unread count display
- Type-based icons and colors:
  - 📝 Application notifications
  - 📅 Interview notifications
  - 💬 Message notifications
  - ℹ️ System notifications

### 6. **Components Created**

#### `UserDashboardLayout.tsx`
Main layout wrapper for all user dashboard pages.

**Props:**
- `children: React.ReactNode` - Page content

#### `DashboardSummary.tsx`
Displays summary cards with stats and links.

**Props:**
- `cards: SummaryCard[]` - Array of summary cards
- `loading?: boolean` - Loading state

**Card Structure:**
```typescript
{
  title: string
  value: number
  icon: string
  color: string (Tailwind border color)
  link?: string
  description?: string
}
```

#### `RecentActivity.tsx`
Shows recent activities with timeline.

**Props:**
- `activities: ActivityItem[]` - Activity items
- `loading?: boolean` - Loading state
- `limit?: number` - Number of items to display (default: 5)

**Activity Structure:**
```typescript
{
  id: string
  type: 'application' | 'interview' | 'message' | 'status_change'
  title: string
  description?: string
  timestamp: string
  icon: string
  link?: string
  action?: string
}
```

#### `ChatWindow.tsx`
Real-time messaging interface.

**Props:**
- `messages: Message[]` - Array of messages
- `loading?: boolean` - Loading state
- `onSendMessage?: (content: string, attachment?: File) => void` - Send handler
- `sending?: boolean` - Sending state
- `recipientName?: string` - Display name of recipient

## 🔌 API Endpoints Required

### Applications
- `GET /applications/my` - Get user's applications
- `POST /applications` - Submit new application
- `PUT /applications/:id` - Update application status
- `DELETE /applications/:id` - Cancel application

### Interviews
- `GET /interviews/my` - Get user's interviews
- `PUT /interviews/:id/confirm` - Confirm interview
- `PUT /interviews/:id/reschedule` - Reschedule interview
- `GET /interviews/:id/zoom-link` - Get zoom link

### Messages
- `GET /messages` - Get all messages
- `GET /messages/recent` - Get recent messages
- `POST /messages/send` - Send message
- `PUT /messages/mark-as-read` - Mark as read
- `PUT /messages/:id/read` - Mark specific message as read

### Notifications
- `GET /notifications` - Get all notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /profile/cv-upload` - Upload CV
- `PUT /auth/change-password` - Change password

## 🔐 Authentication & Guards

All pages use the auth guard pattern:
```typescript
useEffect(() => {
  if (isLoading) return
  if (!user) router.push('/login')
  if (user?.role !== 'user') router.push('/unauthorized')
}, [user, isLoading, router])
```

## 🔔 Real-Time Features

### Socket.IO Events
- `new_message` - New message received
- `application_status_updated` - Application status changed
- `interview_scheduled` - Interview scheduled
- `notification` - General notification

### Implementation
```typescript
const { subscribe } = useSocket()

useEffect(() => {
  const unsubscribe = subscribe('event_name', (data) => {
    // Handle event
  })
  return () => unsubscribe()
}, [])
```

## 📱 Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile
- Touch-friendly buttons and inputs
- Optimized for tablets and desktops

## 🎨 UI/UX Features
- Loading spinners for data fetching
- Empty states with helpful messages
- Success/error toast notifications
- Progress indicators
- Color-coded status displays
- Hover effects and transitions
- Accessible form inputs
- Mobile navigation hamburger menu

## 📊 Data Flow

1. **Dashboard**: Loads user's applications, interviews, messages, and profile
2. **Messages**: Real-time sync with Socket.IO
3. **Notifications**: Real-time updates on events
4. **Profile**: Updates saved to backend
5. **Applications**: Auto-refresh on status changes

## 🚀 Getting Started

### 1. Update Auth Guard in Login Flow
Ensure JWT tokens are properly stored and validated.

### 2. Implement Backend APIs
Create the endpoints listed in "API Endpoints Required" section.

### 3. Configure Socket.IO
Ensure Socket.IO server is running and connected for real-time features.

### 4. Test User Flow
1. Login with regular user account
2. Navigate through dashboard
3. Test message sending
4. Verify notifications
5. Update profile

## 🔧 Configuration

### Environment Variables
```
NEXT_PUBLIC_API_URL=<backend-url>
NEXT_PUBLIC_SOCKET_URL=<socket-server-url>
JWT_SECRET=<secret-key>
```

### Tailwind Configuration
All components use Tailwind CSS classes. Ensure `tailwind.config.js` is properly configured with:
- `primary` color (primary brand color)
- `secondary` color (secondary brand color)

## 📝 Notes

- All user data is private and role-based (user can only see their own data)
- Real-time updates use WebSocket for instant notifications
- Profile completion is tracked and encouraged
- CV uploads are validated for PDF/Word documents
- All forms include proper error handling and validation
- Toast notifications provide user feedback

## 🐛 Known Limitations

- Currently supports single chat with admin
- CV file size limit should be set on backend
- Profile image upload not yet implemented
- Dark mode not yet implemented

## 🔮 Future Enhancements

- [ ] Multiple chat conversations
- [ ] Video interview integration
- [ ] Resume builder
- [ ] Application progress tracker (step-by-step)
- [ ] Dark mode toggle
- [ ] Notification preferences
- [ ] Export application data
