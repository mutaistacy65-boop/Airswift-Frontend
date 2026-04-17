import React, { useState, useEffect } from 'react'
import API from '@/services/apiClient'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'

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

interface MessageTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
}

interface MessageLog {
  id: string
  recipient: string
  subject: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  type: 'interview' | 'general' | 'reminder'
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
  const { addNotification } = useNotification()

  const [applications, setApplications] = useState<SelectedApp[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedApp, setSelectedApp] = useState<SelectedApp | null>(null)
  const [activeTab, setActiveTab] = useState('compose')
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [scheduleSend, setScheduleSend] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [bulkRecipients, setBulkRecipients] = useState<string[]>([])
  const [isBulkMode, setIsBulkMode] = useState(false)

  const [formData, setFormData] = useState({
    userId: '',
    subject: '',
    message: '',
    interviewDate: '',
    interviewTime: '',
    attachment: null as File | null,
    category: 'interview',
    priority: 'normal' as 'low' | 'normal' | 'high',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState('')

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '👥 Users', href: '/admin/users' },
    { label: ' Applications', href: '/admin/applications' },
    { label: '📞 Interviews', href: '/admin/interviews' },
    { label: '💰 Payments', href: '/admin/payments' },
    { label: '📋 Audit Logs', href: '/admin/audit' },
    { label: '🔍 Health', href: '/admin/health' },
    { label: '⚙️ Settings', href: '/admin/settings' },
  ]

  useEffect(() => {
    if (user?.role !== 'admin') return
    fetchApplications()
    loadMessageTemplates()
    loadMessageLogs()
  }, [user])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/applications')
      // Get only shortlisted applications
      const shortlisted = (response.data?.applications || [])?.filter(
        (app: any) => app.status === 'shortlisted'
      ) || []
      setApplications(shortlisted)
    } catch (err: any) {
      console.error('REAL ERROR:', err.response?.data || err.message)
      if (err.response?.status === 401) {
        setErrors({ submit: '❌ Not authenticated. Please log in again.' })
      } else {
        setErrors({ submit: err.response?.data?.message || 'Error fetching applications' })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessageTemplates = async () => {
    try {
      // Simulate loading templates
      const mockTemplates: MessageTemplate[] = [
        {
          id: '1',
          name: 'Interview Invitation',
          subject: 'Interview Invitation - {{job_title}} Position',
          content: 'Dear {{name}},\n\nCongratulations! We would like to invite you for an interview for the {{job_title}} position.\n\nInterview Details:\nDate: {{date}}\nTime: {{time}}\n\nPlease prepare for a technical discussion about your experience and the role requirements.\n\nBest regards,\nAirswift Recruitment Team',
          category: 'interview'
        },
        {
          id: '2',
          name: 'Interview Reminder',
          subject: 'Reminder: Your Interview Tomorrow',
          content: 'Dear {{name}},\n\nThis is a friendly reminder about your upcoming interview for the {{job_title}} position.\n\nInterview Details:\nDate: {{date}}\nTime: {{time}}\n\nPlease ensure you have a stable internet connection and a quiet environment for the interview.\n\nBest regards,\nAirswift Recruitment Team',
          category: 'reminder'
        }
      ]
      setTemplates(mockTemplates)
    } catch (err: any) {
      console.error('REAL ERROR:', err.response?.data || err.message)
      if (err.response?.status === 401) {
        setErrors({ submit: '❌ Not authenticated. Please log in again.' })
      } else {
        setErrors({ submit: err.response?.data?.message || 'Error loading templates' })
      }
    }
  }

  const loadMessageLogs = async () => {
    try {
      // Simulate loading message logs
      const mockLogs: MessageLog[] = [
        {
          id: '1',
          recipient: 'john.doe@example.com',
          subject: 'Interview Invitation - Senior Developer',
          status: 'delivered',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'interview'
        },
        {
          id: '2',
          recipient: 'jane.smith@example.com',
          subject: 'Interview Reminder',
          status: 'read',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: 'reminder'
        }
      ]
      setMessageLogs(mockLogs)
    } catch (err: any) {
      console.error('REAL ERROR:', err.response?.data || err.message)
      if (err.response?.status === 401) {
        setErrors({ submit: '❌ Not authenticated. Please log in again.' })
      } else {
        setErrors({ submit: err.response?.data?.message || 'Error loading message logs' })
      }
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

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        message: template.content,
        category: template.category
      }))
      setSelectedTemplate(templateId)
    }
  }

  const handleBulkRecipientToggle = (appId: string) => {
    setBulkRecipients(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    setFileError('')

    if (!isBulkMode && !formData.userId) newErrors.userId = 'Please select a candidate'
    if (isBulkMode && bulkRecipients.length === 0) newErrors.bulkRecipients = 'Please select at least one recipient'
    if (!formData.subject) newErrors.subject = 'Subject is required'
    if (!formData.subject.length || formData.subject.length < 5)
      newErrors.subject = 'Subject must be at least 5 characters'
    if (!formData.message) newErrors.message = 'Message is required'
    if (!formData.message.length || formData.message.length < 10)
      newErrors.message = 'Message must be at least 10 characters'

    if (formData.category === 'interview') {
      if (!formData.interviewDate) newErrors.interviewDate = 'Interview date is required'
      if (!formData.interviewTime) newErrors.interviewTime = 'Interview time is required'

      // Validate date is in the future
      const today = new Date().toISOString().split('T')[0]
      if (formData.interviewDate < today) {
        newErrors.interviewDate = 'Interview date must be in the future'
      }
    }

    if (scheduleSend) {
      if (!scheduledDate) newErrors.scheduledDate = 'Scheduled date is required'
      if (!scheduledTime) newErrors.scheduledTime = 'Scheduled time is required'
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
      const recipients = isBulkMode ? bulkRecipients : [formData.userId]

      for (const recipientId of recipients) {
        const data = new FormData()
        data.append('userId', recipientId)
        data.append('subject', formData.subject)
        data.append('message', formData.message)
        data.append('category', formData.category)
        data.append('priority', formData.priority)

        if (formData.category === 'interview') {
          data.append('interviewDate', formData.interviewDate)
          data.append('interviewTime', formData.interviewTime)
        }

        if (scheduleSend) {
          data.append('scheduledDate', scheduledDate)
          data.append('scheduledTime', scheduledTime)
        }

        if (formData.attachment) {
          data.append('attachment', formData.attachment)
        }

        const response = await api.post('/messages', data)
        // ✅ DO NOT set Content-Type - axios handles it automatically for FormData

        if (response.data.success) {
          // Update application status to shortlisted (if not already)
          if (!isBulkMode && selectedApp && selectedApp.status !== 'shortlisted') {
            try {
              await api.put(`/applications/${selectedApp._id}`, { status: 'shortlisted' })
            } catch (err) {
              console.warn('Could not update application status:', err)
            }
          }

          // Emit real-time event to notify user
          try {
            emit('new_message', {
              user_id: recipientId,
              message: response.data.message,
            })
          } catch (err) {
            console.warn('Could not emit socket event:', err)
          }
        }
      }

      // Show success modal
      setShowSuccess(true)
      addNotification(`Message${isBulkMode ? 's' : ''} sent successfully!`, 'success')

      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          userId: '',
          subject: '',
          message: '',
          interviewDate: '',
          interviewTime: '',
          attachment: null,
          category: 'interview',
          priority: 'normal',
        })
        setSelectedApp(null)
        setBulkRecipients([])
        setIsBulkMode(false)
        setScheduleSend(false)
        setScheduledDate('')
        setScheduledTime('')
        setSelectedTemplate('')
        setErrors({})
        setFileError('')
      }, 1500)

      // Refresh logs
      loadMessageLogs()

    } catch (err: any) {
      console.error('REAL ERROR:', err.response?.data || err.message)
      if (err.response?.status === 401) {
        setErrors({ submit: '❌ Not authenticated. Please log in again.' })
        addNotification('❌ Not authenticated. Please log in again.', 'error')
      } else {
        const message = err.response?.data?.message || 'Error sending message'
        setErrors({ submit: message })
        addNotification(message, 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    router.push('/admin/applications-list')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600'
      case 'delivered': return 'text-green-600'
      case 'read': return 'text-purple-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '📤'
      case 'delivered': return '✅'
      case 'read': return '👁️'
      case 'failed': return '❌'
      default: return '📧'
    }
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
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
            <i className="fas fa-envelope" style={{ marginRight: '10px' }}></i> Interview Message Center
          </h1>
          <p style={{ opacity: 0.9 }}>
            Compose, schedule, and track interview messages with advanced analytics and bulk messaging
          </p>
        </div>

        <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} />

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          {[
            { id: 'compose', label: '📝 Compose', icon: 'fas fa-edit' },
            { id: 'templates', label: '📋 Templates', icon: 'fas fa-file-alt' },
            { id: 'bulk', label: '📢 Bulk Send', icon: 'fas fa-users' },
            { id: 'logs', label: '📊 Message Logs', icon: 'fas fa-history' },
            { id: 'analytics', label: '📈 Analytics', icon: 'fas fa-chart-bar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '15px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#667eea' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderRight: tab.id !== 'analytics' ? '1px solid #eee' : 'none'
              }}
            >
              <i className={tab.icon} style={{ marginRight: '8px' }}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Message Form */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                  Compose Message
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #667eea',
                      background: isBulkMode ? '#667eea' : 'white',
                      color: isBulkMode ? 'white' : '#667eea',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-users" style={{ marginRight: '5px' }}></i>
                    Bulk Mode
                  </button>
                  <button
                    onClick={() => setScheduleSend(!scheduleSend)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #28a745',
                      background: scheduleSend ? '#28a745' : 'white',
                      color: scheduleSend ? 'white' : '#28a745',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-clock" style={{ marginRight: '5px' }}></i>
                    Schedule
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Error Summary */}
                {errors.submit && (
                  <div style={{
                    background: '#f8d7da',
                    color: '#721c24',
                    padding: '15px',
                    borderRadius: '4px',
                    border: '1px solid #f5c6cb'
                  }}>
                    {errors.submit}
                  </div>
                )}

                {/* Recipient Selection */}
                {!isBulkMode ? (
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                      Select Candidate *
                    </label>
                    <select
                      value={formData.userId}
                      onChange={handleApplicationSelect}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
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
                      <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                        {errors.userId}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                      Bulk Recipients ({bulkRecipients.length} selected) *
                    </label>
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '10px'
                    }}>
                      {applications.map(app => (
                        <label key={app._id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '5px 0',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={bulkRecipients.includes(app._id)}
                            onChange={() => handleBulkRecipientToggle(app._id)}
                            style={{ marginRight: '10px' }}
                          />
                          {app.user_id.name} ({app.user_id.email})
                        </label>
                      ))}
                    </div>
                    {errors.bulkRecipients && (
                      <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                        {errors.bulkRecipients}
                      </p>
                    )}
                  </div>
                )}

                {/* Message Category & Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="interview">Interview</option>
                      <option value="general">General</option>
                      <option value="reminder">Reminder</option>
                      <option value="followup">Follow-up</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="E.g., Interview Invitation - Senior Developer"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.subject ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {errors.subject && (
                    <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message. You can use variables: {{name}}, {{date}}, {{time}}, {{job_title}}"
                    rows={8}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.message ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  {errors.message && (
                    <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                      {errors.message}
                    </p>
                  )}
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    background: '#e7f3ff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#0066cc'
                  }}>
                    {'💡 Available variables: {{name}}, {{date}}, {{time}}, {{job_title}}'}
                  </div>
                </div>

                {/* Interview Details (if category is interview) */}
                {formData.category === 'interview' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                        Interview Date *
                      </label>
                      <input
                        type="date"
                        name="interviewDate"
                        value={formData.interviewDate}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.interviewDate ? '1px solid #dc3545' : '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      {errors.interviewDate && (
                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                          {errors.interviewDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                        Interview Time *
                      </label>
                      <input
                        type="time"
                        name="interviewTime"
                        value={formData.interviewTime}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.interviewTime ? '1px solid #dc3545' : '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      {errors.interviewTime && (
                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                          {errors.interviewTime}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Scheduling (if enabled) */}
                {scheduleSend && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                        Scheduled Date *
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.scheduledDate ? '1px solid #dc3545' : '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      {errors.scheduledDate && (
                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                          {errors.scheduledDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                        Scheduled Time *
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: errors.scheduledTime ? '1px solid #dc3545' : '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      {errors.scheduledTime && (
                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                          {errors.scheduledTime}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                    Attachment (Optional)
                  </label>
                  <div style={{
                    border: '2px dashed #ddd',
                    borderRadius: '4px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#f9f9f9'
                  }}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      style={{ display: 'none' }}
                      id="attachment"
                    />
                    <label htmlFor="attachment" style={{ cursor: 'pointer' }}>
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: '24px', color: '#666', marginBottom: '10px' }}></i>
                      <div style={{ color: '#666' }}>
                        Click to upload PDF file (Max 10MB)
                      </div>
                    </label>
                  </div>

                  {formData.attachment && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      background: '#d4edda',
                      border: '1px solid #c3e6cb',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <i className="fas fa-file-pdf" style={{ marginRight: '8px', color: '#28a745' }}></i>
                        {formData.attachment.name} ({(formData.attachment.size / 1024).toFixed(2)} KB)
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}

                  {fileError && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      background: '#f8d7da',
                      border: '1px solid #f5c6cb',
                      borderRadius: '4px',
                      color: '#721c24'
                    }}>
                      {fileError}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || loading || (!isBulkMode && !selectedApp) || (isBulkMode && bulkRecipients.length === 0)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '4px',
                    background: submitting ? '#6c757d' : '#667eea',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      {scheduleSend ? 'Schedule Message' : 'Send Message'}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preview Panel */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                Message Preview
              </h2>

              {selectedApp && (
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  background: '#f9f9f9',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '10px' }}>
                    Recipient: {selectedApp.user_id.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Email: {selectedApp.user_id.email}<br />
                    Position: {selectedApp.job_id.title}
                  </div>
                </div>
              )}

              <div style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#f8f9fa',
                  padding: '10px 15px',
                  borderBottom: '1px solid #ddd',
                  fontWeight: '600'
                }}>
                  Subject: {formData.subject || 'No subject'}
                </div>
                <div style={{
                  padding: '15px',
                  minHeight: '200px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {formData.message || 'No message content'}
                </div>
              </div>

              {formData.category === 'interview' && (formData.interviewDate || formData.interviewTime) && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: '#e7f3ff',
                  borderRadius: '4px',
                  border: '1px solid #b3d9ff'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '10px', color: '#0066cc' }}>
                    <i className="fas fa-calendar-alt" style={{ marginRight: '8px' }}></i>
                    Interview Details
                  </div>
                  <div style={{ fontSize: '14px', color: '#0066cc' }}>
                    Date: {formData.interviewDate || 'Not set'}<br />
                    Time: {formData.interviewTime || 'Not set'}
                  </div>
                </div>
              )}

              {scheduleSend && (scheduledDate || scheduledTime) && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: '#fff3cd',
                  borderRadius: '4px',
                  border: '1px solid #ffeaa7'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '10px', color: '#856404' }}>
                    <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
                    Scheduled Send
                  </div>
                  <div style={{ fontSize: '14px', color: '#856404' }}>
                    Will be sent on: {scheduledDate || 'Not set'} at {scheduledTime || 'Not set'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
              Message Templates
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {templates.map(template => (
                <div key={template.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  background: '#f9f9f9'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '10px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    Subject: {template.subject}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '15px',
                    maxHeight: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {template.content.substring(0, 150)}...
                  </div>
                  <button
                    onClick={() => handleTemplateSelect(template.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #667eea',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Send Tab */}
        {activeTab === 'bulk' && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
              Bulk Message Send
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 300px',
              gap: '20px'
            }}>
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                    Select Recipients
                  </h3>
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}>
                    {applications.map(app => (
                      <label key={app._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        background: bulkRecipients.includes(app._id) ? '#e7f3ff' : 'transparent'
                      }}>
                        <input
                          type="checkbox"
                          checked={bulkRecipients.includes(app._id)}
                          onChange={() => handleBulkRecipientToggle(app._id)}
                          style={{ marginRight: '10px' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600' }}>{app.user_id.name}</div>
                          <div style={{ fontSize: '14px', color: '#666' }}>{app.user_id.email}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{app.job_id.title}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  <strong>{bulkRecipients.length}</strong> recipients selected
                </div>
              </div>
              <div style={{
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '4px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                  Bulk Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => setBulkRecipients(applications.map(app => app._id))}
                    style={{
                      padding: '10px',
                      border: '1px solid #28a745',
                      background: '#28a745',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setBulkRecipients([])}
                    style={{
                      padding: '10px',
                      border: '1px solid #dc3545',
                      background: '#dc3545',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setActiveTab('compose')}
                    style={{
                      padding: '10px',
                      border: '1px solid #667eea',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Compose for Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Logs Tab */}
        {activeTab === 'logs' && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                Message Logs
              </h2>
              <button
                onClick={loadMessageLogs}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #667eea',
                  background: '#667eea',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-sync" style={{ marginRight: '5px' }}></i>
                Refresh
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      background: '#f8f9fa',
                      fontWeight: '600'
                    }}>
                      Recipient
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      background: '#f8f9fa',
                      fontWeight: '600'
                    }}>
                      Subject
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      background: '#f8f9fa',
                      fontWeight: '600'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      background: '#f8f9fa',
                      fontWeight: '600'
                    }}>
                      Type
                    </th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ddd',
                      background: '#f8f9fa',
                      fontWeight: '600'
                    }}>
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messageLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {log.recipient}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {log.subject}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: log.status === 'delivered' ? '#d4edda' : log.status === 'read' ? '#e7f3ff' : '#fff3cd',
                          color: log.status === 'delivered' ? '#155724' : log.status === 'read' ? '#0066cc' : '#856404'
                        }}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {log.type}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
                Message Statistics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <span>Total Sent</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>{messageLogs.length}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#d4edda',
                  borderRadius: '4px'
                }}>
                  <span>Delivered</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>
                    {messageLogs.filter(log => log.status === 'delivered').length}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#e7f3ff',
                  borderRadius: '4px'
                }}>
                  <span>Read</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>
                    {messageLogs.filter(log => log.status === 'read').length}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f8d7da',
                  borderRadius: '4px'
                }}>
                  <span>Failed</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>
                    {messageLogs.filter(log => log.status === 'failed').length}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
                Message Types
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#fff3cd',
                  borderRadius: '4px'
                }}>
                  <span>Interviews</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>
                    {messageLogs.filter(log => log.type === 'interview').length}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#d1ecf1',
                  borderRadius: '4px'
                }}>
                  <span>Reminders</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>
                    {messageLogs.filter(log => log.type === 'reminder').length}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <span>General</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>
                    {messageLogs.filter(log => log.type === 'general').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
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
