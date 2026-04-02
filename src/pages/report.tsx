import React, { useState, useEffect } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { useNotification } from '@/context/NotificationContext'
import { useAuth } from '@/context/AuthContext'

const Report: React.FC = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState({
    email: '',
    issueType: 'login_issue',
    subject: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.subject.trim() || !formData.description.trim() || !formData.email.trim()) {
      addNotification('Please fill in all required fields before submitting.', 'warning')
      setIsSubmitting(false)
      return
    }

    // Local handling; in production this should call an API endpoint.
    const message = `Report submitted:\nType: ${formData.issueType}\nSubject: ${formData.subject}\nDescription: ${formData.description}`
    console.log(message)

    addNotification('Your report has been submitted. Our support team will review it shortly.', 'success')

    setFormData({
      email: user?.email || '',
      issueType: 'login_issue',
      subject: '',
      description: '',
    })
    setIsSubmitting(false)
  }

  return (
    <MainLayout>
      <div className="space-y-16">
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-6 rounded-lg text-center">
          <h1 className="text-5xl font-bold mb-4">Report an Issue</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Report login problems, suspicious activity, or unethical behavior. Our team takes every report seriously.
          </p>
        </div>

        <section className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Issue Report Form</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email (required)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Type
              </label>
              <select
                id="issueType"
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="login_issue">Login Issue</option>
                <option value="unauthorized_activity">Unauthorized Activity</option>
                <option value="fake_posting">Fake/Suspicious Posting</option>
                <option value="harassment">Harassment or Abuse</option>
                <option value="security_concern">Security or Vulnerability</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject (required)
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief summary of the issue"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description (required)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                placeholder="Describe what happened, any usernames affected, and the expected behavior."
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white px-6 py-3 rounded font-semibold hover:bg-opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              By submitting this report, you confirm that the information is accurate to the best of your knowledge. Our team will investigate and follow up via email.
            </p>
          </form>
        </section>
      </div>
    </MainLayout>
  )
}

export default Report
