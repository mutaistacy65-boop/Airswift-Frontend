import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/admin/payments', {
        params: { status: statusFilter || undefined },
      })
      setPayments(res.data.payments)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const reconcile = async (id: string, status: string) => {
    try {
      await axios.put(`/api/admin/payments/${id}/reconcile`, { status })
      fetchPayments()
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Payments إدارة</h1>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <button
          onClick={() => setStatusFilter('')}
          className="bg-gray-200 px-3 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Provider</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div>{p.user_id?.name}</div>
                  <div className="text-sm text-gray-500">
                    {p.user_id?.email}
                  </div>
                </td>

                <td className="p-3">{p.amount} {p.currency}</td>

                <td className="p-3">{p.provider}</td>

                <td className={`p-3 ${getStatusColor(p.status)}`}>
                  {p.status}
                </td>

                <td className="p-3">
                  {new Date(p.created_at).toLocaleString()}
                </td>

                <td className="p-3 space-x-2">
                  {p.status === 'pending' && (
                    <>
                      <button
                        onClick={() => reconcile(p._id, 'completed')}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Mark Paid
                      </button>

                      <button
                        onClick={() => reconcile(p._id, 'failed')}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Mark Failed
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No payments found
          </div>
        )}
      </div>
    </div>
  )
}