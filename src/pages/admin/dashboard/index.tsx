import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Phone, Users, Settings, LogOut, Briefcase, DollarSign } from 'lucide-react'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import { jobCategoryService } from '@/services/jobCategoryService'
import { JobCategoryStats, InterviewPipelineItem } from '@/types/jobCategories'

const AdminDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { user, logout } = useAuth()
  const { addNotification } = useNotification()
  const router = useRouter()

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

  const handleLogout = async () => {
    await logout()
    addNotification('Logged out successfully', 'success')
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 bg-slate-900 p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <LayoutDashboard /> Admin Dashboard
        </h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/jobs" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Briefcase size={18} /> Manage Jobs
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <FileText size={18} /> Categories
          </Link>
          <Link href="/admin/applications" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <FileText size={18} /> Applications
          </Link>
          <Link href="/admin/interviews" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Phone size={18} /> Interviews
          </Link>
          <Link href="/admin/email-templates" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Users size={18} /> Email Templates
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Settings size={18} /> Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 text-red-400 w-full text-left">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl"
        >
          <h1 className="text-3xl font-bold">Welcome to AIRSWIFT Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">Role-based secure area (protected route)</p>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Briefcase size={20} /> Total Jobs
              </h3>
              <p className="text-2xl font-bold text-indigo-400">{stats.totalJobs}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FileText size={20} /> Applications
              </h3>
              <p className="text-2xl font-bold text-indigo-400">{stats.totalApplications}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Phone size={20} /> Interviews
              </h3>
              <p className="text-2xl font-bold text-indigo-400">{stats.interviewScheduled + stats.interviewCompleted}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <DollarSign size={20} /> Revenue
              </h3>
              <p className="text-2xl font-bold text-indigo-400">${stats.totalRevenue}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Category Statistics</h3>
              <div className="space-y-2">
                {categoryStats.slice(0, 5).map((cat) => (
                  <div key={cat.categoryId} className="flex justify-between">
                    <span>{cat.categoryName}</span>
                    <span className="text-indigo-400">{cat.totalApplications} apps</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Interview Pipeline</h3>
              <div className="space-y-2">
                {interviewPipeline.slice(0, 5).map((item) => (
                  <div key={item.applicantId} className="flex justify-between">
                    <span>{item.applicantName}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.currentStage === 'interview_scheduled' ? 'bg-purple-600' :
                      item.currentStage === 'interview_completed' ? 'bg-indigo-600' :
                      'bg-slate-600'
                    }`}>
                      {item.currentStage.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default AdminDashboard
