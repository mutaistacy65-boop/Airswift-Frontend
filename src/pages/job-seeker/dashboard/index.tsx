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

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">🎯 Profile Strength</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-300">Completion Status</span>
                  <span className="text-sm font-semibold text-green-400">85%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <p className="text-sm text-slate-400">Add more details to your profile to improve visibility with employers</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">💼 Recommended for You</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✓ 3 new jobs matching your skills</li>
                <li>✓ Senior Developer at TechCorp</li>
                <li>✓ Vancouver, BC • $85K-$110K</li>
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Why Choose AIRSWIFT?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 p-5 rounded-lg border border-slate-700/50">
                <div className="text-2xl mb-3">🌍</div>
                <h4 className="font-semibold mb-2">Access to Top Canadian Jobs</h4>
                <p className="text-sm text-slate-400">Curated opportunities from leading employers across Canada</p>
              </div>
              <div className="bg-slate-800/40 p-5 rounded-lg border border-slate-700/50">
                <div className="text-2xl mb-3">🤖</div>
                <h4 className="font-semibold mb-2">AI-Powered Matching</h4>
                <p className="text-sm text-slate-400">Smart recommendations based on your skills and experience</p>
              </div>
              <div className="bg-slate-800/40 p-5 rounded-lg border border-slate-700/50">
                <div className="text-2xl mb-3">⚡</div>
                <h4 className="font-semibold mb-2">Fast-Track Interviews</h4>
                <p className="text-sm text-slate-400">Direct interview scheduling with hiring managers</p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30">
            <h2 className="text-2xl font-semibold mb-3">Ready to Advance Your Career?</h2>
            <p className="text-slate-300 mb-6">Complete your profile, explore job opportunities, and connect with top Canadian employers. Your dream job is just a few clicks away.</p>
            <div className="flex gap-4">
              <Link href="/jobs" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-semibold transition">
                Explore Opportunities
              </Link>
              <Link href="/job-seeker/profile" className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-semibold transition">
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
