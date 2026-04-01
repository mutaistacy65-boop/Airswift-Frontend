import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Textarea from '@/components/Textarea'
import { jobService, JobApplication } from '@/services/jobService'
import { formatDate } from '@/utils/helpers'

const AdminInterviewsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [completing, setCompleting] = useState(false)

  // Reschedule form
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newZoomLink, setNewZoomLink] = useState('')
  const [rescheduleNotes, setRescheduleNotes] = useState('')
  const [rescheduling, setRescheduling] = useState(false)

  useEffect(() => {
    if (isAuthorized) {
      fetchInterviews()
    }
  }, [isAuthorized])

  const fetchInterviews = async () => {
    try {
      // This would typically call an admin API to get all applications with interviews
      // For now, we'll simulate with sample data
      const sampleApplications: JobApplication[] = [
        {
          id: '1',
          jobId: 'job-001',
          userId: 'user-001',
          resumeUrl: '/resumes/sample.pdf',
          coverLetter: 'I am very interested in this position...',
          appliedDate: '2026-04-01',
          status: 'interview_scheduled',
          interviewDetails: {
            zoomLink: 'https://zoom.us/j/123456789',
            scheduledDate: '2026-04-05 14:00',
            notes: 'Technical interview for software developer position'
          }
        },
        {
          id: '2',
          jobId: 'job-002',
          userId: 'user-002',
          resumeUrl: '/resumes/sample2.pdf',
          coverLetter: 'I have extensive experience...',
          appliedDate: '2026-03-28',
          status: 'interview_completed',
          interviewDetails: {
            zoomLink: 'https://zoom.us/j/987654321',
            scheduledDate: '2026-04-02 10:00',
            notes: 'Completed successfully - strong candidate'
          }
        },
        {
          id: '3',
          jobId: 'job-003',
          userId: 'user-003',
          resumeUrl: '/resumes/sample3.pdf',
          coverLetter: 'Housekeeping experience...',
          appliedDate: '2026-03-30',
          status: 'interview_scheduled',
          interviewDetails: {
            zoomLink: 'https://zoom.us/j/555666777',
            scheduledDate: '2026-04-06 16:00',
            notes: 'Housekeeping position interview'
          }
        }
      ]
      setApplications(sampleApplications)
    } catch (error) {
      addNotification('Failed to load interviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = (application: JobApplication) => {
    setSelectedApplication(application)
    setCompletionNotes('')
    setShowCompleteModal(true)
  }

  const handleReschedule = (application: JobApplication) => {
    setSelectedApplication(application)
    setNewDate('')
    setNewTime('')
    setNewZoomLink(application.interviewDetails?.zoomLink || '')
    setRescheduleNotes('')
    setShowRescheduleModal(true)
  }

  const submitCompletion = async () => {
    if (!selectedApplication) return

    setCompleting(true)
    try {
      // Here you would call an API to mark the interview as completed
      await updateApplicationStatus(selectedApplication.id, 'interview_completed', completionNotes)

      addNotification('Interview marked as completed!', 'success')
      setShowCompleteModal(false)
      fetchInterviews() // Refresh the list
    } catch (error) {
      addNotification('Failed to update interview status', 'error')
    } finally {
      setCompleting(false)
    }
  }

  const submitReschedule = async () => {
    if (!selectedApplication || !newDate || !newTime || !newZoomLink) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    setRescheduling(true)
    try {
      // Here you would call an API to reschedule the interview
      const newInterviewDetails = {
        scheduledDate: `${newDate} ${newTime}`,
        zoomLink: newZoomLink,
        notes: rescheduleNotes || selectedApplication.interviewDetails?.notes
      }

      // Update the interview details
      console.log('Rescheduling interview for application', selectedApplication.id, newInterviewDetails)

      addNotification('Interview rescheduled successfully!', 'success')
      setShowRescheduleModal(false)
      fetchInterviews() // Refresh the list
    } catch (error) {
      addNotification('Failed to reschedule interview', 'error')
    } finally {
      setRescheduling(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, notes: string) => {
    // This would call an API to update the application status
    console.log('Updating application', applicationId, 'to status', status, 'with notes', notes)
  }

  const getJobTypeFromId = (jobId: string) => {
    // This would typically fetch job details, but for now we'll simulate
    const jobTypes: {[key: string]: string} = {
      'job-001': 'Software Developer',
      'job-002': 'Project Manager',
      'job-003': 'Housekeeper'
    }
    return jobTypes[jobId] || 'Unknown Position'
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

  const upcomingInterviews = applications.filter(app => app.status === 'interview_scheduled')
  const completedInterviews = applications.filter(app => app.status === 'interview_completed')

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      {/* Mark Completed Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={submitCompletion}
        confirmText={completing ? 'Marking Completed...' : 'Mark as Completed'}
        title="Mark Interview as Completed"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to mark this interview as completed? This will move the candidate to the next stage of the process.
          </p>
          <Textarea
            label="Completion Notes (Optional)"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={3}
            placeholder="Any notes about the interview outcome, candidate performance, etc..."
          />
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={submitReschedule}
        confirmText={rescheduling ? 'Rescheduling...' : 'Reschedule Interview'}
        title="Reschedule Interview"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">New Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">New Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Zoom Link</label>
            <input
              type="url"
              value={newZoomLink}
              onChange={(e) => setNewZoomLink(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://zoom.us/j/..."
              required
            />
          </div>
          <Textarea
            label="Reschedule Notes (Optional)"
            value={rescheduleNotes}
            onChange={(e) => setRescheduleNotes(e.target.value)}
            rows={3}
            placeholder="Reason for rescheduling, new instructions, etc..."
          />
        </div>
      </Modal>

      <div>
        <h1 className="text-3xl font-bold mb-8">Manage Interviews</h1>

        {/* Upcoming Interviews */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Upcoming Interviews</h2>

          {upcomingInterviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📅</div>
              <p className="text-gray-600">No upcoming interviews scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingInterviews.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {getJobTypeFromId(application.jobId)}
                      </h3>
                      <p className="text-gray-600">
                        Applicant: {application.userId} | Scheduled: {application.interviewDetails?.scheduledDate}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Scheduled
                    </span>
                  </div>

                  {application.interviewDetails?.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Interview Notes:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">
                        {application.interviewDetails.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {application.interviewDetails?.zoomLink && (
                      <a href={application.interviewDetails.zoomLink} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Join Zoom Meeting
                        </Button>
                      </a>
                    )}
                    <Button
                      onClick={() => handleMarkCompleted(application)}
                      variant="outline"
                    >
                      Mark Completed
                    </Button>
                    <Button
                      onClick={() => handleReschedule(application)}
                      variant="outline"
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Interviews */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Completed Interviews</h2>

          {completedInterviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">✅</div>
              <p className="text-gray-600">No completed interviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedInterviews.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {getJobTypeFromId(application.jobId)}
                      </h3>
                      <p className="text-gray-600">
                        Applicant: {application.userId} | Completed: {application.interviewDetails?.scheduledDate}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  </div>

                  {application.interviewDetails?.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Interview Notes:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">
                        {application.interviewDetails.notes}
                      </p>
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-green-800">
                      <strong>Interview completed successfully.</strong> The candidate has been moved to the next stage of the application process.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminInterviewsPage
