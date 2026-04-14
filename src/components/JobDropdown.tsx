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

  const normalizeJobs = (data: any): JobItem[] => {
    const rawJobs = data?.jobs

    if (!rawJobs) {
      return []
    }

    const flatJobs: JobItem[] = []

    if (Array.isArray(rawJobs)) {
      rawJobs.forEach((jobItem: any) => {
        if (typeof jobItem === 'string') {
          flatJobs.push({ id: jobItem, title: jobItem, category: 'Jobs' })
        } else {
          flatJobs.push({
            id: jobItem.id?.toString() || jobItem._id?.toString() || jobItem.title,
            title: jobItem.title || jobItem.name || jobItem.label || jobItem.value || String(jobItem.id || jobItem._id || ''),
            category: jobItem.category || 'Jobs',
            ...jobItem,
          })
        }
      })
    } else if (typeof rawJobs === 'object') {
      Object.entries(rawJobs).forEach(([category, jobList]) => {
        if (!Array.isArray(jobList)) return
        jobList.forEach((jobItem: any) => {
          if (typeof jobItem === 'string') {
            flatJobs.push({ id: jobItem, title: jobItem, category })
          } else {
            flatJobs.push({
              id: jobItem.id?.toString() || jobItem._id?.toString() || jobItem.title,
              title: jobItem.title || jobItem.name || jobItem.label || jobItem.value || String(jobItem.id || jobItem._id || ''),
              category,
              ...jobItem,
            })
          }
        })
      })
    }

    return flatJobs.sort((a, b) => a.title.localeCompare(b.title))
  }

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/applications/job-options')

      // 1. Inspect the actual response
      console.log("JOBS RAW:", response.data);
      console.log("TYPE:", typeof response.data);

      const flattenedJobs = normalizeJobs(response.data)
      setJobs(flattenedJobs)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs')
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
      {Object.entries(groupedJobs).map(([category, categoryJobs]) => (
        <optgroup key={category} label={category}>
          {categoryJobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

export default JobDropdown
