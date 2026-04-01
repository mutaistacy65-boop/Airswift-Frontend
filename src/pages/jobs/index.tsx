import React, { useState, useEffect } from 'react'
import MainLayout from '@/layouts/MainLayout'
import JobCard from '@/components/JobCard'
import Loader from '@/components/Loader'
import Input from '@/components/Input'
import { jobService, Job } from '@/services/jobService'
import { useNotification } from '@/context/NotificationContext'

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [jobType, setJobType] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, jobType, page])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (jobType) filters.type = jobType
      if (searchQuery) filters.search = searchQuery

      const data = await jobService.getAllJobs(page, 10)
      if (page === 1) {
        setJobs(data.jobs || data)
      } else {
        setJobs(prev => [...prev, ...(data.jobs || data)])
      }
      setHasMore(data.hasMore || false)
    } catch (error) {
      addNotification('Failed to load jobs', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Browse Jobs</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid md:grid-cols-2 gap-4">
          <Input
            label="Search Jobs"
            placeholder="Job title, company, location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
          />
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Job Type</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={jobType}
              onChange={(e) => {
                setJobType(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Jobs'}
                </button>
              </div>
            )}

            {jobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default JobsPage