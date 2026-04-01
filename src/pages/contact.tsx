import React, { useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { useNotification } from '@/context/NotificationContext'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addNotification } = useNotification()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create mailto link with pre-filled subject and body
    const subject = encodeURIComponent(formData.subject || 'Support Inquiry from Airswift')
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )
    const mailtoLink = `mailto:support@airswift.com?subject=${subject}&body=${body}`
    
    // Open in new window
    window.open(mailtoLink)
    
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
    addNotification('Opening email client...', 'info')
  }

  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-6 rounded-lg text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto">
            We'd love to hear from you! Get in touch with our support team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Get In Touch</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">📧 Email</h3>
                <p className="text-gray-600 mb-3">support@airswift.com</p>
                <div className="flex gap-2">
                  <a
                    href="mailto:support@airswift.com"
                    className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition"
                  >
                    Send Email
                  </a>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=support@airswift.com&su=Contact%20from%20Airswift`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
                  >
                    📧 Gmail
                  </a>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xl font-bold text-primary mb-2">📞 Phone</h3>
                <p className="text-gray-600">+1-800-AIRSWIFT</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xl font-bold text-primary mb-2">🕐 Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p className="text-gray-600">Saturday - Sunday: Closed</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xl font-bold text-primary mb-2">📍 Location</h3>
                <p className="text-gray-600">
                  Airswift Headquarters<br/>
                  1500 King Street West<br/>
                  Toronto, ON M5H 1A1<br/>
                  Canada
                </p>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white px-6 py-3 rounded font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <p className="text-sm text-gray-500">
              💡 Note: Clicking "Send Message" will open your email client with all details pre-filled. You can also use the Gmail button on the left to contact us directly through Gmail.
            </p>
          </section>
        </div>

        {/* FAQ Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-primary mb-2">How quickly will I receive a response?</h3>
              <p className="text-gray-600">
                We aim to respond to all inquiries within 24 business hours. During weekends and holidays, responses may take a bit longer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-primary mb-2">What if I have an issue with my account?</h3>
              <p className="text-gray-600">
                Please contact us with your account details (email and username), and our support team will investigate and resolve the issue promptly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-primary mb-2">Can I report a job posting issue?</h3>
              <p className="text-gray-600">
                Absolutely! If you find a job posting that violates our guidelines, please report it directly through the job listing page, or contact us with details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-primary mb-2">Is there a phone support option?</h3>
              <p className="text-gray-600">
                We currently offer email support and phone inquiries. For the best response, please email us or use our contact form above.
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default Contact
