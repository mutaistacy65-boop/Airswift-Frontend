import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/applications')
      const apps = response.data.applications || []
      setApplications(apps)

      // Calculate stats
      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      })
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/applications/${id}`, { status })
      fetchApplications()
      alert(`Application status updated to ${status}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating application')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage applications and send interview invitations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Total Applications</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Pending</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Shortlisted</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.shortlisted}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm">Rejected</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/jobs">
          <a className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900 mb-2">Manage Jobs</h3>
            <p className="text-gray-600 text-sm">Create, edit, and delete job listings</p>
          </a>
        </Link>
        <Link href="/admin/email-templates">
          <a className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900 mb-2">Email Templates</h3>
            <p className="text-gray-600 text-sm">Manage email templates for interviews</p>
          </a>
        </Link>
        <Link href="/admin/send-message">
          <a className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900 mb-2">Send Message</h3>
            <p className="text-gray-600 text-sm">Send interview invitations to candidates</p>
          </a>
        </Link>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">All Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Applicant</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Job</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Applied</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.length > 0 ? (
                applications.map(app => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div>
                        <div>{app.user_id?.name || 'Unknown'}</div>
                        <div className="text-gray-600 text-xs">{app.user_id?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {app.job_id?.title || 'Unknown Job'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link href={`/admin/applications/${app._id}`}>
                        <a className="text-blue-600 hover:text-blue-800">View</a>
                      </Link>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(app._id, 'shortlisted')}
                            className="text-green-600 hover:text-green-800"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(app._id, 'rejected')}
                            className="text-red-600 hover:text-red-800"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                    No applications yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
