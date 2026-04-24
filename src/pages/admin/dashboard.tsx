import React, { useState, useEffect } from 'react'
import UserLayout from '@/layouts/UserLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import API from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, Users, FileText, CheckCircle, Clock, AlertCircle, Briefcase } from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [applicationsData, setApplicationsData] = useState<any[]>([])

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Applications', href: '/admin/applications', icon: '📋' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  // Generate mock trends data
  const generateTrendsData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: Math.floor(Math.random() * 30) + 10,
        users: Math.floor(Math.random() * 25) + 5,
        interviews: Math.floor(Math.random() * 15) + 2,
      })
    }
    return data
  }

  // Generate mock applications data
  const generateApplicationsData = () => {
    const statuses = ['Pending', 'Shortlisted', 'Rejected', 'Interview']
    return statuses.map(status => ({
      status,
      count: Math.floor(Math.random() * 50) + 5,
    }))
  }

  useEffect(() => {
    fetchStats()
    setTrendsData(generateTrendsData())
    setApplicationsData(generateApplicationsData())
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'interview':
        return <Clock className="w-4 h-4 text-purple-500" />
      case 'user':
        return <Users className="w-4 h-4 text-green-500" />
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-50'
      case 'interview':
        return 'bg-purple-50'
      case 'user':
        return 'bg-green-50'
      case 'approval':
        return 'bg-emerald-50'
      case 'alert':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthorized) {
    return <div>Access denied. Admin privileges required.</div>
  }

  return (
    <UserLayout sidebarItems={sidebarItems}>
      <div className="space-y-6 pb-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm font-medium">Total Applications</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.summary?.total_applications || 0}
                </div>
              </div>
              <FileText className="w-12 h-12 text-blue-100" />
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm font-medium">Active Jobs</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.summary?.active_jobs || 0}
                </div>
              </div>
              <Briefcase className="w-12 h-12 text-green-100" />
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+5% from last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm font-medium">Total Users</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.summary?.total_users || 0}
                </div>
              </div>
              <Users className="w-12 h-12 text-purple-100" />
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% from last week</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm font-medium">Pending Reviews</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.summary?.pending_reviews || 0}
                </div>
              </div>
              <Clock className="w-12 h-12 text-orange-100" />
            </div>
            <div className="flex items-center mt-2 text-sm text-red-600">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>-3% from last week</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications & Users Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Applications by Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {stats?.activities?.length > 0 ? (
              stats.activities.slice(0, 8).map((activity: any, idx: number) => (
                <div key={idx} className={`${getActivityColor(activity.type || 'default')} p-4 rounded-lg border-l-4 ${
                  activity.type === 'application' ? 'border-blue-500' :
                  activity.type === 'interview' ? 'border-purple-500' :
                  activity.type === 'user' ? 'border-green-500' :
                  activity.type === 'approval' ? 'border-emerald-500' :
                  'border-red-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type || 'default')}
                      <div>
                        <p className="font-medium text-gray-900">{activity.description || activity.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.details || ''}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {activity.timestamp || activity.time || 'Just now'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default AdminDashboard
