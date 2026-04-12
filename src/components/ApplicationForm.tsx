import React, { useState, useEffect } from 'react'
import API from '@/services/apiClient'
import { useRouter } from 'next/router'
import DocumentUpload from './DocumentUpload'
import ContinueDraftModal from './ContinueDraftModal'

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
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [draftInfo, setDraftInfo] = useState<{ hasDraft: boolean; updated_at?: string } | null>(null)

  // Check for draft on mount
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const response = await fetch('https://airswift-backend-fjt3.onrender.com/api/drafts/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          },
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setDraftInfo(data)
          if (data.hasDraft) {
            setShowDraftModal(true)
          }
        }
      } catch (error) {
        console.log('Error checking draft, proceeding without')
        // If check fails, try to load draft directly
        loadDraft()
      }
    }

    const loadDraft = async () => {
      try {
        // Try local API first
        const response = await fetch('https://airswift-backend-fjt3.onrender.com/api/drafts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          },
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          if (data.draft?.form_data) {
            setFormData(prev => ({
              ...prev,
              ...data.draft.form_data,
              // Files cannot be restored
              passport: null,
              cv: null,
            }))
            return
          }
        }
      } catch (error) {
        console.log('Local draft not available, trying localStorage')
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

    checkDraft()
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

      // Save to local API
      try {
        await fetch('https://airswift-backend-fjt3.onrender.com/api/drafts/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify({ formData: dataToSave }),
        })
      } catch (error) {
        console.log('Local API save failed, localStorage saved')
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
      const response = await API.get('/jobs')
      console.log("JOBS RESPONSE:", response.data);
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleContinueDraft = async () => {
    setShowDraftModal(false)
    // Load the draft
    try {
      const response = await fetch('https://airswift-backend-fjt3.onrender.com/api/drafts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.draft?.form_data) {
          setFormData(prev => ({
            ...prev,
            ...data.draft.form_data,
            passport: null,
            cv: null,
          }))
        }
      }
    } catch (error) {
      console.log('Error loading draft, trying localStorage')
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
  }

  const handleStartFresh = () => {
    setShowDraftModal(false)
    // Clear any existing drafts
    localStorage.removeItem(STORAGE_KEY)
    try {
      fetch('https://airswift-backend-fjt3.onrender.com/api/drafts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })
    } catch (error) {
      console.log('Error clearing local draft')
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.jobId) {
        newErrors.jobId = 'Job title is required'
        alert("Please enter a job title")
        return false
      }
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

    // Check if using mock token
    const token = localStorage.getItem('token')
    if (token && token.startsWith('mock-')) {
      alert('You are using a demo account. Please login with real credentials to submit applications.')
      return
    }

    setLoading(true)

    try {
      const data = new FormData()
      data.append('jobId', formData.jobId)
      data.append('nationalId', formData.nationalId)
      data.append('phone', formData.phone)
      if (formData.passport) data.append('passport', formData.passport)
      if (formData.cv) data.append('cv', formData.cv)

      // Use fetch instead of axios for FormData to ensure proper multipart/form-data handling
      const response = await fetch('https://airswift-backend-fjt3.onrender.com/api/applications', {
        method: 'POST',
        body: data,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        alert('Application submitted successfully!')
        // Clear drafts after successful submission
        localStorage.removeItem(STORAGE_KEY)
        try {
          await fetch('https://airswift-backend-fjt3.onrender.com/api/drafts', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            },
            credentials: 'include',
          })
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
      <form onSubmit={handleSubmit}>
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
            onNext={nextStep}
            onPrev={prevStep}
            setFormData={setFormData}
          />
        )}
        {step === 3 && (
          <Step3
            formData={formData}
            jobs={jobs}
            loading={loading}
            onPrev={prevStep}
          />
        )}
      </form>

      <ContinueDraftModal
        open={showDraftModal}
        onContinue={handleContinueDraft}
        onStartFresh={handleStartFresh}
        lastSaved={draftInfo?.updated_at}
      />
    </div>
  )
}

function Step1({ formData, errors, jobs, onChange, onNext }: any) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Job Title *</label>
        <input
          type="text"
          name="jobId"
          value={formData.jobId}
          onChange={onChange}
          placeholder="Enter the job title you want to apply for"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">National ID *</label>
        <input
          type="text"
          name="nationalId"
          value={formData.nationalId}
          onChange={onChange}
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
          onChange={onChange}
          placeholder="Enter your phone number"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </>
  )
}

function Step2({ formData, errors, onNext, onPrev, setFormData }: any) {
  return (
    <>
      <div>
        <DocumentUpload
          label="Passport (PDF)"
          accept=".pdf"
          selectedFile={formData.passport}
          onFileSelect={(file) => setFormData((prev: any) => ({ ...prev, passport: file }))}
          required
          error={errors.passport}
        />
      </div>

      <div>
        <DocumentUpload
          label="CV (PDF)"
          accept=".pdf"
          selectedFile={formData.cv}
          onFileSelect={(file) => setFormData((prev: any) => ({ ...prev, cv: file }))}
          required
          error={errors.cv}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </>
  )
}

function Step3({ formData, jobs, loading, onPrev }: any) {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Review Your Application</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Job:</strong> {formData.jobId || 'N/A'}</p>
          <p><strong>National ID:</strong> {formData.nationalId}</p>
          <p><strong>Phone:</strong> {formData.phone}</p>
          <p><strong>Passport:</strong> {formData.passport?.name || 'Not uploaded'}</p>
          <p><strong>CV:</strong> {formData.cv?.name || 'Not uploaded'}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </>
  )
}
