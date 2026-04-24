// Example page: src/pages/admin/logs-example.tsx
// This demonstrates how to use the AdminLogs component

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import UserLayout from '@/layouts/UserLayout'
import { AdminLogs } from '@/components/AdminLogs'
import { useRouter } from 'next/router'

export default function AdminLogsExamplePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect non-admin users
  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/unauthorized')
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== 'admin') {
    return null
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📊 Admin Activity Logs</h1>
          <p className="text-gray-600 mt-2">
            Monitor real-time system activities, user actions, and security events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Logins</p>
                <p className="text-3xl font-bold text-blue-600">1,234</p>
              </div>
              <span className="text-4xl">🔓</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Failed Attempts</p>
                <p className="text-3xl font-bold text-red-600">23</p>
              </div>
              <span className="text-4xl">⚠️</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-green-600">156</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🔍 Recent Activity
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              ↻ Refresh
            </button>
          </div>

          {/* Display the AdminLogs component */}
          <AdminLogs limit={20} compact={false} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Activity this week</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Registrations</span>
                <span className="font-bold">+45</span>
              </div>
              <div className="flex justify-between">
                <span>Logins</span>
                <span className="font-bold">+890</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Logins</span>
                <span className="font-bold text-red-600">+12</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔐 Security Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>No suspicious activities</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>All systems operational</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span>23 failed login attempts (review recommended)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
