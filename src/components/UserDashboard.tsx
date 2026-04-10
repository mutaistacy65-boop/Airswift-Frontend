import React, { useState, useEffect } from 'react'
import API from '@/services/apiClient'
import Link from 'next/link'

export default function UserDashboard() {
  const [applications, setApplications] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [applicationsRes, notificationsRes, messagesRes] = await Promise.all([
        api.get('/applications'),
        api.get('/notifications'),
        api.get('/messages'),
      ])

      setApplications(applicationsRes.data.applications || [])
      setNotifications(notificationsRes.data.notifications || [])
      setMessages(messagesRes.data.messages || [])
      setUnreadNotifications(notificationsRes.data.unreadCount || 0)
      setUnreadMessages(messagesRes.data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your application status.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Total Applications</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{applications.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Shortlisted</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {applications.filter(a => a.status === 'shortlisted').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Pending</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {applications.filter(a => a.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Notifications</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{unreadNotifications}</div>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Job</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.length > 0 ? (
                applications.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {app.job_id?.title || 'Unknown Job'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-600">
                    No applications yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Messages */}
      {unreadMessages > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            You have {unreadMessages} new message{unreadMessages !== 1 ? 's' : ''}
          </h3>
          <Link href="/messages">
            <a className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              View Messages
            </a>
          </Link>
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
          </div>
          <div className="space-y-4 p-6">
            {notifications.slice(0, 5).map(notif => (
              <div key={notif._id} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900">{notif.title}</h3>
                <p className="text-gray-600 text-sm">{notif.message}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(notif.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
