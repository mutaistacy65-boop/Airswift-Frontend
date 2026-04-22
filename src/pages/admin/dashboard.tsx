import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import API from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const AdminDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Applications', href: '/admin/applications', icon: '📋' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/dashboard')
      setStats(response.data || {})
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStats({})
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthorized) {
    return <div>Access denied. Admin privileges required.</div>
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm font-medium">Total Applications</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.summary?.total_applications || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm font-medium">Active Jobs</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.summary?.active_jobs || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm font-medium">Total Users</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.summary?.total_users || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm font-medium">Pending Reviews</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.summary?.pending_reviews || 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {stats?.activities?.length > 0 ? (
            <div className="space-y-2">
              {stats.activities.slice(0, 5).map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-gray-600">{activity.description}</span>
                  <span className="text-sm text-gray-400">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activities</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
