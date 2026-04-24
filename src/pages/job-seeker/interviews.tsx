import React, { useState, useEffect } from 'react'
import UserLayout from '@/layouts/UserLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import VoiceInterview from '@/components/VoiceInterview'
import API from '@/services/apiClient'
import { interviewService } from '@/services/interviewService'
import { formatDate } from '@/utils/helpers'

const InterviewsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('user')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [voiceInterviewOpen, setVoiceInterviewOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)

  useEffect(() => {
    if (isAuthorized) {
      fetchApplications()
    }
  }, [isAuthorized])

  const fetchApplications = async () => {
    try {
      const response = await API.get('/interviews/my')
      setApplications(response.data.interviews)
    } catch (error) {
      addNotification('Failed to load interviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinInterview = (zoomLink: string) => {
    if (zoomLink) {
      window.open(zoomLink, '_blank')
    } else {
      addNotification('Zoom link not available yet', 'error')
    }
  }

  const handleMarkCompleted = async (applicationId: string) => {
    try {
      // This would typically be an API call to update the application status
      // For now, we'll just show a notification
      addNotification('Interview marked as completed. Awaiting further instructions.', 'success')
      fetchApplications() // Refresh the data
    } catch (error) {
      addNotification('Failed to update interview status', 'error')
    }
  }

  const handleStartVoiceInterview = (application: any) => {
    setSelectedApplication(application)
    setVoiceInterviewOpen(true)
  }

  const handleVoiceInterviewComplete = async (results: any) => {
    try {
      if (selectedApplication) {
        // Submit interview results
        await interviewService.submitInterviewFeedback(selectedApplication.id, results)
        addNotification('Voice interview completed successfully!', 'success')
        fetchApplications() // Refresh the data
      }
    } catch (error) {
      addNotification('Failed to save interview results', 'error')
    } finally {
      setVoiceInterviewOpen(false)
      setSelectedApplication(null)
    }
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/job-seeker/dashboard', icon: '📊' },
    { label: 'My Applications', href: '/job-seeker/applications', icon: '📋' },
    { label: 'Interviews', href: '/job-seeker/interviews', icon: '📞' },
    { label: 'Profile', href: '/job-seeker/profile', icon: '👤' },
  ]

  const upcomingInterviews = applications.filter(app => app.status === 'interview_scheduled')
  const completedInterviews = applications.filter(app => app.status === 'interview_completed')
  const pendingInterviews = applications.filter(app => app.status === 'accepted')

  return (
    <UserLayout sidebarItems={sidebarItems}>
      <div>
        <h1 className="text-3xl font-bold mb-8">My Interviews</h1>

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
                        Interview for Job #{application.jobId.slice(-8)}
                      </h3>
                      <p className="text-gray-600">
                        Scheduled: {application.interviewDetails?.scheduledDate || 'Date TBD'}
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

                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={() => handleJoinInterview(application.interviewDetails?.zoomLink || '')}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!application.interviewDetails?.zoomLink}
                    >
                      {application.interviewDetails?.zoomLink ? 'Join Zoom Meeting' : 'Link Not Available'}
                    </Button>
                    <Button
                      onClick={() => handleMarkCompleted(application.id)}
                      variant="outline"
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      onClick={() => window.location.href = `/job-seeker/reschedule?id=${application.id}&application=${application.id}`}
                      variant="outline"
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      📅 Reschedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Interview Scheduling */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Awaiting Interview Schedule</h2>

          {pendingInterviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">⏳</div>
              <p className="text-gray-600">No interviews awaiting scheduling</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInterviews.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Job Application #{application.jobId.slice(-8)}
                      </h3>
                      <p className="text-gray-600">
                        Shortlisted - Awaiting interview scheduling
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Shortlisted
                    </span>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-yellow-800 mb-3">
                      <strong>Great news!</strong> You've been shortlisted for this position.
                      You can now proceed with an AI-powered voice interview.
                    </p>
                    <Button
                      onClick={() => handleStartVoiceInterview(application)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      🎤 Start AI Voice Interview
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
                        Interview for Job #{application.jobId.slice(-8)}
                      </h3>
                      <p className="text-gray-600">
                        Completed: {application.interviewDetails?.scheduledDate || 'Recently'}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-green-800">
                      <strong>Interview completed successfully!</strong> Our team is reviewing your performance.
                      You'll receive an update on the next steps soon.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Interview Modal */}
      {selectedApplication && (
        <VoiceInterview
          isOpen={voiceInterviewOpen}
          onClose={() => {
            setVoiceInterviewOpen(false)
            setSelectedApplication(null)
          }}
          jobRole="Software Engineer"
          candidateName={user?.name || 'Candidate'}
          onComplete={handleVoiceInterviewComplete}
        />
      )}
    </UserLayout>
  )
}

export default InterviewsPage
