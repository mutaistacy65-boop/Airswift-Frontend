import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/layouts/MainLayout'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Textarea from '@/components/Textarea'
import Loader from '@/components/Loader'
import { jobService, Job } from '@/services/jobService'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { formatDate } from '@/utils/helpers'

const JobDetailPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated } = useAuth()
  const { addNotification } = useNotification()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (id) {
      fetchJob()
    }
  }, [id])

  const fetchJob = async () => {
    try {
      const data = await jobService.getJobById(id as string)
      setJob(data)
    } catch (error) {
      addNotification('Failed to load job details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!resume) {
      addNotification('Please upload your resume', 'error')
      return
    }

    setApplying(true)
    try {
      await jobService.applyForJob(id as string, resume, coverLetter)
      addNotification('Application submitted successfully!', 'success')
      setShowApplyModal(false)
      setCoverLetter('')
      setResume(null)
    } catch (error) {
      addNotification('Failed to submit application', 'error')
    } finally {
      setApplying(false)
    }
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
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{job.company}</p>
              <p className="text-gray-500">Posted on {formatDate(job.postedDate)}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8 pb-8 border-b">
              <div>
                <p className="text-gray-600">Location</p>
                <p className="text-lg font-semibold">{job.location}</p>
              </div>
              <div>
                <p className="text-gray-600">Salary</p>
                <p className="text-lg font-semibold">{job.salary}</p>
              </div>
              <div>
                <p className="text-gray-600">Job Type</p>
                <p className="text-lg font-semibold capitalize">{job.type}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3">✓</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Applications</p>
              <p className="text-3xl font-bold">{job.appliedCount}</p>
            </div>

            {isAuthenticated ? (
              user?.role === 'job_seeker' ? (
                <Button
                  onClick={() => setShowApplyModal(true)}
                  size="lg"
                  className="w-full"
                >
                  Apply Now
                </Button>
              ) : (
                <p className="text-gray-600 text-center">Admin cannot apply for jobs</p>
              )
            ) : (
              <Button
                onClick={() => router.push('/login')}
                size="lg"
                className="w-full"
              >
                Login to Apply
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        title="Apply for this Job"
        onClose={() => setShowApplyModal(false)}
        onConfirm={handleApply}
        confirmText={applying ? 'Submitting...' : 'Submit Application'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Resume (PDF only)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <Textarea
            label="Cover Letter (Optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            placeholder="Tell us why you're interested in this position..."
          />
        </div>
      </Modal>
    </MainLayout>
  )
}

export default JobDetailPage