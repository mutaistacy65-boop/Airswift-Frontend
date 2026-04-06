import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { interviewService } from '@/services/interviewService'
import { emailService } from '@/services/emailService'
import { formatDate } from '@/utils/helpers'

interface Interview {
  _id: string
  id?: string
  applicationId: string
  candidateName?: string
  candidateEmail?: string
  jobTitle: string
  scheduledDate: string
  scheduledTime: string
  interviewerName?: string
  zoomLink?: string
  status: string
}

const RescheduleInterviewPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthorized, isLoading } = useProtectedRoute('user')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const interviewId = searchParams.get('id')
  const applicationId = searchParams.get('application')

  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [rescheduling, setRescheduling] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Form state
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isAuthorized && interviewId) {
      fetchInterviewDetails()
    }
  }, [isAuthorized, interviewId])

  const fetchInterviewDetails = async () => {
    try {
      if (!interviewId) {
        addNotification('Interview ID not found', 'error')
        setLoading(false)
        return
      }

      const data = await interviewService.getInterviewDetails(interviewId)
      setInterview(data)
    } catch (error) {
      console.error('Error fetching interview:', error)
      addNotification('Failed to load interview details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!newDate) {
      newErrors.newDate = 'Please select a new date'
    } else {
      const selectedDate = new Date(newDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.newDate = 'Please select a future date'
      }
    }

    if (!newTime) {
      newErrors.newTime = 'Please select a new time'
    } else {
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(newTime)) {
        newErrors.newTime = 'Please enter a valid time (HH:MM)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleReschedule = async () => {
    if (!validateForm()) {
      return
    }

    if (!interview) return

    setRescheduling(true)
    try {
      // Call reschedule API
      await interviewService.rescheduleInterview(
        interview._id || interview.id || interviewId || '',
        newDate,
        newTime
      )

      // Send confirmation email to candidate
      try {
        await emailService.sendRescheduleConfirmation(
          interview.candidateName || user?.name || 'Candidate',
          interview.candidateEmail || user?.email || '',
          interview.jobTitle,
          newDate,
          newTime,
          interview.zoomLink,
          interview.interviewerName,
          'Airswift'
        )
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't fail the reschedule if email fails
      }

      addNotification('Interview rescheduled successfully!', 'success')
      setShowConfirmation(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/job-seeker/interviews')
      }, 2000)
    } catch (error) {
      console.error('Error rescheduling interview:', error)
      addNotification('Failed to reschedule interview. Please try again.', 'error')
    } finally {
      setRescheduling(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  if (!interview) {
    return (
      <DashboardLayout sidebarItems={[]}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Interview Not Found</h1>
            <p className="text-gray-600 mb-6">The interview you're trying to reschedule doesn't exist.</p>
            <Button
              onClick={() => router.push('/job-seeker/interviews')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Interviews
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/job-seeker/dashboard', icon: '📊' },
    { label: 'My Applications', href: '/job-seeker/applications', icon: '📋' },
    { label: 'Interviews', href: '/job-seeker/interviews', icon: '📞' },
    { label: 'Profile', href: '/job-seeker/profile', icon: '👤' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Reschedule Interview</h1>

        {/* Current Interview Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Interview Details</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Job Position</p>
              <p className="font-semibold text-gray-900">{interview.jobTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interviewer</p>
              <p className="font-semibold text-gray-900">{interview.interviewerName || 'Not assigned'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Scheduled Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(interview.scheduledDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled Time</p>
              <p className="font-semibold text-gray-900">{interview.scheduledTime}</p>
            </div>
          </div>

          {interview.zoomLink && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Meeting Link</p>
              <a href={interview.zoomLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                {interview.zoomLink}
              </a>
            </div>
          )}
        </div>

        {/* Reschedule Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Select New Date and Time</h2>

          <div className="space-y-6">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Interview Date *
              </label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value)
                  if (errors.newDate) {
                    setErrors({ ...errors, newDate: '' })
                  }
                }}
                min={getMinDate()}
                className={errors.newDate ? 'border-red-500' : ''}
              />
              {errors.newDate && (
                <p className="text-red-500 text-sm mt-1">{errors.newDate}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Please select a date at least 1 day in advance</p>
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Interview Time *
              </label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => {
                  setNewTime(e.target.value)
                  if (errors.newTime) {
                    setErrors({ ...errors, newTime: '' })
                  }
                }}
                className={errors.newTime ? 'border-red-500' : ''}
              />
              {errors.newTime && (
                <p className="text-red-500 text-sm mt-1">{errors.newTime}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Business hours: 09:00 AM - 05:00 PM</p>
            </div>

            {/* Reason (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rescheduling (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please let us know why you need to reschedule..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Once you submit this request, our team will review and confirm the new interview date. You'll receive an email confirmation with the updated details.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {rescheduling ? 'Submitting...' : '✓ Reschedule Interview'}
              </Button>
              <Button
                onClick={() => router.push('/job-seeker/interviews')}
                variant="outline"
                className="flex-1"
                disabled={rescheduling}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showConfirmation && (
        <Modal isOpen={true}>
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Rescheduled!</h2>
            <p className="text-gray-600 mb-6">
              Your interview has been rescheduled to <strong>{formatDate(newDate)} at {newTime}</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to your inbox. You'll be redirected shortly.
            </p>
            <Button
              onClick={() => router.push('/job-seeker/interviews')}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Interviews
            </Button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default RescheduleInterviewPage
