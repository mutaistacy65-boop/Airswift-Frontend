import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface AdminLog {
  _id: string
  userId?: {
    _id: string
    email: string
    name: string
  }
  action: string
  details: Record<string, any>
  createdAt: string
  [key: string]: any
}

interface AdminLogsProps {
  limit?: number
  compact?: boolean
}

/**
 * Admin Logs Display Component
 * 
 * Usage:
 * <AdminLogs limit={10} />
 */
export const AdminLogs: React.FC<AdminLogsProps> = ({ limit = 50, compact = false }) => {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      // Using the new /api/admin/audit endpoint
      const response = await fetch(
        `/api/admin/audit?page=1&limit=${limit}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setLogs(data.logs)
      } else {
        setError(data.message || 'Failed to fetch logs')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch logs'
      setError(errorMessage)
      console.error('Error fetching admin logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800'
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800'
      case 'REGISTER':
        return 'bg-green-100 text-green-800'
      case 'FAILED_LOGIN':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Admin access required to view logs</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <span className="ml-2 text-gray-600">Loading logs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Error: {error}</p>
        <button
          onClick={fetchLogs}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-700">No admin logs found</p>
      </div>
    )
  }

  if (compact) {
    // Compact view - simple list
    return (
      <div className="space-y-2">
        {logs.map(log => (
          <div key={log._id} className="bg-white border border-gray-200 rounded p-3 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="ml-2 text-gray-600">{log.user_name || 'Unknown User'}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Full view - detailed cards
  return (
    <div className="space-y-4">
      {logs.map(log => (
        <div key={log._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getActionBadgeColor(log.action)}`}>
                  {log.action}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {log.user_name || 'Unknown User'}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{log.user_email || 'N/A'}</p>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>

          {log.details && Object.keys(log.details).length > 0 && (
            <div className="bg-gray-50 rounded p-3 mt-4">
              <p className="text-xs font-bold text-gray-700 mb-2">Details:</p>
              <div className="space-y-1">
                {Object.entries(log.details).map(([key, value]) => (
                  <p key={key} className="text-xs text-gray-600">
                    <span className="font-semibold">{key}:</span> {String(value)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {log.ip_address && (
            <div className="mt-3 text-xs text-gray-500">
              <span className="font-semibold">IP:</span> {log.ip_address}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AdminLogs
