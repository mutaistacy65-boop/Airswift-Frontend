export const dynamic = "force-dynamic"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

interface Application {
  _id: string
  user_id: {
    _id: string
    name: string
    email: string
    phone: string
  }
  job_id: {
    _id: string
    title: string
    description: string
  }
  national_id: string
  phone: string
  passport_path: string
  cv_path: string
  status: 'pending' | 'shortlisted' | 'rejected'
  created_at: string
}

export default function AdminApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'shortlisted' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') return
    fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/applications')
      setApplications(response.data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      alert('Error fetching applications')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`/api/applications/${id}`, { status: newStatus })
      setApplications(
        applications.map(app =>
          app._id === id ? { ...app, status: newStatus as any } : app
        )
      )
      alert(`Application status updated to ${newStatus}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating status')
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

  if (user?.role !== 'admin') {
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
    
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="bg-red-100 border border-red-400 rounded p-4">
          <p className="text-red-700">Only admins can view applications.</p>
        </div>
      </DashboardLayout>
    )
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch =
      app.user_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user_id.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_id.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
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
    
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

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

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
          <p className="text-gray-600 mt-2">
            Review and manage all job applications. Total: {applications.length}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search by name, email, or job</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Applicant</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Job</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Applied</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredApplications.map(app => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{app.user_id.name}</div>
                        <div className="text-xs text-gray-600">{app.user_id.email}</div>
                        <div className="text-xs text-gray-600">{app.user_id.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {app.job_id.title}
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
                          <a className="text-blue-600 hover:text-blue-800 font-medium">View</a>
                        </Link>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app._id, 'shortlisted')}
                              className="text-green-600 hover:text-green-800 font-medium ml-2"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                              className="text-red-600 hover:text-red-800 font-medium ml-2"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <Link href={`/admin/send-message?userId=${app.user_id._id}`}>
                            <a className="text-purple-600 hover:text-purple-800 font-medium ml-2">
                              Send Message
                            </a>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
