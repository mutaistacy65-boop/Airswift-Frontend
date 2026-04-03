import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import { APPLICATION_STATUS } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'

interface AdminApplication {
  _id: string
  fullName: string
  email: string
  userId?: string
  jobId: { title: string } | string
  status: string
  passport?: string
  nationalId?: string
  coverLetter?: string
  appliedDate?: string
  documents?: {
    passport?: string
    nationalId?: string
    cv?: string
    certificates?: string[]
  }
  interviewDetails?: {
    zoomLink?: string
  }
  createdAt?: string
  updatedAt?: string
}

const AdminApplicationsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Interview scheduling form
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [scheduling, setScheduling] = useState(false)

  // Status update form
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (isAuthorized) {
      fetchApplications()
    }
  }, [isAuthorized])

  const fetchApplications = async () => {
    setLoading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
      const response = await axios.get('/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setApplications(response.data)
    } catch (error: any) {
      addNotification(error?.response?.data?.message || 'Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800'
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800'
      case 'visa_payment_pending': return 'bg-orange-100 text-orange-800'
      case 'visa_processing': return 'bg-teal-100 text-teal-800'
      case 'visa_ready': return 'bg-emerald-100 text-emerald-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Under Review'
      case 'reviewed': return 'Reviewed'
      case 'accepted': return 'Accepted'
      case 'interview_scheduled': return 'Interview Scheduled'
      case 'interview_completed': return 'Interview Completed'
      case 'visa_payment_pending': return 'Visa Payment Pending'
      case 'visa_processing': return 'Visa Processing'
      case 'visa_ready': return 'Visa Ready'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  const handleScheduleInterview = (application: AdminApplication) => {
    setSelectedApplication(application)
    setInterviewDate('')
    setInterviewTime('')
    setZoomLink('')
    setInterviewNotes('')
    setShowScheduleModal(true)
  }

  const handleUpdateStatus = (application: AdminApplication) => {
    setSelectedApplication(application)
    setNewStatus(application.status)
    setStatusNotes('')
    setShowStatusModal(true)
  }

  const submitInterviewSchedule = async () => {
    if (!selectedApplication || !interviewDate || !interviewTime || !zoomLink) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    setScheduling(true)
    try {
      const interviewDetails = {
        scheduledDate: `${interviewDate} ${interviewTime}`,
        zoomLink,
        notes: interviewNotes,
      }

      // Update the application status to interview_scheduled with API call
      await updateApplicationStatus(
        selectedApplication._id,
        'interview_scheduled',
        `Interview scheduled for ${interviewDetails.scheduledDate}`
      )

      await axios.post(
        '/api/admin/send-interview',
        {
          email: selectedApplication.email || '',
          name: selectedApplication.fullName || 'Candidate',
          meetLink: zoomLink,
          date: interviewDetails.scheduledDate,
        },
        {
          headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}` },
        }
      )

      addNotification('Interview scheduled and email sent successfully!', 'success')
      setShowScheduleModal(false)
      fetchApplications()
    } catch (error: any) {
      addNotification(error?.response?.data?.message || 'Failed to schedule interview', 'error')
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, notes: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
    await axios.patch(
      `/api/admin/applications/${applicationId}`,
      { status, notes },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  }

  const submitStatusUpdate = async () => {
    if (!selectedApplication || !newStatus) {
      addNotification('Please select a status', 'error')
      return
    }

    setUpdatingStatus(true)
    try {
      await updateApplicationStatus(selectedApplication._id, newStatus, statusNotes)
      addNotification('Application status updated successfully!', 'success')
      setShowStatusModal(false)
      fetchApplications() // Refresh the list
    } catch (error: any) {
      addNotification(error?.response?.data?.message || 'Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus)

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
      {/* Schedule Interview Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={submitInterviewSchedule}
        confirmText={scheduling ? 'Scheduling...' : 'Schedule Interview'}
        title="Schedule Interview"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Interview Date"
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
            />
            <Input
              label="Interview Time"
              type="time"
              value={interviewTime}
              onChange={(e) => setInterviewTime(e.target.value)}
              required
            />
          </div>
          <Input
            label="Zoom Meeting Link"
            type="url"
            value={zoomLink}
            onChange={(e) => setZoomLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            required
          />
          <Textarea
            label="Interview Notes (Optional)"
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
            rows={3}
            placeholder="Any special instructions or notes for the candidate..."
          />
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={submitStatusUpdate}
        confirmText={updatingStatus ? 'Updating...' : 'Update Status'}
        title="Update Application Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              {APPLICATION_STATUS.map(status => (
                <option key={status} value={status}>
                  {getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            label="Status Update Notes (Optional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            rows={3}
            placeholder="Any notes about this status change..."
          />
        </div>
      </Modal>

      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Applications</h1>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              {APPLICATION_STATUS.map(status => (
                <option key={status} value={status}>
                  {getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h2>
            <p className="text-gray-600">
              {filterStatus === 'all' ? 'No applications have been submitted yet.' : `No applications with status "${getStatusText(filterStatus)}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Application #{application._id.slice(-8)}
                    </h3>
                    <p className="text-gray-600">
                      Job: {typeof application.jobId === 'string' ? application.jobId : application.jobId?.title || 'Unknown'} | Applied: {formatDate(application.createdAt || '')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Applicant ID</p>
                    <p className="font-medium">{application.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Application Date</p>
                    <p className="font-medium">{formatDate(application.appliedDate)}</p>
                  </div>
                </div>

                {application.coverLetter && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Cover Letter</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">
                      {application.coverLetter.length > 150
                        ? `${application.coverLetter.slice(0, 150)}...`
                        : application.coverLetter
                      }
                    </p>
                  </div>
                )}

                {application.documents && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Submitted Documents</p>
                    <div className="flex gap-2 flex-wrap">
                      {application.documents.passport && (
                        <a href={application.documents.passport} target="_blank" rel="noopener noreferrer"
                           className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200">
                          Passport
                        </a>
                      )}
                      {application.documents.nationalId && (
                        <a href={application.documents.nationalId} target="_blank" rel="noopener noreferrer"
                           className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200">
                          National ID
                        </a>
                      )}
                      {application.documents.cv && (
                        <a href={application.documents.cv} target="_blank" rel="noopener noreferrer"
                           className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm hover:bg-purple-200">
                          CV
                        </a>
                      )}
                      {application.documents.certificates && application.documents.certificates.length > 0 && (
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm">
                          {application.documents.certificates.length} Certificate(s)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 flex gap-3">
                  <Button
                    onClick={() => handleUpdateStatus(application)}
                    variant="outline"
                    size="sm"
                  >
                    Update Status
                  </Button>

                  {(application.status === 'accepted' || application.status === 'pending' || application.status === 'reviewed') && (
                    <Button
                      onClick={() => handleScheduleInterview(application)}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Schedule Interview
                    </Button>
                  )}

                  {application.status === 'interview_scheduled' && application.interviewDetails?.zoomLink && (
                    <a href={application.interviewDetails.zoomLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Join Interview
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminApplicationsPage
