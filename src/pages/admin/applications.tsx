
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import ApplicationPipeline from '@/components/ApplicationPipeline'
import { adminService } from '@/services/adminService'
import { emailService } from '@/services/emailService'
import { cvService, CVScore } from '@/services/cvService'
import { useSocket } from '@/hooks/useSocket'
import { formatDate } from '@/utils/helpers'
import { Eye, Mail, Send, FileText, BarChart3, Trash2 } from 'lucide-react'

// Force server-side rendering for admin pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Application {
  _id: string
  id?: string
  fullName: string
  email: string
  phone?: string
  jobId: { title: string; _id: string } | string
  status:
    | 'Submitted'
    | 'Under Review'
    | 'Shortlisted'
    | 'Interview Scheduled'
    | 'Hired'
    | 'Rejected'
    | 'rejected'
    | 'pending'
    | 'reviewed'
    | 'shortlisted'
    | 'accepted'
    | 'interview-scheduled'
  cv?: string
  coverLetter?: string
  qualifications?: string[]
  experience?: string
  cvScore?: number
  aiScore?: number
  notes?: string
  interviewId?: string | null
  jobTitle?: string
  jobLocation?: string
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  documentsVerified?: boolean
  documents?: {
    passport?: string
    nationalId?: string
    certificates?: string[]
    verified?: boolean
  }
  createdAt: string
  updatedAt?: string
}

const AdminApplicationsPage = () => {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()
  const { subscribe, isConnected } = useSocket()

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('pipeline')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [updating, setUpdating] = useState(false)

  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [cvScore, setCvScore] = useState<CVScore | null>(null)

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

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/unauthorized')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchApplications()
    }
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    // Listen for new applications
    const unsubscribeNewApp = subscribe('newApplication', (data: any) => {
      const newApp: Application = {
        _id: data._id || data.id,
        id: data._id || data.id,
        fullName: data.applicantName || data.fullName || 'Unknown',
        email: data.applicantEmail || data.email || '',
        phone: data.applicantPhone || data.phone,
        jobId: data.jobId || { title: 'N/A' },
        status: data.status || 'Submitted',
        cv: data.documents?.cv,
        coverLetter: data.coverLetter,
        aiScore: data.aiScore,
        notes: data.notes,
        interviewId: data.interviewId,
        jobTitle: data.jobTitle,
        jobLocation: data.jobLocation,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        applicantPhone: data.applicantPhone,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        documents: data.documents,
      }
      setApplications(prev => [newApp, ...prev])
      addNotification(`New application from ${newApp.fullName}`, 'success')
    })

    // Listen for status updates 
    const unsubscribeStatus = subscribe('statusUpdate', (data: any) => {
      setApplications(prev =>
        prev.map(app =>
          app._id === data.applicationId || app._id === data.id
            ? { ...app, status: data.status as any }
            : app
        )
      )
      addNotification(`Application status updated to ${data.status}`, 'info')
    })

    const unsubscribeAppNew = subscribe('application:new', (data: any) => {
      fetchApplications()
      addNotification('New application received!', 'success')
    })

    const unsubscribeShortlisted = subscribe('user:shortlisted', (data: any) => {
      addNotification('User shortlisted!', 'success')
    })

    return () => {
      unsubscribeNewApp?.()
      unsubscribeStatus?.()
      unsubscribeAppNew?.()
      unsubscribeShortlisted?.()
    }
  }, [subscribe, addNotification])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllApplications()
      setApplications(Array.isArray(data) ? data : data.applications || [])
    } catch (error) {
      addNotification('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toString().toLowerCase()) {
      case 'submitted':
      case 'pending':
        return 'bg-gray-500'
      case 'under review':
      case 'reviewed':
        return 'bg-yellow-500'
      case 'shortlisted':
      case 'accepted':
        return 'bg-green-500'
      case 'interview scheduled':
      case 'interview-scheduled':
        return 'bg-purple-500'
      case 'rejected':
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white ${getStatusBadgeColor(status)}`}>
      {status?.toString().replace(/-/g, ' ') || 'Unknown'}
    </span>
  )

  const isDocsVerified = (app: Application) => {
    return app.documentsVerified ?? app.documents?.verified ?? false
  }

  const verifyDocs = async (app: Application) => {
    try {
      setUpdating(true)
      const updatedApp = await adminService.verifyApplicationDocs(app._id)
      setApplications(prev => prev.map(item => item._id === app._id ? { ...item, ...updatedApp, documentsVerified: true } : item))
      addNotification('Documents verified successfully', 'success')
    } catch (error: any) {
      console.error('Error verifying documents:', error)
      addNotification(error?.message || 'Failed to verify documents', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const shortlistApplicant = async (app: Application) => {
    try {
      setUpdating(true)
      const updatedApp = await adminService.shortlistApplication(app._id)
      setApplications(prev => prev.map(item => item._id === app._id ? { ...item, ...updatedApp, status: 'Shortlisted' } : item))
      addNotification('Applicant shortlisted successfully', 'success')
    } catch (error: any) {
      console.error('Error shortlisting applicant:', error)
      addNotification(error?.message || 'Failed to shortlist applicant', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleStatusChange = (appId: string, newStatus: string) => {
    setApplications(
      applications.map(app => (app._id === appId ? { ...app, status: newStatus as any } : app))
    )
  }

  const handleSendEmail = async () => {
    if (!selectedApplication || !emailSubject || !emailBody) {
      addNotification('Please fill in all fields', 'error')
      return
    }

    try {
      setUpdating(true)
      await emailService.sendEmail({
        to: selectedApplication.email,
        subject: emailSubject,
        html: emailBody,
      })
      addNotification('Email sent successfully', 'success')
      setShowEmailModal(false)
      setEmailSubject('')
      setEmailBody('')
    } catch (error: any) {
      addNotification(error?.message || 'Failed to send email', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleAnalyzeCv = async () => {
    if (!selectedApplication || !selectedApplication.cv) {
      addNotification('CV not available', 'error')
      return
    }

    try {
      setUpdating(true)
      const score = await cvService.analyzeCv(
        selectedApplication.cv,
        'Job Description',
        ['Skill 1', 'Skill 2']
      )
      setCvScore(score)
      setShowScoreModal(true)
    } catch (error: any) {
      addNotification(error?.message || 'Failed to analyze CV', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const openDetailModal = (app: Application) => {
    setSelectedApplication(app)
    setShowDetailModal(true)
  }

  const openEmailModal = (app: Application) => {
    setSelectedApplication(app)
    // Prepare email template based on status
    if (app.status === 'shortlisted' || app.status === 'Shortlisted') {
      setEmailSubject(`You've been shortlisted! - ${typeof app.jobId === 'object' ? app.jobId.title : app.jobId}`)
      setEmailBody(`Hi ${app.fullName},\n\nGreat news! You have been shortlisted for the position. We will contact you soon with interview details.\n\nBest regards,\nThe Recruitment Team`)
    } else {
      setEmailSubject(`Update on your application`)
      setEmailBody(`Hi ${app.fullName},\n\nThank you for your application. We appreciate your interest in joining our team.\n\nBest regards,\nThe Recruitment Team`)
    }
    setShowEmailModal(true)
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof app.jobId === 'object'
        ? app.jobId.title.toLowerCase().includes(searchTerm.toLowerCase())
        : false)

    const matchesStatus = filterStatus === 'all' || app.status === filterStatus

    return matchesSearch && matchesStatus
  })

  if (authLoading || protectedLoading) return <Loader />
  
  if (!isAuthorized) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications & Applicants</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              Review and manage job applications
              {isConnected && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live Updates Active</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'pipeline' : 'table')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {viewMode === 'pipeline' ? 'Table View' : 'Pipeline View'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'pending' || a.status === 'Submitted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Shortlisted</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'shortlisted' || a.status === 'Shortlisted' || a.status === 'accepted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Interviews</p>
            <p className="text-2xl font-bold text-purple-600">
              {applications.filter(a => a.status === 'interview-scheduled' || a.status === 'Interview Scheduled').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'rejected' || a.status === 'Rejected').length}
            </p>
          </div>
        </div>

        {/* Pipeline View */}
        {viewMode === 'pipeline' ? (
          <>
            {loading ? (
              <div className="text-center py-12">
                <Loader />
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-md">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No applications yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <ApplicationPipeline
                  applications={filteredApplications.length > 0 ? filteredApplications : applications}
                  onStatusUpdate={handleStatusChange}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Table View */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, email, or job title..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview-scheduled">Interview Scheduled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-md">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No applications found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applicant</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Job</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applied</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map(app => (
                      <tr key={app._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium text-gray-900">{app.fullName}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {typeof app.jobId === 'object' ? app.jobId.title : app.jobId}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {app.cvScore ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-6 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    app.cvScore >= 80
                                      ? 'bg-green-500'
                                      : app.cvScore >= 60
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  }`}
                                  style={{ width: `${app.cvScore}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">{app.cvScore}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(app.createdAt)}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 sm:gap-1">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => verifyDocs(app)}
                              disabled={isDocsVerified(app) || updating}
                              className={`px-3 py-1 rounded text-white text-xs ${isDocsVerified(app) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                              {isDocsVerified(app) ? 'Verified' : 'Verify Docs'}
                            </button>
                            <button
                              onClick={() => shortlistApplicant(app)}
                              disabled={!isDocsVerified(app) || updating}
                              className={`px-3 py-1 rounded text-white text-xs ${!isDocsVerified(app) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              Shortlist
                            </button>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openDetailModal(app)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openEmailModal(app)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Email"
                            >
                              <Mail size={16} />
                            </button>
                            {app.cv && (
                              <button
                                onClick={() => {
                                  setSelectedApplication(app)
                                  handleAnalyzeCv()
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="AI Score"
                              >
                                <BarChart3 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Application Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
          {selectedApplication && (
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.fullName}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Applied for: <strong>{typeof selectedApplication.jobId === 'object' ? selectedApplication.jobId.title : selectedApplication.jobId}</strong>
                  </p>
                </div>
                <StatusBadge status={selectedApplication.status} />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <p><strong>Email:</strong> {selectedApplication.email}</p>
                {selectedApplication.phone && <p><strong>Phone:</strong> {selectedApplication.phone}</p>}
                <p><strong>Applied:</strong> {formatDate(selectedApplication.createdAt)}</p>
              </div>

              {selectedApplication.coverLetter && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{selectedApplication.coverLetter}</p>
                </div>
              )}

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => openEmailModal(selectedApplication)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  Send Email
                </button>
                {selectedApplication.cv && (
                  <a
                    href={selectedApplication.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center justify-center gap-2"
                  >
                    <FileText size={16} />
                    Download CV
                  </a>
                )}
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          )}
        </Modal>

        {/* Email Modal */}
        <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Email to {selectedApplication?.fullName}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email body"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {updating ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* CV Score Modal */}
        <Modal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)}>
          {cvScore && (
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">CV Analysis</h2>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">{cvScore.overallScore}%</div>
                  <p className="text-gray-600 text-sm mt-2">Overall Match</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Skills Match</p>
                    <p className="text-lg font-bold text-gray-900">{cvScore.skillsMatch}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Experience</p>
                    <p className="text-lg font-bold text-gray-900">{cvScore.experienceScore}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Keywords</p>
                    <p className="text-lg font-bold text-gray-900">{cvScore.keywordsMatch}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Education</p>
                    <p className="text-lg font-bold text-gray-900">{cvScore.educationScore}%</p>
                  </div>
                </div>

                {cvScore.strengths.length > 0 && (
                  <div>
                    <p className="font-semibold text-green-700 mb-2">Strengths:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {cvScore.strengths.map((str, idx) => <li key={idx}>• {str}</li>)}
                    </ul>
                  </div>
                )}

                {cvScore.weaknesses.length > 0 && (
                  <div>
                    <p className="font-semibold text-red-700 mb-2">Weaknesses:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {cvScore.weaknesses.map((weak, idx) => <li key={idx}>• {weak}</li>)}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setShowScoreModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default AdminApplicationsPage
