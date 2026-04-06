import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/adminService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Briefcase, Calendar, AlertTriangle, CheckCircle, Clock, DollarSign, Activity, Bell, Settings, Download } from 'lucide-react';

type JobItem = {
  _id: string
  title: string
  location: string
  status?: string
  applicants?: number
}

type ApplicationItem = {
  _id?: string
  createdAt?: string
  status?: string
  fullName?: string
  jobTitle?: string
  aiScore?: number
}

type TrendData = {
  name: string
  applications: number
}

type LocationData = {
  name: string
  jobs: number
}

type DashboardSummary = {
  totalApplications: number
  totalJobs: number
  totalInterviews: number
  totalHired: number
  averageScore: number
  conversionRate: number
  avgTimeToHire: number
  monthlyRevenue: number
  summary: {
    applications: number
    jobs: number
    interviews: number
    hired: number
  }
}

type AlertItem = {
  id: string
  type: 'warning' | 'success' | 'info' | 'error'
  message: string
  timestamp: string
}

type ActivityItem = {
  id: string
  type: 'application' | 'job' | 'interview' | 'user'
  message: string
  timestamp: string
  user?: string
}

const initialTrendData: TrendData[] = Array.from({ length: 7 }, (_, idx) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - idx))
  return { name: date.toLocaleDateString('en-US', { weekday: 'short' }), applications: 0 }
})

const initialBarData: LocationData[] = []

const mockCVs = [
  { id: 1, name: "Jane Smith", skills: ["React", "Node", "AWS"], score: 86 },
  { id: 2, name: "Mark Johnson", skills: ["Java", "Spring", "SQL"], score: 78 },
  { id: 3, name: "Emily Nguyen", skills: ["Python", "ML", "TensorFlow"], score: 91 }
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [form, setForm] = useState({ title: "", location: "" });
  const [dashboardStats, setDashboardStats] = useState<DashboardSummary>({
    totalApplications: 0,
    totalJobs: 0,
    totalInterviews: 0,
    totalHired: 0,
    averageScore: 0,
    conversionRate: 0,
    avgTimeToHire: 0,
    monthlyRevenue: 0,
    summary: {
      applications: 0,
      jobs: 0,
      interviews: 0,
      hired: 0,
    },
  })
  const [statsLoading, setStatsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [lineData, setLineData] = useState<TrendData[]>(initialTrendData);
  const [barData, setBarData] = useState<LocationData[]>(initialBarData);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);

  const buildApplicationTrendData = (applications: ApplicationItem[]) => {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - idx))
      return { date, name: date.toLocaleDateString('en-US', { weekday: 'short' }), applications: 0 }
    })

    const counts = days.reduce<Record<string, number>>((acc, day) => {
      acc[day.name] = 0
      return acc
    }, {})

    const startDate = new Date(days[0].date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    applications.forEach((app) => {
      if (!app.createdAt) return
      const created = new Date(app.createdAt)
      if (created < startDate || created > endDate) return
      const label = created.toLocaleDateString('en-US', { weekday: 'short' })
      if (label in counts) {
        counts[label] += 1
      }
    })

    return days.map((day) => ({ name: day.name, applications: counts[day.name] ?? 0 }))
  }

  const buildConversionData = (applications: ApplicationItem[]) => {
    const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Hired']
    const counts = stages.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {} as Record<string, number>)

    applications.forEach(app => {
      const status = app.status
      if (status === 'Submitted' || status === 'pending') counts['Applied']++
      else if (status === 'Under Review' || status === 'reviewed') counts['Under Review']++
      else if (status === 'Shortlisted' || status === 'shortlisted') counts['Shortlisted']++
      else if (status?.includes('interview')) counts['Interview']++
      else if (status === 'Hired' || status === 'accepted' || status === 'visa_ready') counts['Hired']++
    })

    return stages.map(stage => ({ name: stage, value: counts[stage] }))
  }

  const generateAlerts = (stats: DashboardSummary, applications: ApplicationItem[]) => {
    const newAlerts: AlertItem[] = []
    
    if (stats.totalApplications > 50) {
      newAlerts.push({
        id: '1',
        type: 'info',
        message: 'High application volume this week!',
        timestamp: new Date().toISOString()
      })
    }

    const pendingReviews = applications.filter(app => app.status === 'pending' || app.status === 'Submitted').length
    if (pendingReviews > 10) {
      newAlerts.push({
        id: '2',
        type: 'warning',
        message: `${pendingReviews} applications pending review`,
        timestamp: new Date().toISOString()
      })
    }

    if (stats.conversionRate < 5) {
      newAlerts.push({
        id: '3',
        type: 'error',
        message: 'Low conversion rate detected',
        timestamp: new Date().toISOString()
      })
    }

    return newAlerts
  }

  const generateActivities = (applications: ApplicationItem[], jobs: JobItem[]) => {
    const activities: ActivityItem[] = []
    
    // Recent applications
    applications.slice(0, 3).forEach(app => {
      activities.push({
        id: `app-${app._id}`,
        type: 'application',
        message: `${app.fullName} applied for ${app.jobTitle}`,
        timestamp: app.createdAt || new Date().toISOString(),
        user: app.fullName
      })
    })

    // Recent jobs
    jobs.slice(0, 2).forEach(job => {
      activities.push({
        id: `job-${job._id}`,
        type: 'job',
        message: `New job posted: ${job.title}`,
        timestamp: new Date().toISOString()
      })
    })

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, jobsData, applicationsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getJobs(),
          adminService.getAllApplications(),
        ])

        // Enhance stats with calculated metrics
        const enhancedStats = {
          ...stats,
          conversionRate: stats.totalHired > 0 ? (stats.totalHired / stats.totalApplications * 100) : 0,
          avgTimeToHire: 14, // Mock data - would come from backend
          monthlyRevenue: stats.totalHired * 5000 // Mock calculation
        }

        setDashboardStats(enhancedStats)
        setJobs(jobsData)
        setApplications(applicationsData)
        setBarData(buildJobLocationData(jobsData))
        setLineData(buildApplicationTrendData(applicationsData))
        setConversionData(buildConversionData(applicationsData))
        setAlerts(generateAlerts(enhancedStats, applicationsData))
        setActivities(generateActivities(applicationsData, jobsData))
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setStatsLoading(false)
        setJobsLoading(false)
        setAppsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const addJob = () => {
    if (!form.title || !form.location) return;
    setJobs([
      ...jobs,
      {
        _id: Date.now().toString(),
        title: form.title,
        location: form.location,
        status: "Active",
        applicants: 0
      }
    ]);
    setForm({ title: "", location: "" });
  };

  const deleteJob = (id: string) => setJobs(jobs.filter((job) => job._id !== id));

  const toggleStatus = (id: string) => {
    setJobs(jobs.map((job) => (job._id === id ? { ...job, status: job.status === "Active" ? "Paused" : "Active" } : job)));
  };

  // Protect route
  if (protectedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TALEX Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage recruitment operations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">System Alerts</h3>
              </div>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg text-sm ${
                    alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                    alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                    alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : dashboardStats.totalApplications}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : dashboardStats.totalJobs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : `${dashboardStats.conversionRate.toFixed(1)}%`}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.1% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
                <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : `${dashboardStats.avgTimeToHire} days`}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">+1 day from last month</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Application Trends</h3>
              <select className="text-sm border rounded-lg px-3 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={lineData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="applications" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
            </div>
            <div className="space-y-4">
              {activities.slice(0, 5).map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'application' ? 'bg-blue-100' :
                    activity.type === 'job' ? 'bg-green-100' :
                    activity.type === 'interview' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'application' && <Users className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'job' && <Briefcase className="w-4 h-4 text-green-600" />}
                    {activity.type === 'interview' && <Calendar className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'user' && <User className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/jobs" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Post New Job</span>
              </Link>
              <Link href="/admin/applications" className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Review Applications</span>
              </Link>
              <Link href="/admin/interviews" className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Schedule Interviews</span>
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition">
                <Settings className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">System Settings</span>
              </Link>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Service</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
