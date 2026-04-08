import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts'

interface KPICardProps {
  title: string
  value: string | number
  growth: number
  icon: string
}

const KPICard: React.FC<KPICardProps> = ({ title, value, growth, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <p className={`text-sm mt-2 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growth >= 0 ? '+' : ''}{growth}% from last month
        </p>
      </div>
      <div className="text-4xl text-gray-400">{icon}</div>
    </div>
  </div>
)

interface ActivityItemProps {
  type: string
  message: string
  timestamp: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, message, timestamp }) => (
  <div className="flex items-start space-x-3 py-3">
    <div className={`w-2 h-2 rounded-full mt-2 ${
      type === 'application' ? 'bg-blue-500' :
      type === 'job' ? 'bg-green-500' :
      type === 'interview' ? 'bg-purple-500' : 'bg-gray-500'
    }`}></div>
    <div className="flex-1">
      <p className="text-sm text-gray-900">{message}</p>
      <p className="text-xs text-gray-500">{new Date(timestamp).toLocaleString()}</p>
    </div>
  </div>
)

interface HealthStatusProps {
  label: string
  status: string
  details?: string
}

const HealthStatus: React.FC<HealthStatusProps> = ({ label, status, details }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-600">{label}</span>
    <div className="flex items-center space-x-2">
      <span className={`w-3 h-3 rounded-full ${
        status === 'online' ? 'bg-green-500' :
        status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
      }`}></span>
      <span className="text-sm font-medium capitalize">{status}</span>
      {details && <span className="text-xs text-gray-500">({details})</span>}
    </div>
  </div>
)

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trendRange, setTrendRange] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchTrends(trendRange)
  }, [trendRange])

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, funnelRes, activitiesRes, healthRes] = await Promise.all([
        axios.get('/api/admin/dashboard/summary'),
        axios.get('/api/admin/dashboard/funnel'),
        axios.get('/api/admin/dashboard/activities'),
        axios.get('/api/admin/system/health')
      ])

      setSummary(summaryRes.data)
      setFunnel(funnelRes.data)
      setActivities(activitiesRes.data)
      setHealth(healthRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrends = async (range: string) => {
    try {
      const response = await axios.get(`/api/admin/dashboard/trends?range=${range}`)
      setTrends(response.data)
    } catch (error) {
      console.error('Error fetching trends:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time platform performance and system health monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Applications"
          value={summary?.totalApplications || 0}
          growth={summary?.growth?.applications || 0}
          icon="📄"
        />
        <KPICard
          title="Active Jobs"
          value={summary?.activeJobs || 0}
          growth={summary?.growth?.jobs || 0}
          icon="💼"
        />
        <KPICard
          title="Conversion Rate"
          value={`${summary?.conversionRate || 0}%`}
          growth={summary?.growth?.conversion || 0}
          icon="📈"
        />
        <KPICard
          title="Avg. Time to Hire"
          value={`${summary?.avgTimeToHire || 0} days`}
          growth={summary?.growth?.timeToHire || 0}
          icon="⏱️"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Application Trends</h2>
            <select
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey="count"
                data={funnel}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {funnel.map((stage, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{stage.stage}</span>
                <span className="font-medium">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <ActivityItem
                  key={index}
                  type={activity.type}
                  message={activity.message}
                  timestamp={activity.timestamp}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/jobs">
                <a className="bg-blue-600 text-white px-4 py-3 rounded-lg text-center hover:bg-blue-700 transition">
                  Post New Job
                </a>
              </Link>
              <Link href="/admin/applications">
                <a className="bg-green-600 text-white px-4 py-3 rounded-lg text-center hover:bg-green-700 transition">
                  Review Applications
                </a>
              </Link>
              <Link href="/admin/interviews">
                <a className="bg-purple-600 text-white px-4 py-3 rounded-lg text-center hover:bg-purple-700 transition">
                  Schedule Interviews
                </a>
              </Link>
              <Link href="/admin/settings">
                <a className="bg-gray-600 text-white px-4 py-3 rounded-lg text-center hover:bg-gray-700 transition">
                  System Settings
                </a>
              </Link>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
            <div className="space-y-3">
              <HealthStatus
                label="Server"
                status={health?.server?.status || 'unknown'}
                details={`${health?.server?.cpuUsage || 'N/A'} CPU, ${health?.server?.memoryUsage || 'N/A'} Memory`}
              />
              <HealthStatus
                label="Database"
                status={health?.database?.status || 'unknown'}
                details={`${health?.database?.queryLatency || 'N/A'} latency`}
              />
              <HealthStatus
                label="AI Service"
                status={health?.aiService?.status || 'unknown'}
                details={`${health?.aiService?.responseLatency || 'N/A'} latency`}
              />
              <HealthStatus
                label="Email Service"
                status={health?.emailService?.status || 'unknown'}
                details={`${health?.emailService?.deliverySuccessRate || 'N/A'} success rate`}
              />
            </div>
          </div>

          {/* System Settings Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Name:</span>
                <span className="font-medium">Airswift</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">KES</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Features:</span>
                <span className="font-medium text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance Mode:</span>
                <span className="font-medium text-red-600">Disabled</span>
              </div>
            </div>
            <Link href="/admin/settings">
              <a className="text-blue-600 hover:text-blue-800 text-sm mt-3 inline-block">
                View full settings →
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
