import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Phone, User, LogOut } from 'lucide-react'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'
import { jobService } from '@/services/jobService'
import { useNotification } from '@/context/NotificationContext'

const JobSeekerDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('user')
  const { user, logout } = useAuth()
  const { addNotification } = useNotification()
  const router = useRouter()
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

  const handleLogout = async () => {
    await logout()
    addNotification('Logged out successfully', 'success')
  }

  if (isLoading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
          <LayoutDashboard /> Dashboard
        </h2>
        <nav className="space-y-2">
          <Link href="/job-seeker/dashboard" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/job-seeker/applications" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
            <FileText size={18} /> My Applications
          </Link>
          <Link href="/job-seeker/interviews" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
            <Phone size={18} /> Interviews
          </Link>
          <Link href="/job-seeker/profile" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
            <User size={18} /> Profile
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 text-danger w-full text-left transition">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Track your applications, interviews, and offers in one place</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Applications</h3>
              <p className="text-3xl font-bold text-primary">{stats.applications}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Interviews Scheduled</h3>
              <p className="text-3xl font-bold text-secondary">{stats.interviews}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Job Offers</h3>
              <p className="text-3xl font-bold text-accent">{stats.offers}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/jobs" className="bg-primary hover:bg-green-600 p-4 rounded-lg transition text-white font-semibold">
                <h3>Browse Jobs</h3>
                <p className="text-sm text-green-100">Find your next opportunity</p>
              </Link>
              <Link href="/job-seeker/profile" className="bg-secondary hover:bg-blue-600 p-4 rounded-lg transition text-white font-semibold">
                <h3>Update Profile</h3>
                <p className="text-sm text-blue-100">Keep your info current</p>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-primary mb-4">🎯 Profile Strength</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Completion Status</span>
                  <span className="text-sm font-semibold text-primary">85%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Add more details to improve visibility with employers</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-secondary mb-4">💼 Recommended for You</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Senior Developer at TechCorp</li>
                <li>✓ Vancouver, BC • $85K-$110K</li>
                <li>✓ 3 new jobs matching your profile</li>
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose AIRSWIFT?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-green-100">
                <div className="text-2xl mb-3">🌍</div>
                <h4 className="font-semibold text-gray-900 mb-2">Top Canadian Jobs</h4>
                <p className="text-sm text-gray-600">Curated opportunities from leading employers across Canada</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
                <div className="text-2xl mb-3">🤖</div>
                <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Matching</h4>
                <p className="text-sm text-gray-600">Smart recommendations based on your skills</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
                <div className="text-2xl mb-3">⚡</div>
                <h4 className="font-semibold text-gray-900 mb-2">Fast-Track Interviews</h4>
                <p className="text-sm text-gray-600">Direct interview scheduling with hiring managers</p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Advance Your Career?</h2>
            <p className="text-gray-700 mb-6">Explore job opportunities, schedule interviews, and connect with top Canadian employers.</p>
            <div className="flex gap-4">
              <Link href="/jobs" className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                Explore Opportunities
              </Link>
              <Link href="/job-seeker/profile" className="bg-secondary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                Complete Profile
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default JobSeekerDashboard
