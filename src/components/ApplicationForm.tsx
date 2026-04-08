import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

interface ApplicationFormProps {
  onSuccess?: () => void
}

const STORAGE_KEY = 'application_draft'

export default function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    jobId: '',
    nationalId: '',
    phone: '',
    passport: null as File | null,
    cv: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load draft on mount (try backend first, fallback to localStorage)
  useEffect(() => {
    const loadDraft = async () => {
      try {
        // Try backend first
        const response = await axios.get('/api/drafts')
        if (response.data.draft?.form_data) {
          setFormData(prev => ({
            ...prev,
            ...response.data.draft.form_data,
            // Files cannot be restored
            passport: null,
            cv: null,
          }))
          return
        }
      } catch (error) {
        console.log('Backend draft not available, trying localStorage')
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setFormData(prev => ({
            ...prev,
            ...parsedData,
            passport: null,
            cv: null,
          }))
        } catch (error) {
          console.error('Error loading local draft:', error)
        }
      }
    }

    loadDraft()
  }, [])

  // Auto-save on change (to both localStorage and backend)
  useEffect(() => {
    setSaved(false)
    const timeout = setTimeout(async () => {
      const dataToSave = {
        jobId: formData.jobId,
        nationalId: formData.nationalId,
        phone: formData.phone,
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))

      // Save to backend
      try {
        await axios.post('/api/drafts/save', { formData: dataToSave })
      } catch (error) {
        console.log('Backend save failed, localStorage saved')
      }

      setSaved(true)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [formData.jobId, formData.nationalId, formData.phone])

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

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.jobId) newErrors.jobId = 'Job is required'
      if (!formData.nationalId) newErrors.nationalId = 'National ID is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
    } else if (currentStep === 2) {
      if (!formData.passport) newErrors.passport = 'Passport is required'
      if (!formData.cv) newErrors.cv = 'CV is required'
    }

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

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(3)) return

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
        // Clear drafts after successful submission
        localStorage.removeItem(STORAGE_KEY)
        try {
          await axios.delete('/api/drafts')
        } catch (error) {
          console.log('Backend draft cleanup failed')
        }
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
    <div className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Application</h2>
        <p className="text-sm text-gray-500">
          {saved ? 'Draft saved ✓' : 'Saving...'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {step} of 3</span>
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP CONTENT */}
      {step === 1 && (
        <Step1
          formData={formData}
          errors={errors}
          jobs={jobs}
          onChange={handleChange}
          onNext={nextStep}
        />
      )}
      {step === 2 && (
        <Step2
          formData={formData}
          errors={errors}
          onFileChange={handleFileChange}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {step === 3 && (
        <Step3
          formData={formData}
          jobs={jobs}
          loading={loading}
          onSubmit={handleSubmit}
          onPrev={prevStep}
        />
      )}
    </div>
  )
}

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
