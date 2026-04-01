import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'
import MpesaPaymentModal from '@/components/MpesaPaymentModal'
import { jobService } from '@/services/jobService'
import { paymentService } from '@/services/paymentService'
import { PAYMENT_AMOUNTS } from '@/utils/constants'
import { useNotification } from '@/context/NotificationContext'

const JobSeekerDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('job_seeker')
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0 })
  const [showMpesaModal, setShowMpesaModal] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [interviewFeePaid, setInterviewFeePaid] = useState(false)


  useEffect(() => {
    if (isAuthorized) {
      fetchStats()
    }
  }, [isAuthorized])

  const fetchStats = async () => {
    try {
      const data = await jobService.getMyApplications()
      setStats({
        applications: data.length,
        interviews: data.filter((app: any) => app.status === 'accepted').length,
        offers: 0,
      })
    } catch (error) {
      console.error('Failed to load stats', error)
    }
  }

  const handleInterviewPayment = async (phoneNumber: string) => {
    setPaymentProcessing(true)
    try {
      await paymentService.initiateMpesaPayment(
        phoneNumber,
        PAYMENT_AMOUNTS.INTERVIEW_FEE,
        'Interview fee for shortlisted candidate',
        'interview_fee'
      )
      addNotification(
        'M-Pesa STK push sent. Complete payment using your Safaricom PIN on your phone.',
        'success'
      )
      setInterviewFeePaid(true)
      setShowMpesaModal(false)
    } catch (error: any) {
      addNotification(error?.message || 'Failed to initiate M-Pesa payment', 'error')
    } finally {
      setPaymentProcessing(false)
    }
  }


  if (isLoading) {
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
        isOpen={showMpesaModal}
        onClose={() => setShowMpesaModal(false)}
        onConfirm={handleInterviewPayment}
        amount={PAYMENT_AMOUNTS.INTERVIEW_FEE}
        description="Interview fee payment"
      />
      <div>
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}!</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Total Applications</p>
            <p className="text-4xl font-bold text-primary">{stats.applications}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Interviews Scheduled</p>
            <p className="text-4xl font-bold text-secondary">{stats.interviews}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Offers Received</p>
            <p className="text-4xl font-bold text-accent">{stats.offers}</p>
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/jobs"
              className="bg-primary text-white px-6 py-3 rounded hover:bg-opacity-90 text-center"
            >
              Browse Jobs
            </Link>
            <Link
              href="/job-seeker/profile"
              className="bg-secondary text-white px-6 py-3 rounded hover:bg-opacity-90 text-center"
            >
              Update Profile
            </Link>
          </div>

          {stats.interviews > 0 && !interviewFeePaid && (
            <div className="mt-6">
              <p className="text-gray-700 mb-2">You are shortlisted and scheduled for interview. Proceed with payment to confirm.</p>
              <button
                onClick={() => setShowMpesaModal(true)}
                className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
                disabled={paymentProcessing}
              >
                {paymentProcessing ? 'Processing...' : 'Pay interview fee (3 KSH) via M-Pesa'}
              </button>
            </div>
          )}

          {interviewFeePaid && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">Interview fee paid successfully. You may proceed with your next steps.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default JobSeekerDashboard