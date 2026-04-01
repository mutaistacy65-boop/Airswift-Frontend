import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import MpesaPaymentModal from '@/components/MpesaPaymentModal'
import { jobService, JobApplication } from '@/services/jobService'
import { paymentService } from '@/services/paymentService'
import { PAYMENT_AMOUNTS } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'

const ApplicationsPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('job_seeker')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  useEffect(() => {
    if (isAuthorized) {
      fetchApplications()
    }
  }, [isAuthorized])

  const fetchApplications = async () => {
    try {
      const data = await jobService.getMyApplications()
      setApplications(data)
    } catch (error) {
      addNotification('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Under Review'
      case 'reviewed': return 'In Review'
      case 'accepted': return 'Shortlisted'
      case 'rejected': return 'Not Selected'
      default: return status
    }
  }

  const handleInterviewPayment = async (phoneNumber: string) => {
    if (!selectedApplication) return

    setPaymentProcessing(true)
    try {
      await paymentService.initiateMpesaPayment(
        phoneNumber,
        PAYMENT_AMOUNTS.INTERVIEW_FEE,
        `Interview fee for ${selectedApplication.jobId}`,
        'interview_fee'
      )

      addNotification('Interview fee payment initiated. Complete the payment on your phone.', 'success')
      setShowPaymentModal(false)
      setSelectedApplication(null)

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
      await paymentService.initiateMpesaPayment(
        phoneNumber,
        PAYMENT_AMOUNTS.VISA_PROCESSING,
        `Visa processing fee for ${selectedApplication.jobId}`,
        'visa_processing'
      )

      addNotification('Visa processing fee payment initiated. Complete the payment on your phone.', 'success')
      setShowPaymentModal(false)
      setSelectedApplication(null)

      // Refresh applications to update status
      fetchApplications()
    } catch (error: any) {
      addNotification(error?.message || 'Failed to initiate payment', 'error')
    } finally {
      setPaymentProcessing(false)
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

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={selectedApplication?.status === 'accepted' ? handleInterviewPayment : handleVisaPayment}
        amount={selectedApplication?.status === 'accepted' ? PAYMENT_AMOUNTS.INTERVIEW_FEE : PAYMENT_AMOUNTS.VISA_PROCESSING}
        description={selectedApplication?.status === 'accepted' ? 'Interview fee' : 'Visa processing fee'}
      />

      <div>
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

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
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Job Application #{application.id.slice(-8)}
                    </h3>
                    <p className="text-gray-600">Applied on {formatDate(application.appliedDate)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Job ID</p>
                    <p className="font-medium">{application.jobId}</p>
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
                      {application.coverLetter.length > 200
                        ? `${application.coverLetter.slice(0, 200)}...`
                        : application.coverLetter
                      }
                    </p>
                  </div>
                )}

                {/* Status-specific actions */}
                <div className="border-t pt-4">
                  {application.status === 'pending' && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-blue-800">
                        <strong>Your application is under review.</strong> We'll notify you once there's an update on your status.
                      </p>
                    </div>
                  )}

                  {application.status === 'reviewed' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <p className="text-yellow-800">
                        <strong>Your application is being reviewed.</strong> The hiring team is currently evaluating your qualifications.
                      </p>
                    </div>
                  )}

                  {application.status === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-green-800 mb-2">
                            <strong>Congratulations! You've been shortlisted.</strong>
                          </p>
                          <p className="text-green-700 text-sm">
                            Proceed with the interview fee payment to schedule your Zoom interview.
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedApplication(application)
                            setShowPaymentModal(true)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Pay Interview Fee (3 KSH)
                        </Button>
                      </div>
                    </div>
                  )}

                  {application.status === 'interview_scheduled' && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-4">
                      <p className="text-purple-800">
                        <strong>Interview Scheduled!</strong> Check your email for Zoom meeting details and date/time.
                      </p>
                    </div>
                  )}

                  {application.status === 'interview_completed' && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-indigo-800 mb-2">
                            <strong>Interview Completed!</strong>
                          </p>
                          <p className="text-indigo-700 text-sm">
                            Congratulations! You've successfully completed your interview. Proceed with visa processing payment.
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedApplication(application)
                            setShowPaymentModal(true)
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Pay Visa Fee (30,000 KSH)
                        </Button>
                      </div>
                    </div>
                  )}

                  {application.status === 'visa_payment_pending' && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-4">
                      <p className="text-orange-800">
                        <strong>Visa payment initiated.</strong> Complete the payment on your phone to proceed with visa processing.
                      </p>
                    </div>
                  )}

                  {application.status === 'visa_processing' && (
                    <div className="bg-teal-50 border border-teal-200 rounded p-4">
                      <p className="text-teal-800">
                        <strong>Visa processing in progress.</strong> We'll notify you once your visa is ready.
                      </p>
                    </div>
                  )}

                  {application.status === 'visa_ready' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-4">
                      <p className="text-emerald-800">
                        <strong>Visa Ready!</strong> Your visa has been processed successfully. Check your email for collection details.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                      <p className="text-red-800">
                        <strong>Application Not Successful</strong>
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        We appreciate your interest. Unfortunately, we won't be proceeding with your application at this time.
                        We encourage you to apply for other suitable positions.
                      </p>
                    </div>
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

export default ApplicationsPage
