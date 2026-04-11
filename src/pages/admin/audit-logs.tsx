
import React, { useState, useEffect } from 'react'
import API from '@/services/apiClient'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { useSocket } from '@/hooks/useSocket'

// Force server-side rendering for admin pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AuditLog {
  _id: string
  action: 'REGISTER' | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'ACTION'
  user_name?: string
  user_email?: string
  ip_address: string
  browser: string
  device_type: string
  os: string
  is_suspicious: boolean
  created_at: string
  details?: Record<string, any>
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AuditLogsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const { subscribe } = useSocket()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [alerts, setAlerts] = useState<{ message: string; timestamp: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [mounted, setMounted] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: 'ALL',
    searchUser: '',
    ipAddress: '',
    startDate: '',
    endDate: '',
    suspicious: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user || user?.role !== 'admin') return
    
    fetchAuditLogs()

    const unsubscribeAudit = subscribe('audit_log', (data) => {
      console.log('New audit log:', data)
      const newLog: AuditLog = {
        _id: data._id || `temp-${Date.now()}`,
        action: data.action,
        user_name: data.user || data.user_name || data.user_email || 'Unknown',
        user_email: data.email || data.user_email || 'N/A',
        ip_address: data.ip_address || 'Real-time',
        browser: data.browser || 'Unknown',
        device_type: data.device_type || 'Unknown',
        os: data.os || 'Unknown',
        is_suspicious: data.is_suspicious || false,
        created_at: data.timestamp || new Date().toISOString(),
        details: data.details || {},
      }
      setLogs(prevLogs => [newLog, ...prevLogs])
      setTimeout(() => {
        fetchAuditLogs()
      }, 2000)
    })

    const unsubscribeSecurity = subscribe('security:alert', (alert) => {
      const message = alert?.message || 'Security alert received'
      const timestamp = alert?.timestamp || new Date().toISOString()
      setAlerts(prev => [{ message, timestamp }, ...prev].slice(0, 5))
      addNotification(message, 'error')
    })

    const unsubscribeAdminAlert = subscribe('admin:alert', (alert) => {
      const message = alert?.message || 'Admin alert received'
      const timestamp = alert?.timestamp || new Date().toISOString()
      setAlerts(prev => [{ message, timestamp }, ...prev].slice(0, 5))
      addNotification(message, 'warning')
    })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAuditLogs()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      unsubscribeAudit()
      unsubscribeSecurity()
      unsubscribeAdminAlert()
    }
  }, [user, mounted, subscribe, addNotification])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.action !== 'ALL' && { action: filters.action }),
        ...(filters.searchUser && { searchUser: filters.searchUser }),
        ...(filters.ipAddress && { ipAddress: filters.ipAddress }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.suspicious && { suspicious: 'true' }),
      })

      const response = await API.get(`/audit-logs?${params}`)
      
      if (response.data.success) {
        setLogs(response.data.logs)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      page: 1, // Reset to first page when filtering
    }))
  }

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      action: 'ALL',
      searchUser: '',
      ipAddress: '',
      startDate: '',
      endDate: '',
      suspicious: false,
    })
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await API.post(
        '/audit-logs',
        {
          action: filters.action !== 'ALL' ? filters.action : undefined,
          startDate: filters.startDate,
          endDate: filters.endDate,
          format,
        },
        {
          responseType: format === 'csv' ? 'blob' : 'json',
        }
      )

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `audit-logs-${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
      } else {
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
        const link = document.createElement('a')
        link.setAttribute('href', dataUri)
        link.setAttribute('download', `audit-logs-${Date.now()}.json`)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800'
      case 'REGISTER':
        return 'bg-green-100 text-green-800'
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800'
      case 'FAILED_LOGIN':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'Mobile':
        return '📱'
      case 'Tablet':
        return '📱'
      case 'Desktop':
        return '💻'
      default:
        return '🖥️'
    }
  }

  if (!mounted) return null

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-medium">Only admins can access audit logs.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔍 Audit Logs</h1>
          <p className="text-gray-600 mt-2">
            Monitor user activities, track logins, registrations, and detect suspicious activities
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🔎 Search & Filter</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search User (Name/Email)
              </label>
              <input
                type="text"
                name="searchUser"
                value={filters.searchUser}
                onChange={handleFilterChange}
                placeholder="John Doe or john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="REGISTER">Register</option>
                <option value="LOGOUT">Logout</option>
                <option value="FAILED_LOGIN">Failed Login</option>
              </select>
            </div>

            {/* IP Address Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Address
              </label>
              <input
                type="text"
                name="ipAddress"
                value={filters.ipAddress}
                onChange={handleFilterChange}
                placeholder="102.45.x.x"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Suspicious Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suspicious Activities
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="suspicious"
                  checked={filters.suspicious}
                  onChange={handleFilterChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Show only suspicious</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setFilters(prev => ({ ...prev, page: 1 }))
                await fetchAuditLogs()
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              🔍 Search
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition"
            >
              Reset Filters
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
              >
                📥 Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.timestamp}-${index}`}
                className="rounded-lg bg-red-600 px-4 py-3 text-white shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">🚨 {alert.message}</p>
                  <span className="text-xs text-red-100">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 font-medium">No audit logs found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.user_name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-gray-600">{log.user_email || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {log.ip_address}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>
                              {getDeviceIcon(log.device_type)} {log.device_type}
                            </div>
                            <p className="text-xs text-gray-600">{log.browser}</p>
                            <p className="text-xs text-gray-600">{log.os}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {log.is_suspicious ? (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                              🚨 Suspicious
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                              ✓ Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-bold">{logs.length}</span> of{' '}
                    <span className="font-bold">{pagination.total}</span> logs
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFilters(prev => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      ← Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                          className={`px-3 py-1 rounded-lg ${
                            pagination.page === p
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setFilters(prev => ({
                          ...prev,
                          page: Math.min(pagination.pages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-700 text-sm font-medium">Total Activities</p>
            <p className="text-2xl font-bold text-blue-900">{pagination?.total || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-green-700 text-sm font-medium">Successful Logins</p>
            <p className="text-2xl font-bold text-green-900">
              {logs.filter(l => l.action === 'LOGIN').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <p className="text-red-700 text-sm font-medium">Failed Logins</p>
            <p className="text-2xl font-bold text-red-900">
              {logs.filter(l => l.action === 'FAILED_LOGIN').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <p className="text-yellow-700 text-sm font-medium">Suspicious Activities</p>
            <p className="text-2xl font-bold text-yellow-900">
              {logs.filter(l => l.is_suspicious).length}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
