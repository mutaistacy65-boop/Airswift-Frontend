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
          API.get('/profile').catch(() => ({ data: {} }))
        ])

        const apps = appsRes.data || []
        const ints = interviewsRes.data || []
        const msgs = messagesRes.data || []
        const profile = profileRes.data || {}

        setApplications(apps)
        setInterviews(ints)
        setMessages(msgs)

        // Calculate profile completion
        const completionFields = ['name', 'email', 'phone', 'location', 'bio', 'skills', 'education']
        const completedFields = completionFields.filter(field => profile[field]).length
        setProfileCompletion(Math.round((completedFields / completionFields.length) * 100))

        // Generate recent activities
        const activities: ActivityItem[] = []

        // Add recent applications
        apps.slice(0, 3).forEach((app: any) => {
          activities.push({
            id: `app-${app.id}`,
            type: 'application',
            title: `Applied for ${app.jobTitle || 'Position'}`,
            description: `Status: ${app.status}`,
            timestamp: app.createdAt,
            icon: '📝',
            link: `/job-seeker/applications`,
            action: app.status
          })
        })

        // Add recent interviews
        ints.slice(0, 2).forEach((interview: any) => {
          activities.push({
            id: `interview-${interview.id}`,
            type: 'interview',
            title: `Interview scheduled`,
            description: `${interview.jobTitle || 'Position'} - ${new Date(interview.scheduledAt).toLocaleDateString()}`,
            timestamp: interview.createdAt,
            icon: '📅',
            link: `/job-seeker/interviews`,
            action: 'scheduled'
          })
        })

        // Add recent messages
        msgs.slice(0, 2).forEach((message: any) => {
          activities.push({
            id: `message-${message.id}`,
            type: 'message',
            title: `New message from ${message.senderName || 'Admin'}`,
            description: message.content?.substring(0, 50) + '...',
            timestamp: message.createdAt,
            icon: '💬',
            link: `/job-seeker/messages`,
            action: message.read ? 'read' : 'unread'
          })
        })

        // Sort by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setRecentActivities(activities.slice(0, 5))

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load dashboard data'
        })
      } finally {
        setDashboardLoading(false)
      }
    }

    loadDashboardData()
  }, [user, addNotification])

  if (isLoading || dashboardLoading) {
    return <Loader fullScreen />
  }

  // Calculate summary stats
  const totalApplications = applications.length
  const pendingApplications = applications.filter(app => app.status === 'pending').length
  const scheduledInterviews = interviews.filter(int => int.status === 'scheduled').length
  const unreadMessages = messages.filter(msg => !msg.read).length

  const summaryCards = [
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: '📄',
      color: 'border-blue-500',
      link: '/job-seeker/applications',
      description: 'All your job applications'
    },
    {
      title: 'Pending Applications',
      value: pendingApplications,
      icon: '⏳',
      color: 'border-yellow-500',
      link: '/job-seeker/applications',
      description: 'Awaiting review'
    },
    {
      title: 'Interviews Scheduled',
      value: scheduledInterviews,
      icon: '📅',
      color: 'border-green-500',
      link: '/job-seeker/interviews',
      description: 'Upcoming interviews'
    },
    {
      title: 'Unread Messages',
      value: unreadMessages,
      icon: '💬',
      color: 'border-purple-500',
      link: '/job-seeker/messages',
      description: 'New messages'
    }
  ]

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name || 'Job Seeker'}! 👋
              </h1>
              <p className="text-blue-100">
                Here's what's happening with your job search today.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-sm text-blue-100 mb-1">Profile Completion</div>
                <div className="text-2xl font-bold">{profileCompletion}%</div>
                <div className="w-24 bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <DashboardSummary cards={summaryCards} loading={dashboardLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity
              activities={recentActivities}
              loading={dashboardLoading}
              limit={5}
            />
          </div>

          {/* Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/apply"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-700">Apply for Jobs</div>
                    <div className="text-sm text-gray-500">Browse and apply to new positions</div>
                  </div>
                </a>
                <a
                  href="/job-seeker/settings"
                  className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mr-3">⚙️</span>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-green-700">Update Profile</div>
                    <div className="text-sm text-gray-500">Complete your profile for better matches</div>
                  </div>
                </a>
                <a
                  href="/job-seeker/messages"
                  className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl mr-3">💬</span>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-700">Check Messages</div>
                    <div className="text-sm text-gray-500">Stay in touch with recruiters</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Pro Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <p className="text-sm text-gray-600">
                    Keep your profile updated with your latest skills and experience.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <p className="text-sm text-gray-600">
                    Respond to interview invitations within 24 hours.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <p className="text-sm text-gray-600">
                    Upload your CV in PDF format for better compatibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}