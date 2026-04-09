export const dynamic = "force-dynamic"

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
import Textarea from '@/components/Textarea'
import { adminService } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'
import { Calendar, Clock, User, MapPin, Video, Phone, Plus, Filter, Search } from 'lucide-react'

interface Interview {
  _id: string
  id?: string
  applicationId: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled'
  interviewerName?: string
  interviewType?: 'HR' | 'Technical' | 'Final'
  mode?: 'online' | 'in-person' | 'phone'
  zoomLink?: string
  location?: string
  notes?: string
  duration?: number
}

const AdminInterviewsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    noShow: 0,
    cancelled: 0,
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [newStatus, setNewStatus] = useState<'scheduled' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled'>('scheduled')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [scheduling, setScheduling] = useState(false)

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    candidateName: '',
    candidateEmail: '',
    jobTitle: '',
    interviewerName: '',
    scheduledDate: '',
    scheduledTime: '',
    interviewType: 'HR' as 'HR' | 'Technical' | 'Final',
    mode: 'online' as 'online' | 'in-person' | 'phone',
    location: '',
    zoomLink: '',
    notes: ''
  })

  useEffect(() => {
    if (isAuthorized) {
      fetchInterviews()
      fetchStats()
    }
  }, [isAuthorized])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const response = await adminService.getInterviews({
        page: 1,
        limit: 100,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        candidateName: searchTerm || undefined,
        dateFrom: dateFilter || undefined
      })
      setInterviews(response.interviews || [])
    } catch (error) {
      console.error('Error fetching interviews:', error)
      addNotification('Failed to load interviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await adminService.getInterviewStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching interview stats:', error)
    }
  }

  const handleStatusChange = async (interview: Interview, newSt: 'scheduled' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled') => {
    setSelectedInterview(interview)
    setNewStatus(newSt)
    setShowStatusModal(true)
  }

  const confirmStatusUpdate = async () => {
    if (!selectedInterview) return

    setUpdatingStatus(true)
    try {
      await adminService.updateInterviewStatus(
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
      fetchStats() // Refresh stats
    } catch (error) {
      console.error('Error updating interview status:', error)
      addNotification('Failed to update interview status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!scheduleForm.candidateName || !scheduleForm.candidateEmail || !scheduleForm.jobTitle ||
        !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    setScheduling(true)
    try {
      const interviewData = {
        candidateName: scheduleForm.candidateName,
        candidateEmail: scheduleForm.candidateEmail,
        jobTitle: scheduleForm.jobTitle,
        interviewerName: scheduleForm.interviewerName,
        scheduledDate: scheduleForm.scheduledDate,
        scheduledTime: scheduleForm.scheduledTime,
        interviewType: scheduleForm.interviewType,
        mode: scheduleForm.mode,
        location: scheduleForm.location,
        zoomLink: scheduleForm.zoomLink,
        notes: scheduleForm.notes
      }

      await adminService.scheduleInterview(interviewData)
      addNotification('Interview scheduled successfully', 'success')
      setShowScheduleModal(false)
      setScheduleForm({
        candidateName: '',
        candidateEmail: '',
        jobTitle: '',
        interviewerName: '',
        scheduledDate: '',
        scheduledTime: '',
        interviewType: 'HR',
        mode: 'online',
        location: '',
        zoomLink: '',
        notes: ''
      })
      fetchInterviews()
      fetchStats()
    } catch (error: any) {
      console.error('Error scheduling interview:', error)
      addNotification(error?.message || 'Failed to schedule interview', 'error')
    } finally {
      setScheduling(false)
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'no-show':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInterviewTypeIcon = (type?: string) => {
    switch (type) {
      case 'HR':
        return '👥'
      case 'Technical':
        return '💻'
      case 'Final':
        return '🏆'
      default:
        return '📞'
    }
  }

  const getModeIcon = (mode?: string) => {
    switch (mode) {
      case 'online':
        return '💻'
      case 'in-person':
        return '🏢'
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Scheduled Interviews</p>
            <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">No-Shows</p>
            <p className="text-3xl font-bold text-red-600">{stats.noShow}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Conversion Rate</p>
            <p className="text-3xl font-bold text-purple-600">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex gap-4 mb-6 justify-between items-center">
          <div className="flex gap-4">
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
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus size={16} className="mr-2" />
            Schedule Interview
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
                <div className="flex-1 min-w-[200px]">
                  <Input
                    type="text"
                    placeholder="Search by candidate name, email, or job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="no-show">No-Show</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Filter by date"
                />
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Interviewer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type/Mode</th>
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
                          <p className="text-gray-900">{interview.interviewerName || 'Not assigned'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="font-semibold">{formatDate(interview.scheduledDate)}</p>
                            <p className="text-gray-600">{interview.scheduledTime}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-center">
                            <div className="text-lg">{getInterviewTypeIcon(interview.interviewType)}</div>
                            <div className="text-xs text-gray-500 mt-1">{getModeIcon(interview.mode)}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={interview.status}
                            onChange={(e) =>
                              handleStatusChange(
                                interview,
                                e.target.value as 'scheduled' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled'
                              )
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${getStatusBadgeColor(
                              interview.status
                            )}`}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="no-show">No-Show</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rescheduled">Rescheduled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {interview.zoomLink && interview.mode === 'online' && (
                              <a
                                href={interview.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200"
                              >
                                Join
                              </a>
                            )}
                            <Button
                              onClick={() => {
                                setSelectedInterview(interview)
                                setShowDetailModal(true)
                              }}
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
      {selectedInterview && showDetailModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedInterview(null)
            setShowDetailModal(false)
          }}
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
              onClick={() => {
                setSelectedInterview(null)
                setShowDetailModal(false)
              }}
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

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowScheduleModal(false)
            setScheduleForm({
              candidateName: '',
              candidateEmail: '',
              jobTitle: '',
              interviewerName: '',
              scheduledDate: '',
              scheduledTime: '',
              interviewType: 'HR',
              mode: 'online',
              location: '',
              zoomLink: '',
              notes: ''
            })
          }}
        >
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Schedule New Interview</h2>

            <form onSubmit={handleScheduleInterview} className="space-y-6">
              {/* Candidate Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Candidate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Candidate Name"
                    value={scheduleForm.candidateName}
                    onChange={(e) => setScheduleForm({...scheduleForm, candidateName: e.target.value})}
                    required
                  />
                  <Input
                    label="Candidate Email"
                    type="email"
                    value={scheduleForm.candidateEmail}
                    onChange={(e) => setScheduleForm({...scheduleForm, candidateEmail: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Job Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Job Information</h3>
                <Input
                  label="Job Title"
                  value={scheduleForm.jobTitle}
                  onChange={(e) => setScheduleForm({...scheduleForm, jobTitle: e.target.value})}
                  required
                />
              </div>

              {/* Interview Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Interview Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interviewer Name</label>
                    <Input
                      value={scheduleForm.interviewerName}
                      onChange={(e) => setScheduleForm({...scheduleForm, interviewerName: e.target.value})}
                      placeholder="Enter interviewer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                    <select
                      value={scheduleForm.interviewType}
                      onChange={(e) => setScheduleForm({...scheduleForm, interviewType: e.target.value as 'HR' | 'Technical' | 'Final'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="HR">HR Interview</option>
                      <option value="Technical">Technical Interview</option>
                      <option value="Final">Final Interview</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                    <select
                      value={scheduleForm.mode}
                      onChange={(e) => setScheduleForm({...scheduleForm, mode: e.target.value as 'online' | 'in-person' | 'phone'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
                      placeholder="Office address or meeting room"
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Scheduling</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                    required
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Online Meeting Details */}
              {scheduleForm.mode === 'online' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Online Meeting Details</h3>
                  <Input
                    label="Zoom/Meeting Link"
                    type="url"
                    value={scheduleForm.zoomLink}
                    onChange={(e) => setScheduleForm({...scheduleForm, zoomLink: e.target.value})}
                    placeholder="https://zoom.us/..."
                  />
                </div>
              )}

              {/* Notes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Additional Notes</h3>
                <Textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                  placeholder="Any special instructions or notes for the interview..."
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={scheduling}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {scheduling ? 'Scheduling...' : '✓ Schedule Interview'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false)
                    setScheduleForm({
                      candidateName: '',
                      candidateEmail: '',
                      jobTitle: '',
                      interviewerName: '',
                      scheduledDate: '',
                      scheduledTime: '',
                      interviewType: 'HR',
                      mode: 'online',
                      location: '',
                      zoomLink: '',
                      notes: ''
                    })
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={scheduling}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default AdminInterviewsPage
