import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import UserDashboardLayout from '@/components/UserDashboardLayout'
import DashboardSummary from '@/components/DashboardSummary'
import RecentActivity, { ActivityItem } from '@/components/RecentActivity'
import Loader from '@/components/Loader'
import API from '@/services/apiClient'

export default function UserDashboard() {
  const { user, isLoading } = useAuth()
  const { addNotification } = useNotification()
  const router = useRouter()

  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [profileCompletion, setProfileCompletion] = useState(0)

  // Guard: Check authentication
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user?.role !== 'user') {
      router.push('/unauthorized')
      return
    }
  }, [user, isLoading, router])

  // Load dashboard data
  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      try {
        setDashboardLoading(true)

        // Fetch applications, interviews, and messages in parallel
        const [appsRes, interviewsRes, messagesRes, profileRes] = await Promise.all([
          API.get('/applications/my').catch(() => ({ data: [] })),
          API.get('/interviews/my').catch(() => ({ data: [] })),
          API.get('/messages/recent').catch(() => ({ data: [] })),
          API.get('/profile').catch(() => ({ data: {} })),
        ])

        const appsData = appsRes.data || []
        const interviewsData = interviewsRes.data || []
        const messagesData = messagesRes.data || []
        const profileData = profileRes.data || {}

        setApplications(appsData)
        setInterviews(interviewsData)
        setMessages(messagesData)

        // Calculate profile completion
        const requiredFields = ['name', 'email', 'phone', 'location']
        const completedFields = requiredFields.filter((field) => profileData[field])
        setProfileCompletion(Math.round((completedFields.length / requiredFields.length) * 100))

        // Build recent activities
        const activities: ActivityItem[] = []

        // Add recent applications
        appsData.slice(0, 2).forEach((app: any) => {
          activities.push({
            id: app._id,
            type: 'application',
            title: app.job_id?.title || 'Application',
            description: `Status: ${app.status}`,
            timestamp: app.created_at,
            icon: '📝',
            link: `/job-seeker/applications`,
            action: app.status,
          })
        })

        // Add upcoming interviews
        interviewsData.slice(0, 2).forEach((interview: any) => {
          activities.push({
            id: interview._id,
            type: 'interview',
            title: interview.job_id?.title || 'Interview',
            description: `Scheduled for ${new Date(interview.scheduledDate).toLocaleDateString()}`,
            timestamp: interview.createdAt,
            icon: '📅',
            link: `/job-seeker/interviews`,
            action: 'scheduled',
          })
        })

        // Add recent messages
        if (messagesData.length > 0) {
          activities.push({
            id: `msg-${Date.now()}`,
            type: 'message',
            title: 'New Message',
            description: `${messagesData[0].sender?.name || 'Admin'}: ${messagesData[0].content?.substring(0, 50)}...`,
            timestamp: messagesData[0].timestamp,
            icon: '💬',
            link: `/job-seeker/messages`,
            action: 'new',
          })
        }

        // Sort activities by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setRecentActivities(activities)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        addNotification('Failed to load dashboard data', 'error')
      } finally {
        setDashboardLoading(false)
      }
    }

    loadDashboardData()
  }, [user, addNotification])

  if (isLoading || !user) {
    return <Loader fullScreen />
  }

  const pendingApps = applications.filter((a) => a.status === 'pending').length
  const interviewsCount = interviews.length
  const unreadMessages = messages.filter((m) => !m.read).length
  const approvedApps = applications.filter((a) => a.status === 'shortlisted' || a.status === 'approved').length

  const summaryCards = [
    {
      title: 'Total Applications',
      value: applications.length,
      icon: '📝',
      color: 'border-blue-500',
      link: '/job-seeker/applications',
      description: `${approvedApps} approved`,
    },
    {
      title: 'Pending Applications',
      value: pendingApps,
      icon: '⏳',
      color: 'border-yellow-500',
      link: '/job-seeker/applications',
      description: 'Awaiting review',
    },
    {
      title: 'Interviews Scheduled',
      value: interviewsCount,
      icon: '📅',
      color: 'border-green-500',
      link: '/job-seeker/interviews',
      description: 'View & manage',
    },
    {
      title: 'Unread Messages',
      value: unreadMessages,
      icon: '💬',
      color: 'border-purple-500',
      link: '/job-seeker/messages',
      description: 'From admin',
    },
  ]

  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">👋 Welcome back, {user?.name}!</h1>
              <p className="text-lg opacity-90">
                Here's your application and interview overview
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-xs opacity-75">Profile Completion</div>
              <div className="text-3xl font-bold mt-1">{profileCompletion}%</div>
              <div className="w-32 h-2 bg-white/30 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <DashboardSummary cards={summaryCards} loading={dashboardLoading} />

        {/* Profile Completion Reminder */}
        {profileCompletion < 100 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Complete your profile to increase your chances
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  You're {100 - profileCompletion}% away from a complete profile. Add missing details now.
                </p>
                <a
                  href="/job-seeker/settings"
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Complete Profile →
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} loading={dashboardLoading} />
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Links</h2>
            <div className="space-y-2">
              <a
                href="/apply"
                className="block p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition duration-200 font-medium"
              >
                📝 Apply for a Job
              </a>
              <a
                href="/job-seeker/applications"
                className="block p-3 bg-green/10 hover:bg-green/20 text-green rounded-lg transition duration-200 font-medium"
              >
                📂 View Applications
              </a>
              <a
                href="/job-seeker/interviews"
                className="block p-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition duration-200 font-medium"
              >
                📅 Check Interviews
              </a>
              <a
                href="/job-seeker/messages"
                className="block p-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition duration-200 font-medium"
              >
                💬 Messages
              </a>
            </div>
          </div>
        </div>

        {/* Tips/Help Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Pro Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded p-4">
              <p className="font-medium text-gray-900">Keep Your Profile Updated</p>
              <p className="text-sm text-gray-600 mt-1">Update your CV and details regularly to improve chances</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-medium text-gray-900">Respond to Interviews Quickly</p>
              <p className="text-sm text-gray-600 mt-1">Confirm or reschedule interviews promptly</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-medium text-gray-900">Check Messages Often</p>
              <p className="text-sm text-gray-600 mt-1">Admin may have important updates for you</p>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
