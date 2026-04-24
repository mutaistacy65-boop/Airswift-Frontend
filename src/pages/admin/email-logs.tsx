import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import { adminService } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'
import { Search, Download } from 'lucide-react'

interface EmailLog {
  _id: string
  recipientEmail: string
  subject: string
  templateId?: string
  status?: string
  sentAt: string
  error?: string
  user?: {
    name?: string
    email?: string
  }
}

export default function AdminEmailLogsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [logs, setLogs] = useState<EmailLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  useEffect(() => {
    if (isAuthorized) {
      fetchLogs()
    }
  }, [isAuthorized, currentPage, searchTerm])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
      }
      const response = await adminService.getEmailLogs(params)
      setLogs(Array.isArray(response) ? response : response.logs || [])
      setTotalLogs(response.pagination?.total || response.length || 0)
    } catch (error: any) {
      addNotification('Failed to load email logs', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    try {
      const csv = [
        ['Email', 'Subject', 'Template', 'Status', 'Sent At', 'Error'],
        ...logs.map((log) => [
          log.recipientEmail || '',
          log.subject || '',
          log.templateId || '',
          log.status || '',
          formatDate(log.sentAt),
          log.error || '',
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email_logs_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      addNotification('Failed to export email logs', 'error')
    }
  }

  if (authLoading || protectedLoading) return <Loader />
  if (!isAuthorized) return null

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '👥 Users', href: '/admin/users' },
    { label: ' Applications', href: '/admin/applications' },
    { label: '📞 Interviews', href: '/admin/interviews' },
    { label: '💰 Payments', href: '/admin/payments' },
    { label: '📋 Audit Logs', href: '/admin/audit' },
    { label: '✉️ Email Logs', href: '/admin/email-logs' },
    { label: '⚙️ Settings', href: '/admin/settings' },
  ]

  const totalPages = Math.ceil(totalLogs / pageSize)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Logs</h1>
            <p className="text-gray-600 mt-1">View all email delivery events sent through the admin panel.</p>
          </div>
          <Button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download size={18} /> Export
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 w-full md:w-96">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search email logs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sent At</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Loading email logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No email logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">{log.recipientEmail}</td>
                      <td className="px-4 py-3">{log.subject}</td>
                      <td className="px-4 py-3">{log.templateId || 'Custom'}</td>
                      <td className="px-4 py-3">{log.status || 'sent'}</td>
                      <td className="px-4 py-3">{formatDate(log.sentAt)}</td>
                      <td className="px-4 py-3">{log.error || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
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
      </div>
    </DashboardLayout>
  )
}
