import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import API from '@/services/apiClient'

interface AuditLog {
  _id: string
  action: string
  entity?: string
  entity_id?: string
  ip_address?: string
  browser?: string
  device_type?: string
  os?: string
  is_suspicious?: boolean
  created_at: string
  details?: Record<string, any>
  user_name?: string
  user_email?: string
}

interface AdminLogsProps {
  limit?: number
  compact?: boolean
}

/**
 * Enhanced Admin Audit Logs Display Component with Filtering and Pagination
 *
 * Features:
 * - Advanced filtering by action, entity, date range
 * - Pagination with configurable page size
 * - Comprehensive log details display
 * - Role-based access control
 * - Responsive table layout
 */
export const AdminLogs = ({ limit = 20, compact = false }: AdminLogsProps) => {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    startDate: '',
    endDate: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit,
    pages: 1,
    total: 0
  })

  useEffect(() => {
    fetchLogs()
  }, [pagination.page])

  const fetchLogs = async (override: { page?: number } = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: (override.page || pagination.page).toString(),
        limit: pagination.limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.entity && { entity: filters.entity }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await API.get(`/audit-logs?${params}`)

      setLogs(Array.isArray(response.data.logs) ? response.data.logs : [])
      setPagination((prev) => ({
        ...prev,
        page: response.data.pagination?.page || override.page || prev.page,
        pages: response.data.pagination?.pages || prev.pages,
        total: response.data.pagination?.total || 0
      }))
    } catch (err: any) {
      console.error('Failed to load audit logs:', err)
      setError(err.response?.data?.message || 'Unable to load audit logs. Please try again.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const applyFilters = async () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    await fetchLogs({ page: 1 })
  }

  const changePage = async (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
    await fetchLogs({ page: newPage })
  }

  const renderDetails = (details: any) => {
    if (!details) return '—'
    if (typeof details === 'string') return details
    return JSON.stringify(details, null, 2)
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
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'VIEW':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">Admin access required to view audit logs</p>
      </div>
    )
  }

  if (compact) {
    // Compact view - simple list (keeping original compact functionality)
    return (
      <div className="space-y-2">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-32"
            />
            <input
              type="text"
              placeholder="Entity"
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-32"
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              Apply Filters
            </button>
          </div>

          {loading && <p className="text-gray-600">Loading audit logs...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && logs.length === 0 && (
            <p className="text-gray-600">No audit logs found.</p>
          )}

          {!loading && !error && logs.length > 0 && (
            <>
              {logs.map(log => (
                <div key={log._id} className="bg-gray-50 border border-gray-200 rounded p-3 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="ml-2 text-gray-600">{log.user_name || log.user_email || 'Unknown User'}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => changePage(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} logs)
                </span>
                <button
                  onClick={() => changePage(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Full view - comprehensive table layout
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Audit Logs</h2>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Action"
          value={filters.action}
          onChange={(e) => handleFilterChange('action', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-32"
        />
        <input
          type="text"
          placeholder="Entity"
          value={filters.entity}
          onChange={(e) => handleFilterChange('entity', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-32"
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
        >
          Apply Filters
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin">
            <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="ml-2 text-gray-600">Loading audit logs...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-medium">Error: {error}</p>
          <button
            onClick={() => fetchLogs()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Time</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">User</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Action</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Entity</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Entity ID</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">IP</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Device</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Status</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div>
                          <div className="font-medium">{log.user_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{log.user_email}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">{log.entity || '—'}</td>
                      <td className="border border-gray-200 px-4 py-3 font-mono text-xs">{log.entity_id || '—'}</td>
                      <td className="border border-gray-200 px-4 py-3 font-mono text-xs">{log.ip_address || '—'}</td>
                      <td className="border border-gray-200 px-4 py-3 text-xs">
                        {log.device_type && log.os ? `${log.device_type} (${log.os})` :
                         log.device_type ? log.device_type :
                         log.os ? log.os : '—'}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {log.is_suspicious ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
                            Suspicious
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="max-w-xs truncate" title={renderDetails(log.details)}>
                          {renderDetails(log.details)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => changePage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total logs)
            </span>
            <button
              onClick={() => changePage(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}