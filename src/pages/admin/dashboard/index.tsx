import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import { jobCategoryService } from '@/services/jobCategoryService'
import { JobCategoryStats, InterviewPipelineItem } from '@/types/jobCategories'

const AdminDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    interviewScheduled: 0,
    interviewCompleted: 0,
    visaProcessing: 0,
    visaReady: 0,
    totalRevenue: 0
  })
  const [categoryStats, setCategoryStats] = useState<JobCategoryStats[]>([])
  const [interviewPipeline, setInterviewPipeline] = useState<InterviewPipelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthorized) {
      fetchDashboardData()
    }
  }, [isAuthorized])

  const fetchDashboardData = async () => {
    try {
      // Fetch category statistics
      const catStats = await jobCategoryService.getCategoryStats()
      setCategoryStats(catStats)

      // Fetch interview pipeline
      const pipeline = await jobCategoryService.getInterviewPipeline()
      setInterviewPipeline(pipeline)

      // Calculate overall stats
      const totalJobs = catStats.reduce((sum, cat) => sum + cat.totalJobs, 0)
      const totalApplications = catStats.reduce((sum, cat) => sum + cat.totalApplications, 0)
      const pendingApplications = catStats.reduce((sum, cat) => sum + cat.pendingApplications, 0)
      const acceptedApplications = catStats.reduce((sum, cat) => sum + cat.acceptedApplications, 0)
      const interviewScheduled = catStats.reduce((sum, cat) => sum + cat.interviewScheduled, 0)
      const interviewCompleted = catStats.reduce((sum, cat) => sum + cat.interviewCompleted, 0)
      const visaProcessing = catStats.reduce((sum, cat) => sum + cat.visaProcessing, 0)
      const visaReady = catStats.reduce((sum, cat) => sum + cat.visaReady, 0)

      // Calculate revenue (interview fees + visa fees)
      const interviewRevenue = (interviewScheduled + interviewCompleted) * 3 // 3 KSH per interview
      const visaRevenue = (visaProcessing + visaReady) * 30000 // 30,000 KSH per visa
      const totalRevenue = interviewRevenue + visaRevenue

      setStats({
        totalJobs,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        interviewScheduled,
        interviewCompleted,
        visaProcessing,
        visaReady,
        totalRevenue
      })
    } catch (error) {
      addNotification('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800'
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800'
      case 'visa_payment_pending': return 'bg-orange-100 text-orange-800'
      case 'visa_processing': return 'bg-teal-100 text-teal-800'
      case 'visa_ready': return 'bg-emerald-100 text-emerald-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Manage Jobs', href: '/admin/jobs', icon: '💼' },
    { label: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { label: 'Applications', href: '/admin/applications', icon: '📋' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Email Templates', href: '/admin/email-templates', icon: '📧' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  // Sort categories alphabetically for A-Z display
  const sortedCategories = [...categoryStats].sort((a, b) => a.categoryName.localeCompare(b.categoryName))

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Total Jobs</p>
            <p className="text-4xl font-bold text-primary">{stats.totalJobs}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Total Applications</p>
            <p className="text-4xl font-bold text-secondary">{stats.totalApplications}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Pending Review</p>
            <p className="text-4xl font-bold text-yellow-600">{stats.pendingApplications}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Interviews</p>
            <p className="text-4xl font-bold text-purple-600">{stats.interviewScheduled + stats.interviewCompleted}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Visas Ready</p>
            <p className="text-4xl font-bold text-green-600">{stats.visaReady}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Revenue Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 mb-2">Interview Fees (3 KSH each)</p>
              <p className="text-3xl font-bold text-blue-600">
                KES {(stats.interviewScheduled + stats.interviewCompleted) * 3}
              </p>
              <p className="text-sm text-gray-500">{stats.interviewScheduled + stats.interviewCompleted} interviews</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Visa Fees (30,000 KSH each)</p>
              <p className="text-3xl font-bold text-green-600">
                KES {(stats.visaProcessing + stats.visaReady) * 30000}
              </p>
              <p className="text-sm text-gray-500">{stats.visaProcessing + stats.visaReady} visas</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Total Revenue</p>
              <p className="text-4xl font-bold text-primary">
                KES {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">All time</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* A-Z Role Counts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">A-Z Job Categories</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedCategories.map((category) => (
                <div key={category.categoryId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-gray-900">{category.categoryName}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({category.totalJobs} jobs, {category.totalApplications} applications)
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">📋 {category.pendingApplications}</span>
                    <span className="text-green-600">✅ {category.acceptedApplications}</span>
                    <span className="text-purple-600">📞 {category.interviewScheduled}</span>
                    <span className="text-indigo-600">🎓 {category.interviewCompleted}</span>
                    <span className="text-emerald-600">🛂 {category.visaReady}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Pipeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Interview Pipeline</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {interviewPipeline.slice(0, 10).map((item) => (
                <div key={item.applicantId} className="p-3 border border-gray-200 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{item.applicantName}</p>
                      <p className="text-sm text-gray-600">{item.jobTitle} • {item.categoryName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(item.currentStage)}`}>
                      {item.currentStage.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.daysInStage} days • {item.nextAction || 'Waiting'}
                    </span>
                  </div>
                </div>
              ))}

              {interviewPipeline.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No applicants in interview pipeline</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/jobs">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Manage Jobs
              </Button>
            </Link>
            <Link href="/admin/applications">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Review Applications
              </Button>
            </Link>
            <Link href="/admin/interviews">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Schedule Interviews
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Manage Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard