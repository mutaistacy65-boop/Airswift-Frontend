import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/layouts/MainLayout'
import Button from '@/components/Button'
import DocumentUpload from '@/components/DocumentUpload'
import Textarea from '@/components/Textarea'
import SearchableSelect from '@/components/SearchableSelect'
import Loader from '@/components/Loader'
import { jobService, Job } from '@/services/jobService'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'

const JobApplicationPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated } = useAuth()
  const { addNotification } = useNotification()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Job category selection
  const [selectedCategory, setSelectedCategory] = useState('')

  // Document states
  const [passport, setPassport] = useState<File | null>(null)
  const [nationalId, setNationalId] = useState<File | null>(null)
  const [cv, setCv] = useState<File | null>(null)
  const [certificates, setCertificates] = useState<File[]>([])
  const [coverLetter, setCoverLetter] = useState('')

  // Validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Job categories (A-Z)
  const jobCategories = [
    'Accounting', 'Business', 'Construction', 'Design', 'Education', 'Engineering',
    'Finance', 'Healthcare', 'Hospitality', 'IT', 'Legal', 'Manufacturing',
    'Marketing', 'Nursing', 'Operations', 'Retail', 'Sales', 'Technology'
  ].map(category => ({ value: category.toLowerCase(), label: category }))

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchJob()
    } else if (!isAuthenticated) {
      router.push('/login')
    }
  }, [id, isAuthenticated])

  const fetchJob = async () => {
    try {
      const data = await jobService.getJobById(id as string)
      setJob(data)
    } catch (error) {
      addNotification('Failed to load job details', 'error')
      router.push('/jobs')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!selectedCategory) newErrors.category = 'Job category is required'
    if (!passport) newErrors.passport = 'Passport is required'
    if (!nationalId) newErrors.nationalId = 'National ID is required'
    if (!cv) newErrors.cv = 'CV/Resume is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('job_id', id as string)
      formData.append('job_category', selectedCategory)
      formData.append('cover_letter', coverLetter)

      // Add documents
      if (passport) formData.append('passport', passport)
      if (nationalId) formData.append('national_id', nationalId)
      if (cv) formData.append('cv', cv)

      // Add certificates
      certificates.forEach((cert, index) => {
        formData.append(`certificates[${index}]`, cert)
      })

      await jobService.applyForJob(id as string, cv, coverLetter, formData)

      addNotification('Application submitted successfully! You will be notified of the next steps.', 'success')
      router.push('/job-seeker/dashboard')
    } catch (error) {
      addNotification('Failed to submit application. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCertificateAdd = (file: File | null) => {
    if (file) {
      setCertificates(prev => [...prev, file])
    }
  }

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Loader size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Job not found</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for: {job.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{job.company}</p>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div><strong>Location:</strong> {job.location}</div>
            <div><strong>Salary:</strong> {job.salary}</div>
            <div><strong>Type:</strong> {job.type}</div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Submit Your Application</h2>

          <div className="space-y-8">
            {/* Job Category Selection */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Job Category</h3>
              <SearchableSelect
                label="Select Job Category (A-Z)"
                options={jobCategories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Choose a job category..."
                required
                error={errors.category}
              />
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Required Documents</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <DocumentUpload
                  label="Passport"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={setPassport}
                  selectedFile={passport}
                  required
                  error={errors.passport}
                />
                <DocumentUpload
                  label="National ID"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={setNationalId}
                  selectedFile={nationalId}
                  required
                  error={errors.nationalId}
                />
              </div>
            </div>

            {/* CV/Resume */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Professional Documents</h3>
              <DocumentUpload
                label="CV/Resume"
                accept=".pdf,.doc,.docx"
                onFileSelect={setCv}
                selectedFile={cv}
                required
                error={errors.cv}
              />
            </div>

            {/* Additional Certificates */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Additional Certificates (Optional)</h3>
              <div className="space-y-4">
                <DocumentUpload
                  label="Add Certificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={handleCertificateAdd}
                  selectedFile={null}
                />

                {certificates.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Uploaded Certificates:</h4>
                    {certificates.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-gray-700">{cert.name}</span>
                        <Button
                          onClick={() => removeCertificate(index)}
                          variant="outline"
                          size="sm"
                          type="button"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <Textarea
                label="Cover Letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full md:w-auto"
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                By submitting this application, you agree to our terms and conditions.
                All documents will be securely stored and processed according to our privacy policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default JobApplicationPage
