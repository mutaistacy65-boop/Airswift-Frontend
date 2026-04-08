import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import { adminService } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'
import { Eye, Search, Download, Filter, Trash2, AlertCircle, CheckCircle, Edit2, Trash } from 'lucide-react'

interface AuditLog {
  _id: string
  id?: string
  action: string
  resource: string
  resource_id: string | number
  details: Record<string, any>
  created_at: string
  user?: {
    name: string
    email: string
  }
  ip_address?: string
}

export default function AdminAuditPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(15)

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

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

  const actionTypes = [
    'all',
    'user_created',
    'user_updated',
    'user_deleted',
    'application_status_update',
    'job_created',
    'job_updated',
    'job_deleted',
    'interview_scheduled',
    'interview_completed',
    'payment_processed',
    'email_sent',
    'offer_generated',
    'settings_updated',
  ]

  const resourceTypes = [
    'all',
    'user',
    'application',
    'job',
    'interview',
    'payment',
    'email',
    'offer',
    'settings',
  ]

  useEffect(() => {
    if (isAuthorized) {
      fetchLogs()
    }
  }, [isAuthorized, currentPage, searchTerm, actionFilter, resourceFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        resource: resourceFilter !== 'all' ? resourceFilter : undefined,
      }
      const response = await adminService.getAuditLogs(params)
      setLogs(Array.isArray(response) ? response : response.logs || [])
      setTotalLogs(response.pagination?.total || response.length || 0)
    } catch (error) {
      addNotification('Failed to load audit logs', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const getActionIcon = (action: string) => {
    if (action.includes('created')) return <CheckCircle className="text-green-600" size={18} />
    if (action.includes('deleted')) return <Trash className="text-red-600" size={18} />
    if (action.includes('updated')) return <Edit2 className="text-blue-600" size={18} />
    return <AlertCircle className="text-yellow-600" size={18} />
  }

  const getActionColor = (action: string) => {
    if (action.includes('created'))
      return 'bg-green-50 text-green-900 border-l-4 border-green-500'
    if (action.includes('deleted')) return 'bg-red-50 text-red-900 border-l-4 border-red-500'
    if (action.includes('updated')) return 'bg-blue-50 text-blue-900 border-l-4 border-blue-500'
    return 'bg-yellow-50 text-yellow-900 border-l-4 border-yellow-500'
  }

  const handleExportLogs = () => {
    try {
      const csv = [
        ['ID', 'Action', 'Resource', 'Resource ID', 'User', 'Email', 'Timestamp', 'Details'],
        ...logs.map((log) => [
          log._id,
          log.action,
          log.resource,
          log.resource_id,
          log.user?.name || 'System',
          log.user?.email || 'N/A',
          formatDate(log.created_at),
          JSON.stringify(log.details || {}),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      addNotification('Audit logs exported successfully', 'success')
    } catch (error) {
      addNotification('Failed to export logs', 'error')
    }
  }

  if (authLoading || protectedLoading) return <Loader />
  if (!isAuthorized) return null

  const totalPages = Math.ceil(totalLogs / pageSize)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
          </div>
          <Button
            onClick={handleExportLogs}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={18} /> Export
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900">{totalLogs}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Time Period</p>
            <p className="text-3xl font-bold text-gray-900">30 days</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-4 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 outline-none text-sm"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Actions' : type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Resources' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <Button
              onClick={() => {
                setSearchTerm('')
                setActionFilter('all')
                setResourceFilter('all')
                setCurrentPage(1)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Reset
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Total Logs: <strong>{totalLogs}</strong> | Page {currentPage} of{' '}
            {totalPages || 1}
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center">
              <Loader />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className={`rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer ${getActionColor(
                  log.action
                )}`}
                onClick={() => handleViewDetails(log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getActionIcon(log.action)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                          {log.resource}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        <strong>User:</strong> {log.user?.name || 'System'} ({log.user?.email || 'N/A'})
                      </p>
                      <p className="text-sm">
                        <strong>Resource ID:</strong> {log.resource_id}
                      </p>
                      {log.ip_address && (
                        <p className="text-xs text-gray-600 mt-1">
                          IP: {log.ip_address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{formatDate(log.created_at)}</p>
                    <Eye size={18} className="mt-2 ml-auto text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Audit Log Details"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Action</p>
                  <p className="font-semibold text-gray-900">
                    {selectedLog.action.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resource</p>
                  <p className="font-semibold text-gray-900">
                    {selectedLog.resource.charAt(0).toUpperCase() + selectedLog.resource.slice(1)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Resource ID</p>
                  <p className="font-semibold text-gray-900">{selectedLog.resource_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedLog.created_at)}</p>
                </div>
              </div>

              {selectedLog.user && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">User Name</p>
                    <p className="font-semibold text-gray-900">{selectedLog.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User Email</p>
                    <p className="font-semibold text-gray-900">{selectedLog.user.email}</p>
                  </div>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="font-semibold text-gray-900">{selectedLog.ip_address}</p>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Details</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm font-mono text-gray-700 max-h-64 overflow-auto">
                    <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
