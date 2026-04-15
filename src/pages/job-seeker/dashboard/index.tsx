import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Phone, User, LogOut, Bell, Bookmark, TrendingUp, CheckCircle, Clock, Calendar, Star, Target } from 'lucide-react'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'
import { jobService } from '@/services/jobService'
import { useNotification } from '@/context/NotificationContext'
import { useSocket } from '@/hooks/useSocket'
import API from '@/services/apiClient'

const JobSeekerDashboard: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('user')
  const { user, logout } = useAuth()
  const { addNotification } = useNotification()
  const router = useRouter()
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0 })
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([])
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [profileCompletion, setProfileCompletion] = useState(75)
  const [application, setApplication] = useState(null)

  const { subscribe } = useSocket()

  const [hasApplied, setHasApplied] = useState<boolean | null>(null)

  useEffect(() => {
    if (isAuthorized) {
      checkApplicationStatus()
      fetchDashboardData()
    }
  }, [isAuthorized])

  // Check if user has applied - redirect to apply if not
  const checkApplicationStatus = async () => {
    try {
      const res = await API.get('/users/status')
      const applied = res.data?.hasApplied || false
      setHasApplied(applied)

      if (!applied) {
        router.push('/apply')
      }
    } catch (err) {
      console.error('Failed to check application status:', err)
      // On error, assume they haven't applied and redirect
      router.push('/apply')
    }
  }

  // Real-time listener for application updates
  useEffect(() => {
    const unsubscribe = subscribe('applicationUpdated', (data) => {
      console.log('Application updated:', data)
      // Refresh dashboard data when application status changes
      fetchDashboardData()
      // Show notification to user
      addNotification(`Your application status has been updated to ${data.status}`, 'success')
    })

    return unsubscribe
  }, [subscribe, addNotification, fetchDashboardData])

  useEffect(() => {
    const unsubscribe = subscribe('payment_success', (data: any) => {
      console.log('Payment success event received:', data)
      fetchDashboardData()
      addNotification('💰 Payment successful!', 'success')
    })

    return unsubscribe
  }, [subscribe, addNotification, fetchDashboardData])

  // Fetch user's application
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://airswift-backend-fjt3.onrender.com/api/applications/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setApplication(data);

      } catch (err) {
        console.error("Error fetching application:", err);
      }
    };

    fetchApplication();
  }, []);

  async function fetchDashboardData() {
    try {
      const applicationsData = await jobService.getMyApplications()
      setStats({
        applications: applicationsData.length,
        interviews: applicationsData.filter((app: any) => ['interview_scheduled', 'interview_completed'].includes(app.status)).length,
        offers: applicationsData.filter((app: any) => app.status === 'visa_ready').length,
      })

      // Set recent applications (last 3)
      setRecentApplications(applicationsData.slice(0, 3))

      // Mock upcoming interviews
      setUpcomingInterviews([
        {
          id: '1',
          jobTitle: 'Senior Software Engineer',
          company: 'TechCorp',
          date: '2026-04-10',
          time: '14:00',
          type: 'Video Call',
          status: 'scheduled'
        },
        {
          id: '2',
          jobTitle: 'Full Stack Developer',
          company: 'StartupXYZ',
          date: '2026-04-12',
          time: '10:30',
          type: 'Phone Interview',
          status: 'scheduled'
        }
      ])

      // Mock saved jobs
      setSavedJobs([
        {
          id: '1',
          title: 'React Developer',
          company: 'InnovateLabs',
          location: 'Vancouver, BC',
          salary: '$80K - $100K',
          savedDate: '2026-04-05'
        },
        {
          id: '2',
          title: 'DevOps Engineer',
          company: 'CloudTech',
          location: 'Toronto, ON',
          salary: '$90K - $120K',
          savedDate: '2026-04-03'
        }
      ])

      // Mock notifications
      setNotifications([
        {
          id: '1',
          type: 'application_update',
          message: 'Your application for Senior Developer at TechCorp has been reviewed',
          timestamp: '2026-04-06T10:30:00Z',
          read: false
        },
        {
          id: '2',
          type: 'new_jobs',
          message: '3 new jobs match your profile',
          timestamp: '2026-04-05T15:45:00Z',
          read: false
        },
        {
          id: '3',
          type: 'interview_reminder',
          message: 'Interview reminder: TechCorp interview tomorrow at 2:00 PM',
          timestamp: '2026-04-05T09:00:00Z',
          read: true
        }
      ])

    } catch (error) {
      console.error('Failed to load dashboard data', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    addNotification('Logged out successfully', 'success')
  }

  if (isLoading || hasApplied === null) {
    return <Loader fullScreen />
  }

  if (!isAuthorized || hasApplied === false) {
    return null // Will redirect in useEffect
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
          className="max-w-7xl"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600">Track your applications, interviews, and offers in one place</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">Active applications</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-600">Next: Tomorrow 2:00 PM</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Job Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.offers}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">Ready for visa process</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Strength</p>
                  <p className="text-2xl font-bold text-gray-900">{profileCompletion}%</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: `${profileCompletion}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Display */}
          {application ? (
            <div className="bg-white shadow p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4">Your Application</h2>

              <p><strong>Job:</strong> {application.jobId?.title}</p>
              <p><strong>Status:</strong> {application.status}</p>
              <p><strong>Phone:</strong> {application.phone}</p>
              <p><strong>National ID:</strong> {application.nationalId}</p>

              <p className="mt-2 text-sm text-gray-500">
                Applied on: {new Date(application.createdAt).toLocaleDateString()}
              </p>

              {/* Files */}
              <div className="mt-4">
                <a href={application.cv} target="_blank">📄 View CV</a>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow p-6 rounded-lg mb-8">
              <p>No application submitted yet.</p>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                  <Link href="/job-seeker/applications" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
                </div>
                <div className="space-y-4">
                  {recentApplications.length > 0 ? recentApplications.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{app.jobTitle || 'Job Title'}</h3>
                        <p className="text-sm text-gray-600">{app.company || 'Company'}</p>
                        <p className="text-xs text-gray-500">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'shortlisted' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No applications yet</p>
                      <Link href="/jobs" className="text-blue-600 hover:text-blue-800 text-sm">Browse jobs</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Interviews */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Interviews</h2>
                  <Link href="/job-seeker/interviews" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
                </div>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{interview.jobTitle}</h3>
                        <p className="text-sm text-gray-600">{interview.company}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(interview.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {interview.time}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {interview.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Saved Jobs */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Saved Jobs</h3>
                  <Bookmark className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-gray-600">{job.company} • {job.location}</p>
                      <p className="text-xs text-green-600 font-medium">{job.salary}</p>
                    </div>
                  ))}
                </div>
                <Link href="/jobs?saved=true" className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block">View all saved jobs</Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/jobs" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Browse Jobs</span>
                  </Link>
                  <Link href="/job-seeker/profile" className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
                    <User className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Update Profile</span>
                  </Link>
                  <Link href="/job-seeker/applications" className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Track Applications</span>
                  </Link>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg text-sm ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                      <p className="text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 mt-3">View all notifications</button>
              </div>
            </div>
          </div>

          {/* Why Choose TALEX Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Choose TALEX?</h2>
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
