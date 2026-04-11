import React, { useState, useEffect } from 'react'
import { api } from '@/utils/api'

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '', date: '', time: '' })
  const [notes, setNotes] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/applications')
      const apps = res.data.applications || []
      setApplications(apps)
      // Load notes into local state
      const notesMap: { [key: string]: string } = {}
      apps.forEach((app: any) => {
        if (app.notes) {
          notesMap[app._id] = app.notes
        }
      })
      setNotes(notesMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/application/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      fetchApplications(); // refresh list
    } catch (err) {
      console.error(err)
    }
  }

  const updateNotes = async (id: string, noteText: string) => {
    try {
      await fetch(`/api/admin/application/${id}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: "include",
        body: JSON.stringify({ notes: noteText }),
      });
      // Update local state
      setNotes(prev => ({ ...prev, [id]: noteText }))
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
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
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
              <th className="p-4 text-left">Documents</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Notes</th>
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

                <td className="p-4 space-y-2">
                  {app.cvUrl && (
                    <div className="space-x-2">
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View CV
                      </a>
                      <a
                        href={app.cvUrl}
                        download
                        className="text-green-600 hover:text-green-800 underline text-sm"
                      >
                        Download CV
                      </a>
                    </div>
                  )}
                  {app.passportUrl && (
                    <div className="space-x-2">
                      <a
                        href={app.passportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View Passport
                      </a>
                      <a
                        href={app.passportUrl}
                        download
                        className="text-green-600 hover:text-green-800 underline text-sm"
                      >
                        Download Passport
                      </a>
                    </div>
                  )}
                  {!app.cvUrl && !app.passportUrl && (
                    <span className="text-gray-400 text-sm">No documents</span>
                  )}
                </td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>

                <td className="p-4">
                  <textarea
                    value={notes[app._id] || ""}
                    onChange={(e) => {
                      const newNotes = { ...notes, [app._id]: e.target.value }
                      setNotes(newNotes)
                    }}
                    onBlur={(e) => updateNotes(app._id, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full border rounded px-2 py-1 text-sm resize-none"
                    rows={2}
                  />
                </td>

                <td className="p-4">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>

                <td className="p-4 space-x-2">
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(app._id, 'shortlisted')}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Shortlist
                      </button>

                      <button
                        onClick={() => updateStatus(app._id, 'accepted')}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => updateStatus(app._id, 'rejected')}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => openModal(app.user_id?._id)}
                    className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
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
