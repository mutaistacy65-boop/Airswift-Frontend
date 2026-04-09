export const dynamic = "force-dynamic"

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
import { Eye, Search, Download, DollarSign, TrendingUp, BarChart3 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

interface Payment {
  _id: string
  id?: string
  amount: number
  service_type: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  phone_number: string
  reference: string
  created_at: string
  updated_at?: string
  user?: {
    name: string
    email: string
  }
  notes?: string
}

interface PaymentStats {
  totalRevenue: number
  paymentsByType: Array<{ service_type: string; count: number; total: number }>
  monthlyRevenue: Array<{ month: string; total: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AdminPaymentsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [payments, setPayments] = useState<Payment[]>([])
  const [totalPayments, setTotalPayments] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState<PaymentStats | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const [showViewModal, setShowViewModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

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
      fetchPayments()
      fetchStats()
    }
  }, [isAuthorized, currentPage, searchTerm, statusFilter, serviceFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        service_type: serviceFilter !== 'all' ? serviceFilter : undefined,
      }
      const response = await adminService.getPayments(params)
      setPayments(Array.isArray(response) ? response : response.payments || [])
      setTotalPayments(response.pagination?.total || response.length || 0)
    } catch (error) {
      addNotification('Failed to load payments', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await adminService.getPaymentStats()
      setStats(response)
    } catch (error) {
      addNotification('Failed to load payment statistics', 'error')
      console.error(error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const handleUpdateStatus = (payment: Payment) => {
    setSelectedPayment(payment)
    setNewStatus(payment.status)
    setNotes(payment.notes || '')
    setShowStatusModal(true)
  }

  const handleSaveStatus = async () => {
    if (!selectedPayment || !newStatus) return

    try {
      setSaving(true)
      await adminService.updatePaymentStatus(selectedPayment._id, newStatus, notes)
      addNotification('Payment status updated successfully', 'success')
      setShowStatusModal(false)
      fetchPayments()
      fetchStats()
    } catch (error: any) {
      addNotification(
        error.response?.data?.message || 'Failed to update payment status',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleExportPayments = () => {
    try {
      const csv = [
        ['ID', 'Amount', 'Service Type', 'Status', 'User', 'Email', 'Phone', 'Date'],
        ...payments.map((p) => [
          p._id,
          p.amount,
          p.service_type,
          p.status,
          p.user?.name || 'N/A',
          p.user?.email || 'N/A',
          p.phone_number,
          formatDate(p.created_at),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      addNotification('Payments exported successfully', 'success')
    } catch (error) {
      addNotification('Failed to export payments', 'error')
    }
  }

  if (authLoading || protectedLoading) return <Loader />
  if (!isAuthorized) return null

  const totalPages = Math.ceil(totalPayments / pageSize)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all platform payments</p>
          </div>
          <Button
            onClick={handleExportPayments}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <Loader />
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">
                    Ksh {(stats.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign size={40} className="opacity-30" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Payments</p>
                  <p className="text-3xl font-bold mt-2">{totalPayments}</p>
                </div>
                <BarChart3 size={40} className="opacity-30" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Average Amount</p>
                  <p className="text-3xl font-bold mt-2">
                    Ksh {totalPayments > 0 ? Math.round((stats.totalRevenue || 0) / totalPayments).toLocaleString() : '0'}
                  </p>
                </div>
                <TrendingUp size={40} className="opacity-30" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Charts */}
        {stats && stats.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Ksh ${value.toLocaleString()}`} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={{ fill: '#0088FE', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Payments by Type */}
            {stats.paymentsByType && stats.paymentsByType.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.paymentsByType}
                      dataKey="total"
                      nameKey="service_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.paymentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Ksh ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-4 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by phone or reference..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 outline-none text-sm"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Services</option>
              <option value="visa_fee">Visa Fee</option>
              <option value="subscription">Subscription</option>
              <option value="premium">Premium</option>
            </select>

            <Button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setServiceFilter('all')
                setCurrentPage(1)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Reset
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Total Payments: <strong>{totalPayments}</strong> | Page {currentPage} of{' '}
            {totalPages || 1}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No payments found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Ksh {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {payment.service_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.phone_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewPayment(payment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(payment)}
                            className="text-amber-600 hover:text-amber-800 text-lg"
                            title="Update Status"
                          >
                            ⚙️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {/* View Payment Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Payment Details"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-gray-900">
                    Ksh {selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {selectedPayment.service_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                      selectedPayment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedPayment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedPayment.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedPayment.status.charAt(0).toUpperCase() +
                      selectedPayment.status.slice(1)}
                  </span>
                </div>
              </div>

              {selectedPayment.user && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">User Name</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.user.email}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-semibold text-gray-900">{selectedPayment.phone_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedPayment.created_at)}
                  </p>
                </div>
                {selectedPayment.updated_at && (
                  <div>
                    <p className="text-sm text-gray-600">Updated</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedPayment.updated_at)}
                    </p>
                  </div>
                )}
              </div>

              {selectedPayment.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Update Status Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Update Payment Status"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this status change..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveStatus}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Status'}
              </Button>
              <Button
                onClick={() => setShowStatusModal(false)}
                disabled={saving}
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
