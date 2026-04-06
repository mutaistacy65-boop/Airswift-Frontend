import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { useSocket } from '@/hooks/useSocket'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import MpesaPaymentModal from '@/components/MpesaPaymentModal'
import Timeline from '@/components/Timeline'
import { jobService, JobApplication } from '@/services/jobService'
import { paymentService } from '@/services/paymentService'
import { PAYMENT_AMOUNTS } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import { useRouter } from 'next/router'

const ApplicationsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('user')
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const { subscribe } = useSocket()
  const router = useRouter()

  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  // Socket listeners for real-time updates
  useEffect(() => {
    // Listen for application status updates
    const unsubscribeStatus = subscribe('statusUpdate', (data: any) => {
      const updatedApplications = applications.map(app =>
        app.id === data.applicationId || app.id === data.id
          ? { ...app, status: data.status as any }
          : app
      )
      setApplications(updatedApplications)
      addNotification(`Status updated: ${data.status}`, 'success')
    })

    // Listen for interview scheduling updates
    const unsubscribeInterview = subscribe('interviewUpdate', (data: any) => {
      const updatedApplications = applications.map(app =>
        app.id === data.applicationId || app.id === data.id
          ? {
              ...app,
              status: 'Interview Scheduled' as any,
              interviewDetails: {
                zoomLink: data.zoomLink || '',
                scheduledDate: data.date || '',
                notes: data.notes || '',
              },
            }
          : app
      )
      setApplications(updatedApplications)
      addNotification(`Interview scheduled on ${formatDate(data.date)}`, 'info')
    })

    return () => {
      unsubscribeStatus()
      unsubscribeInterview()
    }
  }, [applications, subscribe, addNotification])

  useEffect(() => {
    if (isAuthorized && user?.id) {
      fetchApplications()
    }
  }, [isAuthorized, user?.id])

  const fetchApplications = async () => {
    try {
      const data = await jobService.getMyApplications(user?.id)
      setApplications(data)
    } catch (error) {
      addNotification('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'pending':
        return 'bg-yellow-100/50 text-yellow-700 border border-yellow-200'
      case 'Under Review':
      case 'reviewed':
        return 'bg-secondary/10 text-secondary border border-secondary/20'
      case 'Shortlisted':
      case 'accepted':
        return 'badge-success'
      case 'Interview Scheduled':
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-700 border border-purple-200'
      case 'Hired':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      case 'Rejected':
      case 'rejected':
        return 'badge-danger'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'pending':
        return 'Submitted'
      case 'Under Review':
      case 'reviewed':
        return 'Under Review'
      case 'Shortlisted':
      case 'accepted':
        return 'Shortlisted'
      case 'Interview Scheduled':
      case 'interview_scheduled':
        return 'Interview Scheduled'
      case 'Hired':
        return 'Hired'
      case 'Rejected':
      case 'rejected':
        return 'Not Selected'
      default:
        return status
    }
  }

  const handleInterviewPayment = async (phoneNumber: string) => {
    if (!selectedApplication) return

    setPaymentProcessing(true)
    try {
      const result = await paymentService.initiateMpesaPayment(
        phoneNumber,
        PAYMENT_AMOUNTS.INTERVIEW_FEE,
        `Interview fee for ${selectedApplication.jobId}`,
        'interview_fee'
      )

      addNotification('Interview fee payment initiated. Complete the payment on your phone.', 'success')
      setShowPaymentModal(false)
      setSelectedApplication(null)

      // Redirect to payment success page
      router.push(`/job-seeker/payment-success?transaction_id=${result.transactionId}&amount=${PAYMENT_AMOUNTS.INTERVIEW_FEE}&service=Interview Fee`)

      // Refresh applications to update status
      fetchApplications()
    } catch (error: any) {
      addNotification(error?.message || 'Failed to initiate payment', 'error')
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handleVisaPayment = async (phoneNumber: string) => {
    if (!selectedApplication) return

    setPaymentProcessing(true)
    try {
      const result = await paymentService.initiateMpesaPayment(
        phoneNumber,
        PAYMENT_AMOUNTS.VISA_PROCESSING,
        `Visa processing fee for ${selectedApplication.jobId}`,
        'visa_processing'
      )

      addNotification('Visa processing fee payment initiated. Complete the payment on your phone.', 'success')
      setShowPaymentModal(false)
      setSelectedApplication(null)

      // Redirect to payment success page
      router.push(`/job-seeker/payment-success?transaction_id=${result.transactionId}&amount=${PAYMENT_AMOUNTS.VISA_PROCESSING}&service=Visa Processing`)

      // Refresh applications to update status
      fetchApplications()
    } catch (error: any) {
      addNotification(error?.message || 'Failed to initiate payment', 'error')
    } finally {
      setPaymentProcessing(false)
    }
  }

  type TimelineStatus = 'completed' | 'current' | 'pending' | 'failed'
  type TimelineStepLocal = {
    id: string
    title: string
    description: string
    status: TimelineStatus
    date?: string
    action?: React.ReactNode
  }

  const generateTimelineSteps = (application: JobApplication) => {
    const inReview = ['Under Review', 'reviewed', 'Shortlisted', 'accepted', 'Interview Scheduled', 'interview_scheduled', 'Hired']
    const isShortlisted = ['Shortlisted', 'accepted', 'Interview Scheduled', 'interview_scheduled', 'Hired']
    const isInterviewScheduled = ['Interview Scheduled', 'interview_scheduled', 'Hired']
    const isHired = ['Hired']

    const steps: TimelineStepLocal[] = [
      {
        id: 'applied',
        title: 'Application Submitted',
        description: 'Your application has been received and is being reviewed by our team.',
        status: ['Submitted', 'pending', 'reviewed', 'accepted', 'Shortlisted', 'Interview Scheduled', 'interview_scheduled', 'Hired'].includes(application.status) ? 'completed' : 'current',
        date: formatDate(application.appliedDate),
      },
      {
        id: 'review',
        title: 'Under Review',
        description: 'Our hiring team is carefully reviewing your qualifications and experience.',
        status: inReview.includes(application.status) ? 'completed' : 'current',
      },
      {
        id: 'shortlisted',
        title: 'Shortlisted',
        description: 'Congratulations! You have been shortlisted for this position.',
        status: isShortlisted.includes(application.status) ? 'completed' : 'pending',
        action: ['Shortlisted', 'accepted'].includes(application.status) ? (
          <Button
            onClick={() => {
              setSelectedApplication(application)
              setShowPaymentModal(true)
            }}
            className="bg-green-600 hover:bg-green-700 text-sm"
          >
            Pay Interview Fee (3 KSH)
          </Button>
        ) : undefined,
      },
      {
        id: 'interview',
        title: 'Interview',
        description: 'Schedule and complete your interview with the hiring team.',
        status: isInterviewScheduled.includes(application.status) ? 'completed' : 'pending',
      },
      {
        id: 'outcome',
        title: 'Final Outcome',
        description:
          application.status === 'Hired'
            ? 'You have been hired. Congratulations!'
            : application.status === 'Rejected' || application.status === 'rejected'
            ? 'Your application was not successful.'
            : 'Await the final hiring decision.',
        status: isHired.includes(application.status)
          ? 'completed'
          : application.status === 'Rejected' || application.status === 'rejected'
          ? 'failed'
          : 'pending',
      },
    ]

    if (application.status === 'Rejected' || application.status === 'rejected') {
      steps[1].status = 'failed'
      steps[1].description = 'Unfortunately, your application was not successful at this time.'
    }

    return steps
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

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={['Shortlisted', 'accepted'].includes(selectedApplication?.status || '') ? handleInterviewPayment : handleVisaPayment}
        amount={['Shortlisted', 'accepted'].includes(selectedApplication?.status || '') ? PAYMENT_AMOUNTS.INTERVIEW_FEE : PAYMENT_AMOUNTS.VISA_PROCESSING}
        description={['Shortlisted', 'accepted'].includes(selectedApplication?.status || '') ? 'Interview fee' : 'Visa processing fee'}
        currency={['Shortlisted', 'accepted'].includes(selectedApplication?.status || '') ? 'USD' : 'KES'}
      />

      <div>
        <h1 className="text-3xl font-bold mb-8">Application Timeline</h1>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h2>
            <p className="text-gray-600 mb-6">You haven't applied for any jobs yet. Start browsing and apply for positions that interest you.</p>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Job Application #{application.id.slice(-8)}
                  </h2>
                  <p className="text-gray-600">Applied on {formatDate(application.appliedDate)}</p>
                </div>

                <Timeline steps={generateTimelineSteps(application)} />

                {/* Status-specific messages */}
                {application.status === 'rejected' && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-800">
                      <strong>Application Status: Not Successful</strong>
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      We appreciate your interest. Unfortunately, we won't be proceeding with your application at this time.
                      We encourage you to apply for other suitable positions.
                    </p>
                  </div>
                )}

                {application.status === 'visa_ready' && (
                  <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded p-4">
                    <p className="text-emerald-800">
                      <strong>🎉 Visa Ready!</strong> Your visa has been processed successfully. Check your email for collection details.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ApplicationsPage
