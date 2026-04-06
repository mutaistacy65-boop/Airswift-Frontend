import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

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
  summary: {
    applications: number
    jobs: number
    interviews: number
    hired: number
  }
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
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [form, setForm] = useState({ title: "", location: "" });
  const [dashboardStats, setDashboardStats] = useState<DashboardSummary>({
    totalApplications: 0,
    totalJobs: 0,
    totalInterviews: 0,
    totalHired: 0,
    averageScore: 0,
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

  const buildJobLocationData = (jobs: JobItem[]) => {
    const counts = jobs.reduce<Record<string, number>>((acc, job) => {
      const location = job.location || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([name, jobs]) => ({ name, jobs }))
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, jobsData, applicationsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getJobs(),
          adminService.getAllApplications(),
        ])

        setDashboardStats(stats)
        setJobs(jobsData)
        setApplications(applicationsData)
        setBarData(buildJobLocationData(jobsData))
        setLineData(buildApplicationTrendData(applicationsData))
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

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-2xl">🍁</span>
          <h1 className="text-xl font-bold text-blue-900">TALEX ADMIN</h1>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/admin/dashboard" className="text-red-500 font-semibold">Dashboard</Link>
          <Link href="/admin/jobs">Manage Jobs</Link>
          <Link href="/admin/applications">Applicants</Link>
          <Link href="/admin/messages">Messages</Link>
          <Link href="/admin/settings">Settings</Link>
          <button type="button" onClick={logout} className="bg-red-500 text-white px-4 py-1 rounded">
            Logout
          </button>
        </nav>
      </header>

      {/* Hero */}
      <div className="bg-blue-900 text-white px-8 py-6">
        <h2 className="text-xl font-semibold">Welcome, Admin!</h2>
        <p className="text-sm opacity-80">Monitor and manage recruitment activities</p>
        <p className="text-sm opacity-80 mt-2">Average score: {statsLoading ? 'Loading...' : dashboardStats.averageScore.toFixed(1)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8 py-6">
        {[
          { label: 'Total Jobs', value: statsLoading ? 'Loading...' : dashboardStats.totalJobs },
          { label: 'Total Applications', value: statsLoading ? 'Loading...' : dashboardStats.totalApplications },
          { label: 'Total Interviews', value: statsLoading ? 'Loading...' : dashboardStats.totalInterviews },
          { label: 'Total Hired', value: statsLoading ? 'Loading...' : dashboardStats.totalHired }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">{stat.label}</p>
            <h4 className="text-2xl font-bold text-blue-900">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">Jobs by Location</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jobs" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 py-6">
        {/* CRUD JOB MANAGEMENT */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Job Management (CRUD)</h2>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              placeholder="Job Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <button onClick={addJob} className="bg-blue-900 text-white px-4 rounded">
              Add
            </button>
          </div>

          <div className="space-y-3">
            {jobsLoading ? (
              <div className="text-gray-500">Loading job list...</div>
            ) : jobs.length === 0 ? (
              <div className="text-gray-500">No jobs found.</div>
            ) : (
              jobs.map((job) => (
                <div key={job._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b py-3 gap-3">
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.location}</p>
                    <p className="text-xs text-gray-500">Applicants: {job.applicants ?? 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled
                      className="text-xs px-2 py-1 rounded bg-yellow-100"
                    >
                      {job.status ?? 'Active'}
                    </button>
                    <button
                      disabled
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI CV SCORING PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">AI CV Scoring Panel</h2>

          <div className="space-y-4">
            {mockCVs.map((cv) => (
              <div key={cv.id} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{cv.name}</p>
                  <span className="text-sm font-bold text-blue-900">Score: {cv.score}</span>
                </div>
                <p className="text-xs text-gray-500">Skills: {cv.skills.join(", ")}</p>
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded" style={{ width: `${cv.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 bg-blue-900 text-white px-4 py-2 rounded">
            Run AI Bulk Analysis
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white text-center py-4">
        © 2026 Talex Admin System
      </footer>
    </div>
  );
}
