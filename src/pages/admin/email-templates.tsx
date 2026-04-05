import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import { emailService } from '@/services/jobCategoryService'
import { EmailTemplate, ApplicationStage } from '@/types/jobCategories'
import { DEFAULT_EMAIL_TEMPLATES } from '@/data/emailTemplates'

const AdminEmailTemplatesPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null)

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    stage: 'application_submitted' as ApplicationStage,
    isActive: true
  })

  useEffect(() => {
    if (isAuthorized) {
      fetchTemplates()
    }
  }, [isAuthorized])

  const fetchTemplates = async () => {
    try {
      // For now, use default templates since we don't have a backend
      // In production, this would fetch from the API
      setTemplates(DEFAULT_EMAIL_TEMPLATES.filter(template => template.stage !== 'password_reset'))
    } catch (error) {
      addNotification('Failed to load email templates', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      stage: template.stage as ApplicationStage, // Safe cast since password_reset templates are filtered out
      isActive: template.isActive
    })
    setSelectedTemplate(template)
    setShowEditModal(true)
    setPreviewMode(false)
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.body.trim()) {
      addNotification('All fields are required', 'error')
      return
    }

    setSaving(true)
    try {
      if (selectedTemplate) {
        // Update existing template
        const updatedTemplate = { ...selectedTemplate, ...templateForm }
        // In production: await emailService.updateTemplate(selectedTemplate.id, templateForm)
        setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t))
        addNotification('Email template updated successfully!', 'success')
      }

      setShowEditModal(false)
      setPreviewMode(false)
    } catch (error) {
      addNotification('Failed to save email template', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const updatedTemplate = { ...template, isActive: !template.isActive }
      // In production: await emailService.updateTemplate(template.id, { isActive: !template.isActive })
      setTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t))
      addNotification(`Email template ${!template.isActive ? 'activated' : 'deactivated'} successfully!`, 'success')
    } catch (error) {
      addNotification('Failed to update template status', 'error')
    }
  }

  const handlePreviewTemplate = async (template: EmailTemplate) => {
    try {
      // Sample variables for preview
      const sampleVariables = {
        applicantName: 'John Doe',
        jobTitle: 'Software Developer',
        companyName: 'Talex',
        interviewDate: 'April 15, 2026 at 2:00 PM',
        zoomLink: 'https://zoom.us/j/123456789',
        interviewNotes: 'Please bring your ID and resume',
        applicationId: 'APP-001',
        trackingNumber: 'VISA-2026-001',
        visaNumber: 'VS-2026-001',
        issueDate: 'April 20, 2026',
        expiryDate: 'April 20, 2027',
        workPermitExpiry: 'April 20, 2028',
        embassyLocation: 'Canadian Embassy, Nairobi'
      }

      // In production: const preview = await emailService.previewTemplate(template.id, sampleVariables)
      const preview = {
        subject: template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => sampleVariables[key as keyof typeof sampleVariables] || match),
        body: template.body.replace(/\{\{(\w+)\}\}/g, (match, key) => sampleVariables[key as keyof typeof sampleVariables] || match)
      }

      setPreviewData(preview)
      setPreviewMode(true)
    } catch (error) {
      addNotification('Failed to preview template', 'error')
    }
  }

  const getStageColor = (stage: ApplicationStage) => {
    switch (stage) {
      case 'application_submitted': return 'bg-blue-100 text-blue-800'
      case 'application_reviewed': return 'bg-yellow-100 text-yellow-800'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800'
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800'
      case 'visa_payment_required': return 'bg-orange-100 text-orange-800'
      case 'visa_processing_started': return 'bg-teal-100 text-teal-800'
      case 'visa_ready': return 'bg-emerald-100 text-emerald-800'
      case 'application_rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageLabel = (stage: ApplicationStage) => {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
    { label: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { label: 'Applications', href: '/admin/applications', icon: '📋' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Email Templates', href: '/admin/email-templates', icon: '📧' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setPreviewMode(false)
        }}
        onConfirm={handleSaveTemplate}
        confirmText={saving ? 'Saving...' : 'Save Template'}
        title="Edit Email Template"
      >
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Template Name"
              value={templateForm.name}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Application Stage</label>
              <select
                value={templateForm.stage}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, stage: e.target.value as ApplicationStage }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                {Object.values([
                  'application_submitted',
                  'application_reviewed',
                  'interview_scheduled',
                  'interview_completed',
                  'visa_payment_required',
                  'visa_processing_started',
                  'visa_ready',
                  'application_rejected'
                ] as ApplicationStage[]).map(stage => (
                  <option key={stage} value={stage}>
                    {getStageLabel(stage)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Email Subject"
            value={templateForm.subject}
            onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Use {{variable}} for dynamic content"
            required
          />

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Body</label>
            <Textarea
              value={templateForm.body}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
              rows={12}
              placeholder="Use {{variable}} for dynamic content. Available variables: applicantName, jobTitle, companyName, interviewDate, zoomLink, etc."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Available variables: applicantName, jobTitle, companyName, interviewDate, zoomLink, interviewNotes, applicationId, trackingNumber, visaNumber, issueDate, expiryDate, workPermitExpiry, embassyLocation
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={templateForm.isActive}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-gray-700">
              Active (send emails using this template)
            </label>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewMode}
        onClose={() => setPreviewMode(false)}
        title="Email Preview"
        confirmText="Close"
        onConfirm={() => setPreviewMode(false)}
      >
        {previewData && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Subject:</label>
              <div className="bg-gray-100 p-3 rounded border">
                {previewData.subject}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Body:</label>
              <div className="bg-gray-100 p-3 rounded border whitespace-pre-wrap max-h-96 overflow-y-auto">
                {previewData.body}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-gray-600">Customize email notifications sent to applicants</p>
        </div>

        <div className="space-y-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-gray-600 text-sm">Subject: {template.subject}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(template.stage as ApplicationStage)}`}>
                    {getStageLabel(template.stage as ApplicationStage)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 text-sm line-clamp-3 bg-gray-50 p-3 rounded">
                  {template.body}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleEditTemplate(template)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handlePreviewTemplate(template)}
                  variant="outline"
                  size="sm"
                >
                  Preview
                </Button>
                <Button
                  onClick={() => handleToggleActive(template)}
                  variant="outline"
                  size="sm"
                  className={template.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                >
                  {template.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminEmailTemplatesPage
