'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getSocket } from '@/services/socket'
import API from '@/services/apiClient'

interface AuditLog {
  _id: string
  userId: string
  action: string
  module: string
  metadata?: any
  createdAt: string
}

export default function AuditLogViewer() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only allow admins to view audit logs
    if (!hasPermission('view_audit_logs')) {
      setIsLoading(false)
      return
    }

    const socket = getSocket()
    if (!socket) {
      setIsLoading(false)
      return
    }

    const handleAuditLog = (log: AuditLog) => {
      console.log('📋 New audit log:', log)
      setAuditLogs(prev => [log, ...prev.slice(0, 99)]) // Keep last 100 logs
    }

    socket.on('audit:stream', handleAuditLog)

    // Fetch initial audit logs
    fetchAuditLogs()

    return () => {
      socket.off('audit:stream', handleAuditLog)
    }
  }, [hasPermission])

  const fetchAuditLogs = async () => {
    try {
      const response = await API.get('/audit-logs?limit=50')
      if (response.data && response.data.logs) {
        setAuditLogs(response.data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasPermission('view_audit_logs')) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">You don't have permission to view audit logs.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No audit logs available
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userId === user?.id ? 'You' : log.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.module}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.metadata ? JSON.stringify(log.metadata, null, 2) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}