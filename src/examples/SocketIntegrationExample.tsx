/**
 * Socket.IO Integration Example Component
 * 
 * This shows how to use the socket event hooks with notifications
 */

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  useAdminSocketNotifications,
  useUserSocketNotifications,
  useRecruiterSocketNotifications,
  useSocketStatus,
} from '@/lib/socketIntegration'

/**
 * Example: Admin Dashboard with Real-Time Notifications
 */
export const AdminDashboardExample = () => {
  const { user } = useAuth()
  const isConnected = useSocketStatus()

  // Setup admin socket notifications
  useAdminSocketNotifications()

  if (user?.role !== 'admin') return null

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className={`px-4 py-2 rounded-full font-medium ${
          isConnected
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Connected' : '⚫ Offline'}
        </div>
      </div>

      {/* Your admin content here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📩 Recent Applications</h2>
          <p className="text-gray-600">
            You'll receive notifications when new applications arrive
          </p>
        </div>

        {/* Jobs section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📋 Jobs</h2>
          <p className="text-gray-600">
            Job updates will appear here in real-time
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Example: User Dashboard with Real-Time Notifications
 */
export const UserDashboardExample = () => {
  const { user } = useAuth()
  const isConnected = useSocketStatus()

  // Setup user socket notifications
  useUserSocketNotifications()

  if (user?.role !== 'user') return null

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className={`px-4 py-2 rounded-full font-medium ${
          isConnected
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Connected' : '⚫ Offline'}
        </div>
      </div>

      {/* Your user content here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Applications section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📝 My Applications</h2>
          <p className="text-gray-600">
            You'll be notified when your applications status changes
          </p>
        </div>

        {/* Interviews section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📅 Interviews</h2>
          <p className="text-gray-600">
            Interview invitations will appear here
          </p>
        </div>

        {/* Messages section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">💬 Messages</h2>
          <p className="text-gray-600">
            New messages will notify you instantly
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Example: Recruiter Dashboard with Real-Time Notifications
 */
export const RecruiterDashboardExample = () => {
  const { user } = useAuth()
  const isConnected = useSocketStatus()

  // Setup recruiter socket notifications
  useRecruiterSocketNotifications()

  if (user?.role !== 'recruiter') return null

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
        <div className={`px-4 py-2 rounded-full font-medium ${
          isConnected
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Connected' : '⚫ Offline'}
        </div>
      </div>

      {/* Your recruiter content here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidates section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">👥 Candidates</h2>
          <p className="text-gray-600">
            New candidate applications will be notified instantly
          </p>
        </div>

        {/* Jobs stats section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">📊 Job Stats</h2>
          <p className="text-gray-600">
            Real-time application stats for your jobs
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Example: How to set up in a page
 * 
 * import { AdminDashboardExample } from '@/examples/SocketIntegrationExample'
 * 
 * export default function AdminPage() {
 *   return <AdminDashboardExample />
 * }
 */
