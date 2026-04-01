import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import { jobService, Job } from '@/services/jobService'
import { JOB_TYPES } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'

const AdminJobsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [saving, setSaving] = useState(false)

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    requirements: [''],
    type: 'full-time'
  })

  useEffect(() => {
    if (isAuthorized) {
      fetchJobs()
    }
  }, [isAuthorized])

  const fetchJobs = async () => {
    try {
      const data = await jobService.getAllJobs()
      setJobs(data.jobs || data)
    } catch (error) {
      addNotification('Failed to load jobs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetJobForm = () => {
    setJobForm({
      title: '',
      company: '',
      location: '',
      salary: '',
      description: '',
      requirements: [''],
      type: 'full-time'
    })
  }

  const handleCreateJob = () => {
    resetJobForm()
    setShowCreateModal(true)
  }

  const handleEditJob = (job: Job) => {
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      type: job.type
    })
    setSelectedJob(job)
    setShowEditModal(true)
  }

  const handleSaveJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.description) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    setSaving(true)
    try {
      if (selectedJob) {
        // Update existing job
        // await jobService.updateJob(selectedJob.id, jobForm)
        addNotification('Job updated successfully!', 'success')
      } else {
        // Create new job
        // await jobService.createJob(jobForm)
        addNotification('Job created successfully!', 'success')
      }

      setShowCreateModal(false)
      setShowEditModal(false)
      fetchJobs() // Refresh the list
    } catch (error) {
      addNotification('Failed to save job', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      // await jobService.deleteJob(jobId)
      addNotification('Job deleted successfully!', 'success')
      fetchJobs() // Refresh the list
    } catch (error) {
      addNotification('Failed to delete job', 'error')
    }
  }

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...jobForm.requirements]
    newRequirements[index] = value
    setJobForm(prev => ({ ...prev, requirements: newRequirements }))
  }

  const addRequirement = () => {
    setJobForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))
  }

  const removeRequirement = (index: number) => {
    if (jobForm.requirements.length > 1) {
      const newRequirements = jobForm.requirements.filter((_, i) => i !== index)
      setJobForm(prev => ({ ...prev, requirements: newRequirements }))
    }
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Manage Jobs', href: '/admin/jobs', icon: '💼' },
    { label: 'Applications', href: '/admin/applications', icon: '📋' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      {/* Create/Edit Job Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false)
          setShowEditModal(false)
        }}
        onConfirm={handleSaveJob}
        confirmText={saving ? 'Saving...' : 'Save Job'}
        title={selectedJob ? 'Edit Job' : 'Create New Job'}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              value={jobForm.title}
              onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Input
              label="Company"
              value={jobForm.company}
              onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={jobForm.location}
              onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
            />
            <Input
              label="Salary"
              value={jobForm.salary}
              onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
              placeholder="e.g., $50,000 - $70,000 per year"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Job Type</label>
            <select
              value={jobForm.type}
              onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {JOB_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Job Description"
            value={jobForm.description}
            onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            required
          />

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Requirements</label>
            {jobForm.requirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder={`Requirement ${index + 1}`}
                  className="flex-1"
                />
                {jobForm.requirements.length > 1 && (
                  <Button
                    onClick={() => removeRequirement(index)}
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={addRequirement}
              variant="outline"
              size="sm"
              type="button"
            >
              Add Requirement
            </Button>
          </div>
        </div>
      </Modal>

      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <Button onClick={handleCreateJob} className="bg-green-600 hover:bg-green-700">
            Create New Job
          </Button>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">💼</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Created Yet</h2>
            <p className="text-gray-600 mb-6">Start by creating your first job posting.</p>
            <Button onClick={handleCreateJob}>Create Your First Job</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600">{job.company} • {job.location}</p>
                    <p className="text-sm text-gray-500">Posted: {formatDate(job.postedDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {job.type.replace('-', ' ')}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {job.appliedCount} applicants
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-3">{job.description}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Key Requirements:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                    {job.requirements.length > 3 && (
                      <li className="text-gray-500">...and {job.requirements.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleEditJob(job)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteJob(job.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminJobsPage
