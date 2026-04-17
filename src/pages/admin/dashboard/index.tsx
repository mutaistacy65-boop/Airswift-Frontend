import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useSocket } from '@/hooks/useSocket';
import MetricCard from '@/components/MetricCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from "recharts";
import { TrendingUp, Users, Briefcase, Calendar, AlertTriangle, CheckCircle, Clock, DollarSign, Mail, Bell, Settings, Download, FileText, User } from 'lucide-react';
import API from '@/services/apiClient'
import { adminService } from '@/services/adminService'
import AdminPayments from '@/components/AdminPayments'
import { AdminLogs } from '@/components/AdminLogs'
import { getStoredUser, isAdmin } from '@/utils/authUtils'
import Loader from '@/components/Loader'

const AdminRealtimeMap = dynamic(() => import('@/components/AdminRealtimeMap'), {
  ssr: false,
})

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const router = useRouter()
  const { subscribe } = useSocket()
  
  // 🔐 Auth state loading
  const [authLoading, setAuthLoading] = useState(true)
  
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)
  const [adminActions, setAdminActions] = useState<any[]>([])
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [adminActionsLoading, setAdminActionsLoading] = useState(true)
  const [emailLogsLoading, setEmailLogsLoading] = useState(true)
  const [trendRange, setTrendRange] = useState('7d')
  const [statsLoading, setStatsLoading] = useState(true)

  // 🔐 Wait for auth state, then check permissions
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const storedUser = getStoredUser()
      
      console.log('🔐 Admin dashboard checking auth...', { token, storedUser })

      if (!token || !storedUser) {
        console.log('🔄 No token/user found, redirecting to /login')
        router.replace('/login')
        return
      }

      if (storedUser.role !== 'admin') {
        console.log('🔄 User is not admin, redirecting to /dashboard')
        router.replace('/dashboard')
        return
      }

      setAuthLoading(false)
    }

    checkAuth()
  }, [router])

  // 🔐 Don't render until auth is loaded
  if (authLoading) {
    return <Loader fullScreen />
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryRes, funnelRes, activitiesRes, healthRes] = await Promise.all([
        API.get('/admin/dashboard/summary'),
        API.get('/admin/dashboard/funnel'),
        API.get('/admin/dashboard/activities'),
        API.get('/admin/system/health')
      ])

      setSummary(summaryRes.data || {})
      setFunnel(funnelRes.data || [])
      setActivities(activitiesRes.data || [])
      setHealth(healthRes.data || {})
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set safe defaults to prevent crashes
      setSummary({})
      setFunnel([])
      setActivities([])
      setHealth(null)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchTrends = async (range: string) => {
    try {
      const response = await API.get(`/admin/dashboard/trends?range=${range}`)
      setTrends(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching trends:', error)
      setTrends([])
    }
  }

  const fetchAdminActions = useCallback(async () => {
    try {
      setAdminActionsLoading(true)
      const response = await adminService.getAuditLogs({ page: 1, limit: 6 })
      setAdminActions(response.logs || response || [])
    } catch (error) {
      console.error('Error fetching admin actions:', error)
      setAdminActions([])
    } finally {
      setAdminActionsLoading(false)
    }
  }, [])

  const fetchEmailLogs = useCallback(async () => {
    try {
      setEmailLogsLoading(true)
      const response = await adminService.getEmailLogs({ page: 1, limit: 6 })
      setEmailLogs(response.logs || response || [])
    } catch (error) {
      console.error('Error fetching email logs:', error)
      setEmailLogs([])
    } finally {
      setEmailLogsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData()
    }
  }, [authLoading, fetchDashboardData])

  useEffect(() => {
    if (isAuthorized) {
      fetchAdminActions()
      fetchEmailLogs()
    }
  }, [isAuthorized, fetchAdminActions, fetchEmailLogs])

  useEffect(() => {
    const unsubscribeUserUpdated = subscribe('user:updated', () => {
      fetchDashboardData()
      fetchAdminActions()
      fetchEmailLogs()
    })

    const unsubscribeNewApp = subscribe('application:new', () => {
      fetchDashboardData()
      fetchAdminActions()
      fetchEmailLogs()
    })

    const unsubscribeShortlisted = subscribe('user:shortlisted', () => {
      fetchDashboardData()
      fetchAdminActions()
      fetchEmailLogs()
    })

    return () => {
      unsubscribeUserUpdated?.()
      unsubscribeNewApp?.()
      unsubscribeShortlisted?.()
    }
  }, [subscribe, fetchDashboardData, fetchAdminActions, fetchEmailLogs])

  useEffect(() => {
    if (!authLoading) {
      fetchTrends(trendRange)
    }
  }, [authLoading, trendRange])

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
    { label: ' Applications', href: '/admin/applications' },
    { label: '📞 Interviews', href: '/admin/interviews' },
    { label: '💰 Payments', href: '/admin/payments' },
    { label: '📋 Audit Logs', href: '/admin/audit' },
    { label: '🔍 Health', href: '/admin/health' },
    { label: '⚙️ Settings', href: '/admin/settings' },
  ]

  const safeTrends = Array.isArray(trends) ? trends : []
  const safeFunnel = Array.isArray(funnel) ? funnel : []
  const safeActivities = Array.isArray(activities) ? activities : []
  const safeAlerts = Array.isArray(alerts) ? alerts : []
  const safeHealth = typeof health === 'object' && health !== null ? health : {}

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Alerts Section */}
        {safeAlerts.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">System Alerts</h3>
              </div>
              <div className="space-y-2">
                {safeAlerts.map(alert => (
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

        {/* Admin Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={statsLoading ? '...' : summary?.totalUsers || 0}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: summary?.growth?.totalUsers || 0, isPositive: (summary?.growth?.totalUsers || 0) >= 0 }}
          />
          <MetricCard
            title="Active Users"
            value={statsLoading ? '...' : summary?.activeUsers || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            trend={{ value: summary?.growth?.activeUsers || 0, isPositive: (summary?.growth?.activeUsers || 0) >= 0 }}
          />
          <MetricCard
            title="Banned Users"
            value={statsLoading ? '...' : summary?.bannedUsers || 0}
            icon={<AlertTriangle className="w-6 h-6" />}
            trend={{ value: summary?.growth?.bannedUsers || 0, isPositive: (summary?.growth?.bannedUsers || 0) <= 0 }}
          />
          <MetricCard
            title="Emails Sent Today"
            value={statsLoading ? '...' : summary?.emailsSentToday || 0}
            icon={<Mail className="w-6 h-6" />}
            trend={{ value: summary?.growth?.emailsSentToday || 0, isPositive: (summary?.growth?.emailsSentToday || 0) >= 0 }}
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
              <LineChart data={safeTrends}>
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
                  data={safeFunnel}
                  isAnimationActive
                >
                  <LabelList position="center" fill="#fff" stroke="none" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {safeFunnel.map((stage: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Location Map */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Real-Time User Locations</h3>
              <p className="text-sm text-gray-500">Live user tracking and admin alerts from the socket feed.</p>
            </div>
          </div>
          <AdminRealtimeMap />
        </div>

        {/* Recent Admin Activity + Email Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Admin Actions</h3>
                  <p className="text-sm text-gray-500">Latest admin audit events from the system.</p>
                </div>
                <button
                  onClick={fetchAdminActions}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {adminActionsLoading ? (
                  <p className="text-gray-500 text-center py-6">Loading admin actions...</p>
                ) : adminActions.length > 0 ? (
                  adminActions.map((log: any) => (
                    <div key={log._id || log.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
                        <span>{log.user?.name || log.user?.email || 'System'}</span>
                        <span>{new Date(log.created_at || log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-900">
                        <p className="font-medium">{log.action || log.event || 'ACTION'}</p>
                        <p className="text-gray-600">Target: {log.details?.targetUser || log.resource || log.resource_id || 'Unknown'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No recent admin actions available.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Logs</h3>
                  <p className="text-sm text-gray-500">Recent email delivery status from the admin system.</p>
                </div>
                <button
                  onClick={fetchEmailLogs}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogsLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading email logs...</td>
                      </tr>
                    ) : emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No email logs found.</td>
                      </tr>
                    ) : (
                      emailLogs.map((log: any) => (
                        <tr key={log._id || log.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">{log.recipientEmail || log.email || 'Unknown'}</td>
                          <td className="px-4 py-3">{log.subject || '—'}</td>
                          <td className="px-4 py-3">{(log.status || 'sent').toUpperCase()}</td>
                          <td className="px-4 py-3">{log.templateId || log.type || 'Custom'}</td>
                          <td className="px-4 py-3">{new Date(log.sentAt || log.created_at || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Server</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      safeHealth?.server?.status === 'online' ? 'bg-green-500' :
                      safeHealth?.server?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${
                      safeHealth?.server?.status === 'online' ? 'text-green-600' :
                      safeHealth?.server?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {safeHealth?.server?.status || 'unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      safeHealth?.database?.status === 'online' ? 'bg-green-500' :
                      safeHealth?.database?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${
                      safeHealth?.database?.status === 'online' ? 'text-green-600' :
                      safeHealth?.database?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {safeHealth?.database?.status || 'unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      safeHealth?.emailService?.status === 'online' ? 'bg-green-500' :
                      safeHealth?.emailService?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${
                      safeHealth?.emailService?.status === 'online' ? 'text-green-600' :
                      safeHealth?.emailService?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {safeHealth?.emailService?.status || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Audit Logs</h3>
            <span className="text-sm text-gray-500">Latest system activity</span>
          </div>
          <AdminLogs limit={5} compact />
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
