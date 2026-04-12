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

interface Alert {
  message: string
  type: 'warning' | 'critical'
  timestamp: string
  value?: number
  threshold?: number
}

export default function AdminHealthPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState('5000')
  const [chartPeriod, setChartPeriod] = useState('24')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [history, setHistory] = useState<HealthHistory[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [monitoring, setMonitoring] = useState(false)

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
      loadInitialData()
    }
  }, [isAuthorized])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh !== 'off' && isAuthorized) {
      interval = setInterval(() => {
        refreshData()
      }, parseInt(autoRefresh))
    }
    return () => clearInterval(interval)
  }, [autoRefresh, isAuthorized])

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadHealthData(),
        loadChartData(),
        loadAlerts()
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
      setErrorMessage('Failed to load initial data')
    }
  }

  const loadHealthData = async () => {
    try {
      const response = await adminService.getSystemHealth()
      setHealth(response)
      setLastUpdated(new Date())
      setErrorMessage('')
    } catch (error) {
      addNotification('Failed to load system health', 'error')
      console.error(error)
      setErrorMessage('Failed to load health data')
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      // Simulate loading chart data
      const mockData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toLocaleTimeString(),
        memoryUsage: Math.random() * 100,
        cpuLoad: Math.random() * 100
      }))
      setHistory(mockData)
    } catch (error) {
      console.error('Error loading chart data:', error)
    }
  }

  const loadAlerts = async () => {
    try {
      // Simulate loading alerts
      const mockAlerts: Alert[] = [
        {
          message: 'High memory usage detected',
          type: 'warning',
          timestamp: new Date().toISOString(),
          value: 85,
          threshold: 80
        }
      ]
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const refreshData = async () => {
    await loadHealthData()
  }

  const startMonitoring = async () => {
    try {
      setMonitoring(true)
      // Simulate starting monitoring
      addNotification('Health monitoring started', 'success')
    } catch (error) {
      console.error('Error starting monitoring:', error)
      setErrorMessage('Failed to start monitoring')
    }
  }

  const stopMonitoring = async () => {
    try {
      setMonitoring(false)
      // Simulate stopping monitoring
      addNotification('Health monitoring stopped', 'info')
    } catch (error) {
      console.error('Error stopping monitoring:', error)
      setErrorMessage('Failed to stop monitoring')
    }
  }

  const resetCharts = () => {
    loadChartData()
  }

  const getStatusCardClass = (isUp: boolean) => {
    if (isUp) return 'status-card up'
    return 'status-card down'
  }

  const getMetricsCardClass = (value: number) => {
    let statusClass = 'status-card up'
    if (value > 85) statusClass = 'status-card critical'
    else if (value > 70) statusClass = 'status-card warning'
    return statusClass
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
            <i className="fas fa-heartbeat" style={{ marginRight: '10px' }}></i> System Health Dashboard
          </h1>
          <p style={{ opacity: 0.9 }}>
            Real-time monitoring of server performance, database connectivity, and system resources
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Status Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div className={getStatusCardClass(health?.status === 'healthy')} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: health?.status === 'healthy' ? '#28a745' : '#6c757d'
            }}></div>
            <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.8 }}>
              <i className="fas fa-server" style={{ color: health?.status === 'healthy' ? '#28a745' : '#6c757d' }}></i>
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Server Status
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              {health?.status === 'healthy' ? 'UP' : 'DOWN'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {health ? formatUptime(health.system.uptime) + ' uptime' : 'Loading...'}
            </div>
          </div>

          <div className={getStatusCardClass(true)} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: '#28a745'
            }}></div>
            <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.8 }}>
              <i className="fas fa-database" style={{ color: '#28a745' }}></i>
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Database
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              UP
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              5ms response time
            </div>
          </div>

          <div className={getMetricsCardClass(health?.system.cpu.load * 100 || 0)} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: (health?.system.cpu.load || 0) > 0.85 ? '#dc3545' : (health?.system.cpu.load || 0) > 0.7 ? '#ffc107' : '#28a745'
            }}></div>
            <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.8 }}>
              <i className="fas fa-microchip" style={{ color: (health?.system.cpu.load || 0) > 0.85 ? '#dc3545' : (health?.system.cpu.load || 0) > 0.7 ? '#ffc107' : '#28a745' }}></i>
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CPU Usage
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              {health ? Math.round((health.system.cpu.load || 0) * 100) : 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {health ? `${health.system.cpu.cores} cores` : 'Loading...'}
            </div>
          </div>

          <div className={getMetricsCardClass(health?.system.memory.percentage || 0)} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: (health?.system.memory.percentage || 0) > 85 ? '#dc3545' : (health?.system.memory.percentage || 0) > 70 ? '#ffc107' : '#28a745'
            }}></div>
            <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.8 }}>
              <i className="fas fa-memory" style={{ color: (health?.system.memory.percentage || 0) > 85 ? '#dc3545' : (health?.system.memory.percentage || 0) > 70 ? '#ffc107' : '#28a745' }}></i>
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Memory Usage
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              {health ? health.system.memory.percentage : 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {health ? `${Math.round(health.system.memory.used / 1024)}MB / ${Math.round(health.system.memory.total / 1024)}MB` : 'Loading...'}
            </div>
          </div>

          <div className={getMetricsCardClass(50)} style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: '#28a745'
            }}></div>
            <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.8 }}>
              <i className="fas fa-hdd" style={{ color: '#28a745' }}></i>
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Disk Usage
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              45%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              225GB / 500GB
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            alignItems: 'end'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Auto Refresh
              </label>
              <select
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="5000">5 seconds</option>
                <option value="10000">10 seconds</option>
                <option value="30000">30 seconds</option>
                <option value="60000">1 minute</option>
                <option value="off">Off</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Chart Period
              </label>
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="1">Last Hour</option>
                <option value="6">Last 6 Hours</option>
                <option value="24">Last 24 Hours</option>
                <option value="72">Last 3 Days</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
              <button
                onClick={refreshData}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-sync-alt"></i> Refresh Now
              </button>
              <button
                onClick={startMonitoring}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#28a745',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-play"></i> Start Monitoring
              </button>
              <button
                onClick={stopMonitoring}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: '#dc3545',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-stop"></i> Stop Monitoring
              </button>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
              Active Alerts
            </div>
            <div style={{
              background: '#dc3545',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {alerts.length}
            </div>
          </div>
          <div>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No active alerts
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  background: alert.type === 'warning' ? '#fff3cd' : '#f8d7da',
                  borderColor: alert.type === 'warning' ? '#ffc107' : '#dc3545'
                }}>
                  <div style={{ fontSize: '20px', color: alert.type === 'warning' ? '#856404' : '#721c24' }}>
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Value: {alert.value} | Threshold: {alert.threshold}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Metrics and Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Metrics Table */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '15px 20px',
              background: '#f8f9fa',
              borderBottom: '1px solid #dee2e6',
              fontWeight: '600',
              color: '#333'
            }}>
              System Metrics
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    background: '#f8f9fa',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Metric
                  </th>
                  <th style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    background: '#f8f9fa',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Value
                  </th>
                  <th style={{
                    padding: '12px 20px',
                    textAlign: 'left',
                    borderBottom: '1px solid #dee2e6',
                    background: '#f8f9fa',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    CPU Usage
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    {health ? Math.round((health.system.cpu.load || 0) * 100) : 0}%
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: (health?.system.cpu.load || 0) > 0.85 ? '#f8d7da' : (health?.system.cpu.load || 0) > 0.7 ? '#fff3cd' : '#d4edda',
                      color: (health?.system.cpu.load || 0) > 0.85 ? '#721c24' : (health?.system.cpu.load || 0) > 0.7 ? '#856404' : '#155724'
                    }}>
                      <i className={`fas fa-${(health?.system.cpu.load || 0) > 0.85 ? 'exclamation-triangle' : (health?.system.cpu.load || 0) > 0.7 ? 'exclamation-circle' : 'check-circle'}`}></i>
                      {(health?.system.cpu.load || 0) > 0.85 ? 'Critical' : (health?.system.cpu.load || 0) > 0.7 ? 'Warning' : 'Normal'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    Memory Usage
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    {health ? health.system.memory.percentage : 0}%
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: (health?.system.memory.percentage || 0) > 85 ? '#f8d7da' : (health?.system.memory.percentage || 0) > 70 ? '#fff3cd' : '#d4edda',
                      color: (health?.system.memory.percentage || 0) > 85 ? '#721c24' : (health?.system.memory.percentage || 0) > 70 ? '#856404' : '#155724'
                    }}>
                      <i className={`fas fa-${(health?.system.memory.percentage || 0) > 85 ? 'exclamation-triangle' : (health?.system.memory.percentage || 0) > 70 ? 'exclamation-circle' : 'check-circle'}`}></i>
                      {(health?.system.memory.percentage || 0) > 85 ? 'Critical' : (health?.system.memory.percentage || 0) > 70 ? 'Warning' : 'Normal'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    Disk Usage
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    45%
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#d4edda',
                      color: '#155724'
                    }}>
                      <i className="fas fa-check-circle"></i> Normal
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    Database Status
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    UP
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#d4edda',
                      color: '#155724'
                    }}>
                      <i className="fas fa-check-circle"></i> Normal
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    Server Uptime
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    {health ? formatUptime(health.system.uptime) : '0s'}
                  </td>
                  <td style={{ padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#d4edda',
                      color: '#155724'
                    }}>
                      <i className="fas fa-check-circle"></i> Normal
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px' }}>
                    Response Time
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    5ms
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: '#d4edda',
                      color: '#155724'
                    }}>
                      <i className="fas fa-check-circle"></i> Normal
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
                Performance Trends
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={resetCharts}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #6c757d',
                    background: 'white',
                    color: '#667eea',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-undo" style={{ marginRight: '5px' }}></i> Reset Zoom
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', height: '300px', marginBottom: '20px' }}>
              {history.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <XAxis dataKey="timestamp" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#667eea"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cpuLoad"
                      stroke="#28a745"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '10px' }}>
          Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
        </div>
      </div>
    </DashboardLayout>
  )
}