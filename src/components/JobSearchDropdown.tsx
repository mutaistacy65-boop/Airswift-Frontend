import React, { useState, useEffect } from 'react'
import api from '@/lib/api'

interface JobSearchDropdownProps {
  value: string
  onChange: (jobId: string) => void
  error?: string
  required?: boolean
  placeholder?: string
}

export default function JobSearchDropdown({
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Type the job title you want',
}: JobSearchDropdownProps) {
  const [jobs, setJobs] = useState<any[]>([])
  const [jobText, setJobText] = useState(value)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const safeJobs = Array.isArray(jobs) ? jobs : []

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setLoadError(null)

      const response = await api.get('/jobs')
      console.log('✅ Jobs fetched:', response.data)

      const payload = response.data?.data || response.data || []
      const jobsData = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.jobs)
        ? payload.jobs
        : []

      // Sort jobs alphabetically A to Z by title
      const sortedJobs = jobsData.sort((a: any, b: any) =>
        a.title.localeCompare(b.title)
      )

      setJobs(sortedJobs)
      console.log('✅ Jobs sorted:', sortedJobs.length, 'items')
    } catch (err: any) {
      console.error('❌ Error fetching jobs:', err)
      setLoadError('Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setJobText(newValue)

    // Find matching job by title
    const matched = safeJobs.find(
      (job: any) => job.title.toLowerCase() === newValue.toLowerCase()
    )

    const newJobId = matched ? matched._id : ''
    setSelectedJobId(newJobId)
    onChange(newJobId)

    console.log('🔍 Job selection:')
    console.log('   Input:', newValue)
    console.log('   Matched ID:', newJobId || 'None')
  }

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          placeholder="Loading job titles..."
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
        />
      </div>
    )
  }

  if (loadError) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={loadError}
            disabled
            className="flex-1 px-4 py-2 border border-red-300 rounded-lg bg-red-50"
          />
          <button
            onClick={fetchJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Job Title {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id="job-input"
        type="text"
        list="job-options"
        value={jobText}
        onChange={handleJobInputChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />

      <datalist id="job-options">
        {safeJobs.map((job: any) => (
          <option key={job._id} value={job.title} />
        ))}
      </datalist>

      {/* Debug Info */}
      <div
        className="mt-2 text-xs text-gray-500"
        style={{ fontSize: '11px', opacity: 0.7 }}
      >
        <p>📊 Jobs loaded: {safeJobs.length}</p>
        <p>📝 Selected: {jobText || 'None'}</p>
        <p>🔑 Job ID: {selectedJobId || 'None'}</p>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

