import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import { adminService } from '@/services/adminService'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Briefcase,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

interface DashboardStats {
  totalJobs: number
  totalApplications: number
  totalInterviews: number
  totalMessages: number
  pendingApplications: number
  activeJobs: number
  interviewsThisWeek: number
}

interface ChartData {
  name: string
  value: number
  applications?: number
  interviews?: number
}

const AdminDashboard = () => {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotification()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsTrend, setApplicationsTrend] = useState<ChartData[]>([])
  const [jobCategories, setJobCategories] = useState<ChartData[]>([])

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: '💼 Jobs', href: '/admin/jobs', icon: '💼' },
    { label: '👥 Applicants', href: '/admin/applications', icon: '👥' },
    { label: '📞 Interviews', href: '/admin/interviews', icon: '📞' },
    { label: '💬 Messages', href: '/admin/messages', icon: '💬' },
    { label: '⚙️ Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch main stats
      const statsResponse = await adminService.getDashboardStats?.()
      if (statsResponse) {
        setStats(statsResponse)
      }

      // Mock data for charts (replace with API calls)
      const mockApplicationsTrend = [
        { name: 'Mon', applications: 12, interviews: 3 },
        { name: 'Tue', applications: 19, interviews: 4 },
        { name: 'Wed', applications: 25, interviews: 5 },
        { name: 'Thu', applications: 22, interviews: 4 },
        { name: 'Fri', applications: 28, interviews: 6 },
        { name: 'Sat', applications: 15, interviews: 2 },
        { name: 'Sun', applications: 10, interviews: 1 },
      ]
      setApplicationsTrend(mockApplicationsTrend)

      const mockJobCategories = [
        { name: 'IT', value: 45 },
        { name: 'Marketing', value: 28 },
        { name: 'Finance', value: 18 },
        { name: 'HR', value: 12 },
        { name: 'Other', value: 15 },
      ]
      setJobCategories(mockJobCategories)
    } catch (error) {
      addNotification('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <Loader />

  if (!stats && !loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="text-center py-12">
          <p className="text-gray-600">No data available</p>
        </div>
      </DashboardLayout>
    )
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  const StatCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
  }: {
    title: string
    value: number | string
    icon: React.ReactNode
    bgColor: string
  }) => (
    <div className={`${bgColor} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="opacity-20 text-4xl">{Icon}</div>
      </div>
    </div>
  )

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your recruitment overview
            </p>
          </div>
          <Button onClick={fetchDashboardData} className="flex items-center gap-2">
            <TrendingUp size={18} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        {!loading && stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Jobs"
                value={stats.totalJobs}
                icon="💼"
                bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                title="Applications"
                value={stats.totalApplications}
                icon="📄"
                bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <StatCard
                title="Active Interviews"
                value={stats.interviewsThisWeek}
                icon="📞"
                bgColor="bg-gradient-to-br from-pink-500 to-pink-600"
              />
              <StatCard
                title="Pending Status"
                value={stats.pendingApplications}
                icon="⏳"
                bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Applications Trend */}
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Applications & Interviews Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={applicationsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interviews"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Job Categories */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Jobs by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jobCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jobCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <Briefcase className="text-blue-500" size={24} />
                </div>
                <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition mb-2">
                  + Create Job
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                  View All Jobs
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
                  <FileText className="text-purple-500" size={24} />
                </div>
                <button className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition mb-2">
                  Review Pending
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                  All Applications
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Interviews</h3>
                  <MessageSquare className="text-pink-500" size={24} />
                </div>
                <button className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition mb-2">
                  Schedule New
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                  View Upcoming
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">
                    New application from John Doe for Software Developer
                  </p>
                  <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">
                    Interview scheduled with Jane Smith
                  </p>
                  <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">
                    New job posting: Marketing Manager
                  </p>
                  <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Loader />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
