import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import InterviewCalendar from '@/components/InterviewCalendar'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import { interviewService } from '@/services/interviewService'
import { formatDate } from '@/utils/helpers'
import { Calendar, Clock, User, MapPin, Video } from 'lucide-react'

interface Interview {
  _id: string
  id?: string
  applicationId: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'done' | 'no-show'
  interviewerName?: string
  interviewType?: 'video' | 'phone' | 'in-person'
  zoomLink?: string
  location?: string
  notes?: string
}

const AdminInterviewsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<'scheduled' | 'done' | 'no-show'>('scheduled')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'done' | 'no-show'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isAuthorized) {
      fetchInterviews()
    }
  }, [isAuthorized])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const data = await interviewService.getAllInterviews()
      setInterviews(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error('Error fetching interviews:', error)
      addNotification('Failed to load interviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (interview: Interview, newSt: 'scheduled' | 'done' | 'no-show') => {
    setSelectedInterview(interview)
    setNewStatus(newSt)
    setShowStatusModal(true)
  }

  const confirmStatusUpdate = async () => {
    if (!selectedInterview) return

    setUpdatingStatus(true)
    try {
      await interviewService.updateInterviewStatus(
        selectedInterview._id || selectedInterview.id || '',
        newStatus
      )

      // Update local state
      setInterviews(
        interviews.map((iv) =>
          (iv._id === selectedInterview._id || iv.id === selectedInterview.id)
            ? { ...iv, status: newStatus }
            : iv
        )
      )

      addNotification(`Interview status updated to "${newStatus}"`, 'success')
      setShowStatusModal(false)
    } catch (error) {
      console.error('Error updating interview status:', error)
      addNotification('Failed to update interview status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Filter interviews
  const filteredInterviews = interviews.filter((interview) => {
    const matchesStatus = filterStatus === 'all' || interview.status === filterStatus
    const matchesSearch =
      searchTerm === '' ||
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Count by status
  const statusCounts = {
    scheduled: interviews.filter((i) => i.status === 'scheduled').length,
    done: interviews.filter((i) => i.status === 'done').length,
    ['no-show']: interviews.filter((i) => i.status === 'no-show').length,
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'no-show':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInterviewTypeIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return '📹'
      case 'phone':
        return '☎️'
      case 'in-person':
        return '👥'
      default:
        return '📞'
    }
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
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
        <h1 className="text-3xl font-bold mb-8">Interview Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Scheduled Interviews</p>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.scheduled}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600">{statusCounts.done}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">No-Shows</p>
            <p className="text-3xl font-bold text-red-600">{statusCounts['no-show']}</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            📅 Calendar View
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            📋 List View
          </Button>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <InterviewCalendar />
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Input
                  type="text"
                  placeholder="Search by candidate name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="done">Completed</option>
                  <option value="no-show">No-Show</option>
                </select>
              </div>

              <p className="text-sm text-gray-600">
                Showing {filteredInterviews.length} of {interviews.length} interviews
              </p>
            </div>

            {/* Table View */}
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📭</div>
                <p className="text-gray-600">No interviews found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Candidate</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterviews.map((interview) => (
                      <tr key={interview._id || interview.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{interview.candidateName}</p>
                            <p className="text-sm text-gray-600">{interview.candidateEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">{interview.jobTitle}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="font-semibold">{formatDate(interview.scheduledDate)}</p>
                            <p className="text-gray-600">{interview.scheduledTime}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xl">{getInterviewTypeIcon(interview.interviewType)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={interview.status}
                            onChange={(e) =>
                              handleStatusChange(
                                interview,
                                e.target.value as 'scheduled' | 'done' | 'no-show'
                              )
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${getStatusBadgeColor(
                              interview.status
                            )}`}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="done">Done</option>
                            <option value="no-show">No-Show</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {interview.zoomLink && (
                              <a
                                href={interview.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200"
                              >
                                Zoom
                              </a>
                            )}
                            <Button
                              onClick={() => setSelectedInterview(interview)}
                              variant="outline"
                              className="text-sm px-3 py-1"
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interview Details Modal */}
      {selectedInterview && !showStatusModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInterview(null)}
        >
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Interview Details</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Candidate</p>
                <p className="font-semibold text-gray-900">{selectedInterview.candidateName}</p>
                <p className="text-sm text-gray-600">{selectedInterview.candidateEmail}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-semibold text-gray-900">{selectedInterview.jobTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedInterview.scheduledDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold text-gray-900">{selectedInterview.scheduledTime}</p>
                </div>
              </div>

              {selectedInterview.interviewerName && (
                <div>
                  <p className="text-sm text-gray-600">Interviewer</p>
                  <p className="font-semibold text-gray-900">{selectedInterview.interviewerName}</p>
                </div>
              )}

              {selectedInterview.location && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{selectedInterview.location}</p>
                </div>
              )}

              {selectedInterview.zoomLink && (
                <div>
                  <p className="text-sm text-gray-600">Zoom Link</p>
                  <a
                    href={selectedInterview.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold break-all"
                  >
                    Join Meeting
                  </a>
                </div>
              )}

              {selectedInterview.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedInterview.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedInterview.status)}`}>
                  {selectedInterview.status}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setSelectedInterview(null)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Status Update Confirmation Modal */}
      {showStatusModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowStatusModal(false)}
        >
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Update Interview Status</h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Candidate</p>
              <p className="font-semibold text-gray-900 mb-4">{selectedInterview?.candidateName}</p>

              <p className="text-sm text-gray-600 mb-2">Change status to</p>
              <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(newStatus)}`}>
                {newStatus}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={confirmStatusUpdate}
                disabled={updatingStatus}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {updatingStatus ? 'Updating...' : '✓ Confirm'}
              </Button>
              <Button
                onClick={() => setShowStatusModal(false)}
                variant="outline"
                className="flex-1"
                disabled={updatingStatus}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default AdminInterviewsPage
