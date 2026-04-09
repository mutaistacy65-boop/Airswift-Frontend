import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/layouts/MainLayout'
import JobCard from '@/components/JobCard'
import Loader from '@/components/Loader'
import Input from '@/components/Input'
import { jobService, Job } from '@/services/jobService'
import { useNotification } from '@/context/NotificationContext'
import { useAuth } from '@/context/AuthContext'
import { JOB_TYPES } from '@/utils/constants'

const JobsPage: React.FC = () => {
  const router = useRouter()
  const { isLoading: authLoading, user, isAuthenticated } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { addNotification } = useNotification()

  // Strong authentication guard - redirect immediately if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Not authenticated, redirect to login
      router.replace('/login')
      return
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch jobs only when fully authenticated and loading is complete
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchJobs()
    }
  }, [searchQuery, location, jobType, page, authLoading, isAuthenticated, user])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const filters: any = {
        type: jobType || undefined,
        location: location || undefined,
        page,
        limit: 10,
      }

      const data = await jobService.searchJobs(searchQuery, filters)
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
    // Only render main content if authenticated and loading complete
    authLoading || !isAuthenticated ? (
      <Loader />
    ) : (
      <MainLayout>
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Browse Opportunities</h1>
          <p className="text-gray-600 mb-8">Find your next career opportunity from our curated job listings</p>

        {/* Filters */}
<div className="bg-white p-6 rounded-lg shadow-sm mb-8 grid lg:grid-cols-3 gap-4 border border-gray-100">
            <Input
              label="Search Jobs"
              placeholder="Job title, company, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
            />
            <Input
              label="Location"
              placeholder="Toronto, Nairobi, Remote..."
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
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
              {JOB_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
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
  )
}

export default JobsPage