import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

interface ApplicationFormProps {
  onSuccess?: () => void
}

export default function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [formData, setFormData] = useState({
    jobId: '',
    nationalId: '',
    phone: '',
    passport: null as File | null,
    cv: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs')
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.jobId) newErrors.jobId = 'Job is required'
    if (!formData.nationalId) newErrors.nationalId = 'National ID is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.passport) newErrors.passport = 'Passport is required'
    if (!formData.cv) newErrors.cv = 'CV is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const data = new FormData()
      data.append('jobId', formData.jobId)
      data.append('nationalId', formData.nationalId)
      data.append('phone', formData.phone)
      if (formData.passport) data.append('passport', formData.passport)
      if (formData.cv) data.append('cv', formData.cv)

      const response = await axios.post('/api/applications', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.success) {
        alert('Application submitted successfully!')
        if (onSuccess) onSuccess()
        router.push('/dashboard')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error submitting application'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Job Application</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Select Job *</label>
        <select
          name="jobId"
          value={formData.jobId}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a job</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>
        {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">National ID *</label>
        <input
          type="text"
          name="nationalId"
          value={formData.nationalId}
          onChange={handleChange}
          placeholder="Enter your national ID"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone Number *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Passport (PDF) *</label>
        <input
          type="file"
          name="passport"
          onChange={handleFileChange}
          accept=".pdf"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.passport && <p className="text-red-500 text-sm mt-1">{errors.passport}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">CV (PDF) *</label>
        <input
          type="file"
          name="cv"
          onChange={handleFileChange}
          accept=".pdf"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.cv && <p className="text-red-500 text-sm mt-1">{errors.cv}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}
