
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import { adminService } from '@/services/adminService'
import {
  Activity,
  Cpu,
  HardDrive,
  Database,
  Mail,
  Brain,
  Video,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  timestamp: string
  system: {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu: {
      cores: number
      load: number
    }
    platform: string
    nodeVersion: string
  }
  services: {
    [key: string]: 'healthy' | 'configured' | 'unhealthy' | 'misconfigured'
  }
}

interface HealthHistory {
  timestamp: string
  memoryUsage: number
  cpuLoad: number
}

export default function AdminHealthPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [history, setHistory] = useState<HealthHistory[]>([])

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

  useEffect(() => {
    if (isAuthorized) {
      fetchHealth()
    }
  }, [isAuthorized])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (isAuthorized) {
        fetchHealth()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, isAuthorized])

  const fetchHealth = async () => {
    try {
      const response = await adminService.getSystemHealth()
      setHealth(response)
      setLastUpdated(new Date())

      // Add to history
      if (response.system) {
        const historyEntry: HealthHistory = {
          timestamp: new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0'),
          memoryUsage: response.system.memory?.percentage || 0,
          cpuLoad: Math.min(response.system.cpu?.load || 0, 100),
        }
        setHistory((prev) => [...prev.slice(-11), historyEntry])
      }
    } catch (error) {
      addNotification('Failed to load system health', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'configured':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      case 'unhealthy':
      case 'critical':
      case 'misconfigured':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getHealthStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50'
      case 'configured':
        return 'bg-blue-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'unhealthy':
      case 'critical':
      case 'misconfigured':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  if (authLoading || protectedLoading) return <Loader />
  if (!isAuthorized) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-600 mt-1">Monitor system performance and service status</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setLoading(true)
                fetchHealth()
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={18} /> Refresh
            </Button>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Auto-refresh</span>
            </label>
          </div>
        </div>

        {/* Overall Status */}
        {loading ? (
          <div className="p-8 text-center">
            <Loader />
          </div>
        ) : health ? (
          <>
            {/* Status Alert */}
            {health.status === 'critical' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-red-900">System Critical</h3>
                    <p className="text-sm text-red-800">
                      The system is experiencing critical issues. Immediate action may be required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {health.status === 'warning' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-yellow-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-yellow-900">System Warning</h3>
                    <p className="text-sm text-yellow-800">
                      The system is operating with some issues. Monitor closely.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {health.status === 'healthy' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-green-900">System Healthy</h3>
                    <p className="text-sm text-green-800">
                      All systems are operating normally. Last updated:{' '}
                      {lastUpdated?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Uptime */}
              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatUptime(health.system.uptime)}
                    </p>
                  </div>
                  <Activity className="text-blue-600" size={32} />
                </div>
              </div>

              {/* Memory Usage */}
              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {health.system.memory.percentage}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(health.system.memory.used / 1024)}MB /{' '}
                      {Math.round(health.system.memory.total / 1024)}MB
                    </p>
                  </div>
                  <HardDrive className="text-green-600" size={32} />
                </div>
              </div>

              {/* CPU Load */}
              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">CPU Load</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {(health.system.cpu.load * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {health.system.cpu.cores} Cores
                    </p>
                  </div>
                  <Cpu className="text-orange-600" size={32} />
                </div>
              </div>

              {/* Last Updated */}
              <div className="bg-white rounded-lg p-6 shadow-md border-t-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-bold text-gray-900 mt-2">
                      {lastUpdated?.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Node v{health.system.nodeVersion}
                    </p>
                  </div>
                  <Clock className="text-purple-600" size={32} />
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            {history.length > 1 && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history}>
                    <XAxis dataKey="timestamp" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.3}
                      name="Memory %"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="cpuLoad"
                      stroke="#FF8042"
                      fill="#FF8042"
                      fillOpacity={0.3}
                      name="CPU %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Services Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {health.services &&
                  Object.entries(health.services).map(([service, status]) => (
                    <div
                      key={service}
                      className={`rounded-lg p-4 ${getHealthStatusBg(status as string)}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {service.replace(/_/g, ' ')}
                          </h4>
                          <p className={`text-sm font-medium ${getHealthStatusColor(status as string)}`}>
                            {status === 'healthy'
                              ? '✓ Healthy'
                              : status === 'configured'
                              ? '✓ Configured'
                              : status === 'unhealthy'
                              ? '✗ Unhealthy'
                              : status === 'misconfigured'
                              ? '⚠ Misconfigured'
                              : '◆ ' + status}
                          </p>
                        </div>
                        {status === 'healthy' || status === 'configured' ? (
                          <CheckCircle className={getHealthStatusColor(status as string)} size={24} />
                        ) : (
                          <AlertCircle className={getHealthStatusColor(status as string)} size={24} />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Platform</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {health.system.platform.charAt(0).toUpperCase() +
                      health.system.platform.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Node Version</p>
                  <p className="font-semibold text-gray-900 mt-1">v{health.system.nodeVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPU Cores</p>
                  <p className="font-semibold text-gray-900 mt-1">{health.system.cpu.cores}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Memory</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {Math.round(health.system.memory.total / 1024 / 1024)}GB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p
                    className={`font-semibold mt-1 ${
                      health.status === 'healthy'
                        ? 'text-green-600'
                        : health.status === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {new Date(health.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">System Recommendations</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                {health.system.memory.percentage > 80 && (
                  <li>⚠ Memory usage is high ({health.system.memory.percentage}%). Consider optimizing or upgrading.</li>
                )}
                {health.system.cpu.load > 0.8 && (
                  <li>⚠ CPU load is high ({(health.system.cpu.load * 100).toFixed(1)}%). Monitor application performance.</li>
                )}
                {health.status === 'healthy' && (
                  <li>✓ All systems are operating optimally. Continue monitoring.</li>
                )}
              </ul>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-white rounded-lg">
            <AlertCircle size={40} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Failed to load system health information</p>
            <Button
              onClick={() => {
                setLoading(true)
                fetchHealth()
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
