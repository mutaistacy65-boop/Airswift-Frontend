import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import MetricCard from '@/components/MetricCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from "recharts";
import { TrendingUp, Users, Briefcase, Calendar, AlertTriangle, CheckCircle, Clock, DollarSign, Activity, Bell, Settings, Download, FileText, User } from 'lucide-react';
import { api } from '@/utils/api'
import AdminPayments from '@/components/AdminPayments'

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)
  const [trendRange, setTrendRange] = useState('7d')
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, funnelRes, activitiesRes, healthRes] = await Promise.all([
          api.get('/admin/dashboard/summary'),
          api.get('/admin/dashboard/funnel'),
          api.get('/admin/dashboard/activities'),
          api.get('/admin/system/health')
        ])

        setSummary(summaryRes.data)
        setFunnel(funnelRes.data)
        setActivities(activitiesRes.data)
        setHealth(healthRes.data)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchTrends(trendRange)
  }, [trendRange])

  const fetchTrends = async (range: string) => {
    try {
      const response = await api.get(`/admin/dashboard/trends?range=${range}`)
      setTrends(response.data)
    } catch (error) {
      console.error('Error fetching trends:', error)
    }
  }

  // Protect route
  if (protectedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '👥 Users', href: '/admin/users' },
    { label: '💼 Jobs', href: '/admin/jobs' },
    { label: '📝 Applications', href: '/admin/applications' },
    { label: '📞 Interviews', href: '/admin/interviews' },
    { label: '💰 Payments', href: '/admin/payments' },
    { label: '📋 Audit Logs', href: '/admin/audit' },
    { label: '🔍 Health', href: '/admin/health' },
    { label: '⚙️ Settings', href: '/admin/settings' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">System Alerts</h3>
              </div>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg text-sm ${
                    alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                    alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                    alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Applications"
            value={statsLoading ? '...' : summary?.totalApplications || 0}
            icon={<FileText className="w-6 h-6" />}
            trend={{ value: summary?.growth?.applications || 0, isPositive: (summary?.growth?.applications || 0) >= 0 }}
          />

          <MetricCard
            title="Active Jobs"
            value={statsLoading ? '...' : summary?.activeJobs || 0}
            icon={<Briefcase className="w-6 h-6" />}
            trend={{ value: summary?.growth?.jobs || 0, isPositive: (summary?.growth?.jobs || 0) >= 0 }}
          />

          <MetricCard
            title="Conversion Rate"
            value={statsLoading ? '...' : `${summary?.conversionRate || 0}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: summary?.growth?.conversion || 0, isPositive: (summary?.growth?.conversion || 0) >= 0 }}
          />

          <MetricCard
            title="Avg. Time to Hire"
            value={statsLoading ? '...' : `${summary?.avgTimeToHire || 0} days`}
            icon={<Clock className="w-6 h-6" />}
            trend={{ value: summary?.growth?.timeToHire || 0, isPositive: (summary?.growth?.timeToHire || 0) >= 0 }}
          />
        </div>

        {/* Payments Section */}
        <div className="mb-8">
          <AdminPayments />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Application Trends</h3>
              <select
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
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
              {funnel.map((stage: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.length > 0 ? (
                activities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'application' ? 'bg-blue-100' :
                      activity.type === 'job' ? 'bg-green-100' :
                      activity.type === 'interview' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {activity.type === 'application' && <Users className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'job' && <Briefcase className="w-4 h-4 text-green-600" />}
                      {activity.type === 'interview' && <Calendar className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'user' && <User className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/jobs" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Post New Job</span>
              </Link>
              <Link href="/admin/applications" className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Review Applications</span>
              </Link>
              <Link href="/admin/interviews" className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Schedule Interviews</span>
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition">
                <Settings className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">System Settings</span>
              </Link>
            </div>
          </div>

          {/* System Health & Settings */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Server</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      health?.server?.status === 'online' ? 'bg-green-500' :
                      health?.server?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${
                      health?.server?.status === 'online' ? 'text-green-600' :
                      health?.server?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {health?.server?.status || 'unknown'}
                    </span>
                    {health?.server?.cpuUsage && (
                      <span className="text-xs text-gray-500">({health.server.cpuUsage} CPU)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      health?.database?.status === 'online' ? 'bg-green-500' :
                      health?.database?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${
                      health?.database?.status === 'online' ? 'text-green-600' :
                      health?.database?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {health?.database?.status || 'unknown'}
                    </span>
                    {health?.database?.queryLatency && (
                      <span className="text-xs text-gray-500">({health.database.queryLatency} latency)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Service</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      health?.aiService?.status === 'online' ? 'bg-green-500' :
                      health?.aiService?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${
                      health?.aiService?.status === 'online' ? 'text-green-600' :
                      health?.aiService?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {health?.aiService?.status || 'unknown'}
                    </span>
                    {health?.aiService?.responseLatency && (
                      <span className="text-xs text-gray-500">({health.aiService.responseLatency} latency)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      health?.emailService?.status === 'online' ? 'bg-green-500' :
                      health?.emailService?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${
                      health?.emailService?.status === 'online' ? 'text-green-600' :
                      health?.emailService?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {health?.emailService?.status || 'unknown'}
                    </span>
                    {health?.emailService?.deliverySuccessRate && (
                      <span className="text-xs text-gray-500">({health.emailService.deliverySuccessRate} success)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
              <div className="space-y-3 text-sm">
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
              <Link href="/admin/settings" className="text-blue-600 hover:text-blue-800 text-sm mt-4 inline-block">
                View full settings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export async function getServerSideProps(context: any) {
  const { req } = context;
  const token = req.cookies.accessToken;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
