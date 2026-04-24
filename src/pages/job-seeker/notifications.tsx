import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import UserDashboardLayout from '@/components/UserDashboardLayout'
import Loader from '@/components/Loader'
import API from '@/services/apiClient'

interface Notification {
  _id: string
  user: string
  type: 'application' | 'interview' | 'message' | 'system'
  title: string
  description: string
  read: boolean
  link?: string
  timestamp: string
}

export default function NotificationsPage() {
  const { user, isLoading } = useAuth()
  const { addNotification } = useNotification()
  const router = useRouter()

  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

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

  // Load notifications
  useEffect(() => {
    if (!user) return

    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true)
        const response = await API.get('/notifications')
        setNotifications(response.data.notifications || [])
      } catch (error) {
        console.error('Error loading notifications:', error)
        addNotification('Failed to load notifications', 'error')
      } finally {
        setNotificationsLoading(false)
      }
    }

    loadNotifications()
  }, [user, addNotification])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await API.put(`/notifications/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/mark-all-read')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      addNotification('✅ All notifications marked as read', 'success')
    } catch (error) {
      console.error('Error marking all as read:', error)
      addNotification('Failed to mark all as read', 'error')
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await API.delete(`/notifications/${notificationId}`)
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
      addNotification('✅ Notification deleted', 'success')
    } catch (error) {
      console.error('Error deleting notification:', error)
      addNotification('Failed to delete notification', 'error')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return '📝'
      case 'interview':
        return '📅'
      case 'message':
        return '💬'
      case 'system':
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-50'
      case 'interview':
        return 'bg-green-50'
      case 'message':
        return 'bg-purple-50'
      case 'system':
        return 'bg-yellow-50'
      default:
        return 'bg-gray-50'
    }
  }

  if (isLoading || !user) {
    return <Loader fullScreen />
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <UserDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔔 Notifications</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notificationsLoading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-4xl mb-4">😌</p>
            <p className="text-lg font-medium text-gray-900">No notifications</p>
            <p className="text-gray-600 mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-lg p-4 border-l-4 ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200'
                    : `${getNotificationColor(notification.type)} border-blue-500`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200"
                      >
                        Read
                      </button>
                    )}
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded transition duration-200"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🔧 Notification Preferences</h2>
          <p className="text-sm text-gray-600 mb-4">
            Adjust how you receive notifications in your email settings
          </p>
          <a
            href="/job-seeker/settings"
            className="inline-block text-primary hover:text-primary/80 font-medium text-sm"
          >
            Go to Settings →
          </a>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
