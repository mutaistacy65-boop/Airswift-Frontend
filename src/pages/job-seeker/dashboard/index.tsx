import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import { jobService } from '@/services/jobService'
import { useNotification } from '@/context/NotificationContext'

const JobSeekerDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('job_seeker')
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0 })


  useEffect(() => {
    if (isAuthorized) {
      fetchStats()
    }
  }, [isAuthorized])

  const fetchStats = async () => {
    try {
      const data = await jobService.getMyApplications()
      setStats({
        applications: data.length,
        interviews: data.filter((app: any) => ['interview_scheduled', 'interview_completed'].includes(app.status)).length,
        offers: data.filter((app: any) => app.status === 'visa_ready').length,
      })
    } catch (error) {
      console.error('Failed to load stats', error)
    }
  }


  if (isLoading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/job-seeker/dashboard', icon: '📊' },
    { label: 'My Applications', href: '/job-seeker/applications', icon: '📋' },
    { label: 'Interviews', href: '/job-seeker/interviews', icon: '📞' },
    { label: 'Profile', href: '/job-seeker/profile', icon: '👤' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div>
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}!</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Total Applications</p>
            <p className="text-4xl font-bold text-primary">{stats.applications}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Interviews Scheduled</p>
            <p className="text-4xl font-bold text-secondary">{stats.interviews}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Visas Ready</p>
            <p className="text-4xl font-bold text-accent">{stats.offers}</p>
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/jobs"
              className="bg-primary text-white px-6 py-3 rounded hover:bg-opacity-90 text-center"
            >
              Browse Jobs
            </Link>
            <Link
              href="/job-seeker/applications"
              className="bg-secondary text-white px-6 py-3 rounded hover:bg-opacity-90 text-center"
            >
              My Applications
            </Link>
            <Link
              href="/job-seeker/interviews"
              className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 text-center"
            >
              My Interviews
            </Link>
            <Link
              href="/job-seeker/profile"
              className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600 text-center"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default JobSeekerDashboard