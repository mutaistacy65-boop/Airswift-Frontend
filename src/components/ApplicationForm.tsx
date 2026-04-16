import React, { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/router'
import DocumentUpload from './DocumentUpload'
import ContinueDraftModal from './ContinueDraftModal'
import JobSearchDropdown from './JobSearchDropdown'
import { debugToken, forcePostWithToken } from '@/utils/authDebug'

interface ApplicationFormProps {
  onSuccess?: () => void
}

const STORAGE_KEY = 'application_draft'

export default function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const [debugMode, setDebugMode] = useState(false);
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState(1)
  const [applicationData, setApplicationData] = useState({
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
        const response = await api.get('/drafts/check')
        const data = response.data || {}
        setDraftInfo(data)
        if (data.hasDraft) {
          setShowDraftModal(true)
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
        const response = await api.get('/drafts')
        const data = response.data || {}
        if (data.draft?.form_data) {
          setApplicationData(prev => ({
            ...prev,
            ...data.draft.form_data,
            // Files cannot be restored
            passport: null,
            cv: null,
          }))
          return
        }
      } catch (error) {
        console.log('Local draft not available, trying localStorage')
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setApplicationData(prev => ({
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
        jobId: applicationData.jobId,
        nationalId: applicationData.nationalId,
        phone: applicationData.phone,
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))

      // Save to local API
      try {
        await api.post('/drafts/save', { formData: dataToSave })
      } catch (error) {
        console.log('Local API save failed, localStorage saved')
      }

      setSaved(true)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [applicationData.jobId, applicationData.nationalId, applicationData.phone])

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs')
      console.log("JOBS RESPONSE:", response.data);
      const jobs = Array.isArray(response.data)
        ? response.data
        : response.data?.jobs || []
      const sortedJobs = [...jobs].sort((a: any, b: any) => {
        if (typeof a === 'string' && typeof b === 'string') {
          return a.localeCompare(b)
        }
        if (a?.title && b?.title) {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
      setJobs(sortedJobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleContinueDraft = async () => {
    setShowDraftModal(false)
    // Load the draft
    try {
      const response = await api.get('/drafts')
      const data = response.data || {}
      if (data.draft?.form_data) {
        setApplicationData(prev => ({
          ...prev,
          ...data.draft.form_data,
          passport: null,
          cv: null,
        }))
      }
    } catch (error) {
      console.log('Error loading draft, trying localStorage')
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setApplicationData(prev => ({
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
      api.delete('/drafts')
    } catch (error) {
      console.log('Error clearing local draft')
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!applicationData.jobId) {
        newErrors.jobId = 'Job title is required'
        alert("Please enter a job title")
        return false
      }
      if (!applicationData.nationalId) newErrors.nationalId = 'National ID is required'
      if (!applicationData.phone) newErrors.phone = 'Phone number is required'
    } else if (currentStep === 2) {
      if (!applicationData.passport) newErrors.passport = 'Passport is required'
      if (!applicationData.cv) newErrors.cv = 'CV is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files) {
      setApplicationData(prev => ({
        ...prev,
        [name]: files[0],
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setApplicationData(prev => ({
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
      console.log('Submitting application with data:', {
        jobId: applicationData.jobId,
        nationalId: applicationData.nationalId,
        phone: applicationData.phone,
        hasPassport: !!applicationData.passport,
        hasCV: !!applicationData.cv,
        token: localStorage.getItem('token') ? 'present' : 'missing'
      })

      // Extract values to match exact specification
      const { jobId, nationalId, phone, passport: passportFile, cv: cvFile } = applicationData;

      const formData = new FormData();

      formData.append("jobId", jobId);
      formData.append("nationalId", nationalId);
      formData.append("phone", phone);
      formData.append("passport", passportFile);
      formData.append("cv", cvFile);

      console.log('📋 Sending FormData with keys:', Array.from(formData.keys()));

      // 🔍 Debug: Log all FormData entries before sending
      console.log('🔍 FormData entries debug:');
      for (let pair of formData.entries()) {
        console.log(`   ${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name}, ${pair[1].size} bytes)` : pair[1]);
      }

      // ✅ DO NOT manually set Authorization header - interceptor handles it
      // ✅ DO NOT set Content-Type for FormData - axios handles it automatically

      let response;

      if (debugMode) {
        // 🚨 HARD FIX: Force attach token manually (bypass interceptor)
        console.log('🚨 USING HARD FIX MODE - Force attaching token manually');
        response = await forcePostWithToken('/applications', formData);
      } else {
        // ✅ NORMAL MODE: Use API instance with interceptor
        console.log('✅ USING NORMAL MODE - API instance with interceptor');
        response = await api.post('/applications', formData);
      }

      const result = response.data

      if (result.success) {
        alert('Application submitted successfully!')
        // Clear drafts after successful submission
        localStorage.removeItem(STORAGE_KEY)
        try {
          await api.delete('/drafts')
        } catch (error) {
          console.log('Backend draft cleanup failed')
        }
        if (onSuccess) onSuccess()
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Application submission error:', error)
      console.error('Error response:', error.response?.data || error.message)
      console.error('Error status:', error.response?.status || error.status)

      let message = 'Error submitting application'

      if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.status === 401) {
        message = 'Authentication failed. Please login again.'
      } else if (error.status === 400) {
        message = 'Invalid application data. Please check all fields.'
      } else if (error.status === 413) {
        message = 'Files are too large. Please reduce file sizes.'
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.'
      } else if (!navigator.onLine) {
        message = 'No internet connection. Please check your connection.'
      }

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
            formData={applicationData}
            errors={errors}
            jobs={jobs}
            onChange={handleChange}
            onNext={nextStep}
          />
        )}
        {step === 2 && (
          <Step2
            formData={applicationData}
            errors={errors}
            onNext={nextStep}
            onPrev={prevStep}
            setFormData={setApplicationData}
          />
        )}
        {step === 3 && (
          <Step3
            formData={applicationData}
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
        <JobSearchDropdown
          value={formData.jobId}
          onChange={(jobTitle) =>
            onChange({
              target: { name: 'jobId', value: jobTitle },
            } as any)
          }
          error={errors.jobId}
          required
        />
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
    <div>
      {/* ✅ Button is inside return */}
      <div>
        {/* ...existing code for Step3, but NO debugMode or setDebugMode here... */}
      </div>
    )
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
    </div>
  )
}
