import React, { useState, useEffect } from 'react'
import api from '@/services/apiClient'

interface JobDropdownProps {
  onSelect: (job: any) => void
  defaultValue?: string
}

interface JobItem {
  id: string
  title: string
  category: string
  [key: string]: any
}

const JobDropdown: React.FC<JobDropdownProps> = ({ onSelect, defaultValue = '' }) => {
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📡 Fetching jobs from API...')
      const response = await api.get('/applications/job-options')

      // 🔍 STEP 1: Inspect the actual response
      console.log('JOBS RAW:', response.data)
      console.log('TYPE:', typeof response.data)

      const payload = response.data?.data || response.data
      console.log('PAYLOAD:', payload)
      console.log('Has jobs property:', payload && 'jobs' in payload)

      // 🔍 STEP 2: Handle different response formats (safe version)
      const jobsData = Array.isArray(payload)
        ? payload
        : payload?.jobs || {}

      console.log('SAFE JOBS:', jobsData)
      console.log('Jobs type:', typeof jobsData)
      console.log('Is array:', Array.isArray(jobsData))

      // 🔍 STEP 3: Flatten grouped jobs into a single array for dropdown
      const flatJobs: JobItem[] = []
      
      if (typeof jobsData === 'object' && !Array.isArray(jobsData)) {
        // jobsData is grouped by category (object with category keys)
        console.log('✅ Jobs are grouped by category')
        Object.entries(jobsData).forEach(([category, jobList]: [string, any]) => {
          console.log(`Processing category: ${category}`, jobList)
          if (Array.isArray(jobList)) {
            jobList.forEach((job: any) => {
              flatJobs.push({
                id: job.id?.toString() || job._id?.toString() || job.title,
                title: job.title || job.name || job.label || job.value,
                category,
                ...job,
              })
            })
          }
        })
      } else if (Array.isArray(jobsData)) {
        // jobsData is already a flat array
        console.log('✅ Jobs are already a flat array')
        jobsData.forEach((job: any) => {
          flatJobs.push({
            id: job.id?.toString() || job._id?.toString() || job.title,
            title: job.title || job.name || job.label || job.value,
            category: job.category || 'Jobs',
            ...job,
          })
        })
      }

      console.log('FINAL FLAT JOBS:', flatJobs)
      console.log('Total jobs count:', flatJobs.length)

      if (flatJobs.length === 0) {
        console.warn('⚠️ No jobs found after processing')
        setError('No jobs available. Please try again later.')
      }

      setJobs(flatJobs)
    } catch (err: any) {
      console.error('❌ Error fetching jobs:', err)
      console.error('Error message:', err.message)
      console.error('Error response:', err.response?.data)
      setError(err.response?.data?.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    setValue(selectedId)

    const selectedJob = jobs.find((job) => job.id.toString() === selectedId)
    if (selectedJob) {
      onSelect(selectedJob)
    }
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        ❌ {error}
      </div>
    )
  }

  const groupedJobs = jobs.reduce<Record<string, JobItem[]>>((acc, job) => {
    const category = job.category || 'Jobs'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(job)
    return acc
  }, {})

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={loading}
      style={{
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ddd',
      }}
    >
      <option value="">
        {loading ? 'Loading jobs...' : 'Select a job position...'}
      </option>
      {Array.isArray(jobs) && jobs.length > 0 ? (
        Object.entries(groupedJobs).map(([category, categoryJobs]) => (
          <optgroup key={category} label={category}>
            {categoryJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </optgroup>
        ))
      ) : (
        !loading && <option disabled>No jobs available</option>
      )}
    </select>
  )
}

export default JobDropdown
