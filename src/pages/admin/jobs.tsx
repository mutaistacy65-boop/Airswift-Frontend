
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import UserLayout from '@/layouts/UserLayout'
import { useAuth } from '@/context/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import { adminService } from '@/services/adminService'
import { jobService } from '@/services/jobService'
import { formatDate } from '@/utils/helpers'
import { Edit2, Trash2, Plus, Search, Eye } from 'lucide-react'

// Force server-side rendering for admin pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Job {
  _id: string
  title: string
  company: string
  location: string
  salary?: string
  jobType: string
  description: string
  requirements: string[]
  postedBy?: string
  createdAt: string
  applicants?: number
  status: 'active' | 'paused' | 'closed'
}

const AdminJobsPage = () => {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'full-time',
    description: '',
    requirements: [''],
  })

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '👥 Users', href: '/admin/users' },
    { label: ' Applications', href: '/admin/applications' },
    { label: '📞 Interviews', href: '/admin/interviews' },
    { label: '💰 Payments', href: '/admin/payments' },
    { label: '📋 Audit Logs', href: '/admin/audit' },
    { label: '⚙️ Settings', href: '/admin/settings' },
  ]

  useEffect(() => {
    if (isAuthorized) {
      fetchJobs()
    }
  }, [isAuthorized])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const data = await jobService.getAllJobs()
      const jobs = Array.isArray(data) ? data : data?.jobs || []
      const sortedJobs = [...jobs].sort((a: any, b: any) => {
        if (typeof a === 'string' && typeof b === 'string') {
          return a.localeCompare(b)
        }
        if (a?.title && b?.title) {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
      setJobs(sortedJobs)
    } catch (error) {
      addNotification('Failed to load jobs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async () => {
    if (!formData.title || !formData.company || !formData.location) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    try {
      setSaving(true)
      await adminService.createJob(formData)
      addNotification('Job created successfully', 'success')
      setFormData({
        title: '',
        company: '',
        location: '',
        salary: '',
        jobType: 'full-time',
        description: '',
        requirements: [''],
      })
      setShowCreateModal(false)
      fetchJobs()
    } catch (error: any) {
      addNotification(error?.message || 'Failed to create job', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEditJob = async () => {
    if (!selectedJob) return

    try {
      setSaving(true)
      await adminService.updateJob(selectedJob._id, formData)
      addNotification('Job updated successfully', 'success')
      setShowEditModal(false)
      fetchJobs()
    } catch (error: any) {
      addNotification(error?.message || 'Failed to update job', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!selectedJob) return

    try {
      setSaving(true)
      await adminService.deleteJob(selectedJob._id)
      addNotification('Job deleted successfully', 'success')
      setShowDeleteModal(false)
      fetchJobs()
    } catch (error: any) {
      addNotification(error?.message || 'Failed to delete job', 'error')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (job: Job) => {
    setSelectedJob(job)
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || '',
      jobType: job.jobType,
      description: job.description,
      requirements: job.requirements,
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (job: Job) => {
    setSelectedJob(job)
    setShowDeleteModal(true)
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'all' || job.status === filterStatus

    return matchesSearch && matchesStatus
  })

  if (authLoading || protectedLoading) return <Loader />
  
  if (!isAuthorized) return null

  return (
    <UserLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
            <p className="text-gray-600 mt-1">
              Create, edit, and manage job postings
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                title: '',
                company: '',
                location: '',
                salary: '',
                jobType: 'full-time',
                description: '',
                requirements: [''],
              })
              setShowCreateModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Job
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="text-center py-12">
            <Loader />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-md">
            <p className="text-gray-600 mb-4">No jobs found</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create First Job
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.company}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {job.jobType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          job.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {job.applicants || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(job)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <Link href={`/jobs/${job._id}`}>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="View">
                            <Eye size={18} />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Job Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Developer"
                  required
                />
                <Input
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  required
                />
                <Input
                  label="Salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g., $50k - $80k"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Job description"
                rows={4}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                {formData.requirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const newReqs = [...formData.requirements]
                        newReqs[idx] = e.target.value
                        setFormData({ ...formData, requirements: newReqs })
                      }}
                      placeholder="Add requirement"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newReqs = formData.requirements.filter((_, i) => i !== idx)
                        setFormData({ ...formData, requirements: newReqs })
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      requirements: [...formData.requirements, ''],
                    })
                  }
                  className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  + Add Requirement
                </button>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Job Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <Input
                  label="Salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditJob}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Job'}
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Job?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedJob?.title}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </UserLayout>
  )
}

export default AdminJobsPage
