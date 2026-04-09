import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/hooks/useSocket'

interface SelectedApp {
  _id: string
  user_id: {
    _id: string
    name: string
    email: string
    phone: string
  }
  job_id: {
    _id: string
    title: string
    description: string
  }
  status: string
}

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md text-center">
        <div className="text-green-500 text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h2>
        <p className="text-gray-600 mb-6">
          The interview invitation has been sent to the candidate. They will receive a real-time notification.
        </p>
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default function SendMessagePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { emit } = useSocket()
  
  const [applications, setApplications] = useState<SelectedApp[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedApp, setSelectedApp] = useState<SelectedApp | null>(null)
  
  const [formData, setFormData] = useState({
    userId: '',
    subject: '',
    message: '',
    interviewDate: '',
    interviewTime: '',
    attachment: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') return
    fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/applications')
      // Get only shortlisted applications
      const shortlisted = response.data.applications?.filter(
        (app: any) => app.status === 'shortlisted'
      ) || []
      setApplications(shortlisted)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const appId = e.target.value
    setFormData(prev => ({ ...prev, userId: appId }))

    if (appId) {
      const app = applications.find(a => a._id === appId)
      setSelectedApp(app || null)
    } else {
      setSelectedApp(null)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    setFileError('')

    if (!formData.userId) newErrors.userId = 'Please select a candidate'
    if (!formData.subject) newErrors.subject = 'Subject is required'
    if (!formData.subject.length || formData.subject.length < 5)
      newErrors.subject = 'Subject must be at least 5 characters'
    if (!formData.message) newErrors.message = 'Message is required'
    if (!formData.message.length || formData.message.length < 10)
      newErrors.message = 'Message must be at least 10 characters'
    if (!formData.interviewDate) newErrors.interviewDate = 'Interview date is required'
    if (!formData.interviewTime) newErrors.interviewTime = 'Interview time is required'

    // Validate date is in the future
    const today = new Date().toISOString().split('T')[0]
    if (formData.interviewDate < today) {
      newErrors.interviewDate = 'Interview date must be in the future'
    }

    // Validate file
    if (formData.attachment) {
      if (formData.attachment.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed')
        return false
      }
      if (formData.attachment.size > 10 * 1024 * 1024) {
        setFileError('File size must be less than 10MB')
        return false
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const file = files[0]
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed. Selected: ' + file.type)
        setFormData(prev => ({ ...prev, attachment: null }))
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size exceeds 10MB limit')
        setFormData(prev => ({ ...prev, attachment: null }))
        return
      }

      setFileError('')
      setFormData(prev => ({ ...prev, attachment: file }))
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)

    try {
      const data = new FormData()
      data.append('userId', formData.userId)
      data.append('subject', formData.subject)
      data.append('message', formData.message)
      data.append('interviewDate', formData.interviewDate)
      data.append('interviewTime', formData.interviewTime)
      if (formData.attachment) {
        data.append('attachment', formData.attachment)
      }

      const response = await axios.post('/api/messages', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.success) {
        // Update application status to shortlisted (if not already)
        if (selectedApp && selectedApp.status !== 'shortlisted') {
          try {
            await axios.put(`/api/applications/${selectedApp._id}`, { status: 'shortlisted' })
          } catch (err) {
            console.warn('Could not update application status:', err)
          }
        }

        // Emit real-time event to notify user
        try {
          emit('new_message', {
            user_id: formData.userId,
            message: response.data.message,
          })
        } catch (err) {
          console.warn('Could not emit socket event:', err)
        }

        // Show success modal
        setShowSuccess(true)

        // Reset form after a delay
        setTimeout(() => {
          setFormData({
            userId: '',
            subject: '',
            message: '',
            interviewDate: '',
            interviewTime: '',
            attachment: null,
          })
          setSelectedApp(null)
          setErrors({})
          setFileError('')
        }, 1500)
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error sending message'
      setErrors({ submit: message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    router.push('/admin/applications-list')
  }

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-medium">Only admins can send interview messages.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Send Interview Message</h1>
          <p className="text-gray-600 mt-2">
            Send interview invitations and details to shortlisted candidates
          </p>
        </div>

        {/* Applicant Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Select Candidate *
          </label>
          <select
            value={formData.userId}
            onChange={handleApplicationSelect}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              {loading ? 'Loading candidates...' : 'Choose a candidate'}
            </option>
            {applications.map(app => (
              <option key={app._id} value={app._id}>
                {app.user_id.name} ({app.user_id.email})
              </option>
            ))}
          </select>
          {errors.userId && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <span className="mr-1">⚠️</span> {errors.userId}
            </p>
          )}
        </div>

        {/* Applicant Info Card */}
        {selectedApp && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">👤 Applicant Information (Read-only)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{selectedApp.user_id.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{selectedApp.user_id.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Position Applied</p>
                <p className="font-semibold text-gray-900">{selectedApp.job_id.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{selectedApp.user_id.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Error Summary */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">❌ {errors.submit}</p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">
              Subject ✉️ *
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="E.g., Interview Invitation - Senior Developer"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span> {errors.subject}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
              Message 💬 *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter your message. You can use variables: {{name}}, {{date}}, {{time}}, {{job_title}}"
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span> {errors.message}
              </p>
            )}
            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-900 text-xs font-medium">
                {`💡 Available variables: {{name}}, {{date}}, {{time}}, {{job_title}}`}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="interviewDate" className="block text-sm font-bold text-gray-900 mb-2">
                Interview Date 📅 *
              </label>
              <input
                id="interviewDate"
                type="date"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.interviewDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.interviewDate && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.interviewDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="interviewTime" className="block text-sm font-bold text-gray-900 mb-2">
                Interview Time ⏰ *
              </label>
              <input
                id="interviewTime"
                type="time"
                name="interviewTime"
                value={formData.interviewTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.interviewTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.interviewTime && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.interviewTime}
                </p>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <label htmlFor="attachment" className="block text-sm font-bold text-gray-900 mb-3">
              📎 Upload Interview Instructions (Optional)
            </label>
            <label
              htmlFor="attachment"
              className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="text-center">
                <p className="text-gray-600 font-medium">📄 Choose a PDF file or drag and drop</p>
                <p className="text-gray-500 text-sm">Maximum file size: 10MB</p>
              </div>
              <input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
            </label>

            {/* File Preview */}
            {formData.attachment && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <p className="font-medium text-green-900">{formData.attachment.name}</p>
                    <p className="text-green-700 text-sm">
                      {(formData.attachment.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, attachment: null }))
                    setFileError('')
                  }}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}

            {fileError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm flex items-center">
                  <span className="mr-2">❌</span> {fileError}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || loading || !selectedApp}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-lg transition ${
              submitting || loading || !selectedApp
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Interview Details...
              </span>
            ) : (
              <span className="flex items-center justify-center">🚀 Send Interview Message</span>
            )}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-3">ℹ️ What happens after sending?</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span> Message is delivered instantly to the candidate
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span> Real-time notification is sent to their dashboard
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span> Candidate receives interview date and time
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span> PDF attachment is available for download
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}

export async function getServerSideProps(context: any) {
  const { req } = context;
  const token = req.cookies.accessToken;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Optional: Verify token on server side
  try {
    // You can add JWT verification here if needed
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (decoded.role !== 'admin') {
    //   return {
    //     redirect: {
    //       destination: '/',
    //       permanent: false,
    //     },
    //   };
    // }
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
