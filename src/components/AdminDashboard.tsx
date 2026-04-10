import React, { useState, useEffect } from 'react'
import { api } from '@/utils/api'

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '', date: '', time: '' })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    if (applications.length > 0) return // simple cache
    try {
      const res = await api.get('/admin/applications')
      setApplications(res.data.applications || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/applications/${id}`, { status })
      fetchApplications()
    } catch (err) {
      console.error(err)
    }
  }

  const openModal = (userId: string) => {
    setSelectedUser(userId)
    setShowModal(true)
  }

  const sendInterview = async () => {
    try {
      await api.post('/admin/messages/send', {
        user_id: selectedUser,
        subject: form.subject,
        message: form.message,
        interview_date: form.date,
        interview_time: form.time,
      })

      setShowModal(false)
      setForm({ subject: '', message: '', date: '', time: '' })
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Applicant</th>
              <th className="p-4 text-left">Job</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{app.user_id?.name}</div>
                  <div className="text-sm text-gray-500">{app.user_id?.email}</div>
                </td>

                <td className="p-4">{app.job_id?.title}</td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>

                <td className="p-4">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>

                <td className="p-4 space-x-3">
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(app._id, 'shortlisted')}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Shortlist
                      </button>

                      <button
                        onClick={() => updateStatus(app._id, 'rejected')}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => openModal(app.user_id?._id)}
                    className="bg-purple-500 text-white px-3 py-1 rounded"
                  >
                    Interview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div className="p-6 text-center text-gray-500">No applications found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Send Interview</h2>

            <input
              placeholder="Subject"
              className="w-full border p-2 rounded"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />

            <textarea
              placeholder="Message"
              className="w-full border p-2 rounded"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />

            <input
              type="date"
              className="w-full border p-2 rounded"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              type="time"
              className="w-full border p-2 rounded"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={sendInterview}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
