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
  const { isAuthorized, isLoading } = useProtectedRoute('job_seeker')
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
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 bg-slate-900 p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <LayoutDashboard /> Dashboard
        </h2>
        <nav className="space-y-2">
          <Link href="/job-seeker/dashboard" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/job-seeker/applications" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <FileText size={18} /> My Applications
          </Link>
          <Link href="/job-seeker/interviews" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Phone size={18} /> Interviews
          </Link>
          <Link href="/job-seeker/profile" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <User size={18} /> Profile
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
          className="max-w-4xl"
        >
          <h1 className="text-3xl font-bold">Welcome to AIRSWIFT Dashboard</h1>
          <p className="text-slate-400 mt-2">Your gateway to Canadian career opportunities. Track applications, schedule interviews, and manage your journey to success in Canada.</p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-2">Applications</h3>
              <p className="text-2xl font-bold text-indigo-400">{stats.applications}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-2">Interviews</h3>
              <p className="text-2xl font-bold text-indigo-400">{stats.interviews}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold mb-2">Offers</h3>
              <p className="text-2xl font-bold text-indigo-400">{stats.offers}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/jobs" className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl transition">
                <h3 className="font-semibold">Browse Jobs</h3>
                <p className="text-sm text-indigo-200">Find your next opportunity</p>
              </Link>
              <Link href="/job-seeker/profile" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl transition">
                <h3 className="font-semibold">Update Profile</h3>
                <p className="text-sm text-slate-300">Keep your info current</p>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default JobSeekerDashboard
