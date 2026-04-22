
import React, { useState, useEffect } from 'react'
import API from '@/services/apiClient'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

// Force server-side rendering for admin pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EmailTemplate {
  _id: string
  name: string
  subject: string
  body: string
  variables?: string[]
  created_at: string
}

export default function EmailTemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    variables: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user || user?.role !== 'admin') return
    fetchTemplates()
  }, [user, mounted])

  const fetchTemplates = async () => {
    try {
      const response = await API.get('/email-templates')
      setTemplates(response.data.templates || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      variables: (template.variables || []).join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await API.delete(`/email-templates/${id}`)
      setTemplates(templates.filter(t => t._id !== id))
      alert('Template deleted successfully!')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting template')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.subject || !formData.body) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const variables = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v)

      const data = {
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        variables,
      }

      if (selectedTemplate) {
        // Update
        const response = await API.put(`/email-templates/${selectedTemplate._id}`, data)
        setTemplates(
          templates.map(t => (t._id === selectedTemplate._id ? response.data.template : t))
        )
        alert('Template updated successfully!')
      } else {
        // Create
        const response = await API.post('/email-templates', data)
        setTemplates([...templates, response.data.template])
        alert('Template created successfully!')
      }

      resetForm()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving template')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setSelectedTemplate(null)
    setFormData({
      name: '',
      subject: '',
      body: '',
      variables: '',
    })
  }

  if (!mounted) return null

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 rounded p-4">
          <p className="text-red-700">Only admins can manage email templates.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600 mt-2">Manage email templates for sending messages to candidates.</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + New Template
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Interview Invitation"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!selectedTemplate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="E.g., Interview Invitation - {{job_title}}"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Body *</label>
                <textarea
                  value={formData.body}
                  onChange={e => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Dear {{name}}, You have been shortlisted for {{job_title}}..."
                  rows={10}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Variables (comma-separated)</label>
                <input
                  type="text"
                  value={formData.variables}
                  onChange={e => setFormData({ ...formData, variables: e.target.value })}
                  placeholder="E.g., name, date, time, job_title"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-xs mt-2">
                  {`Available variables: {{name}}, {{date}}, {{time}}, {{job_title}}`}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Templates List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Templates ({templates.length})</h2>
          </div>

          {templates.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No templates yet. Create your first template to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Created</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {templates.map(template => (
                    <tr key={template._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{template.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate">{template.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(template.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
