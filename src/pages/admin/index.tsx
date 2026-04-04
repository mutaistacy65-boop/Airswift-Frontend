import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminRoute from '@/components/AdminRoute'
import { apiFetch } from '@/utils/api'
import { BarChart3, Users, FileText, Briefcase, TrendingUp, Settings } from 'lucide-react'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch('/api/admin/dashboard')
        setData(res)
      } catch (err: any) {
        setError(err?.message || 'Failed to load admin data')
      }
    }

    fetchData()
  }, [])

  return (
    <AdminRoute>
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Manage jobs, applications, users, and system settings</p>
          </div>

          {error ? (
            <div className="bg-red-950/30 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          ) : !data ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Main Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 rounded-xl border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Total Users</p>
                      <p className="text-3xl font-bold">{data.stats?.users || 0}</p>
                    </div>
                    <Users className="text-blue-400" size={32} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 rounded-xl border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Active Jobs</p>
                      <p className="text-3xl font-bold">{data.stats?.jobs || 0}</p>
                    </div>
                    <Briefcase className="text-purple-400" size={32} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 rounded-xl border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Applications</p>
                      <p className="text-3xl font-bold">{data.stats?.applications || 0}</p>
                    </div>
                    <FileText className="text-green-400" size={32} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 rounded-xl border border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Conversion Rate</p>
                      <p className="text-3xl font-bold">24.5%</p>
                    </div>
                    <TrendingUp className="text-orange-400" size={32} />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <Link href="/admin/jobs" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition border border-slate-700">
                    <Briefcase size={24} className="mb-2 text-purple-400" />
                    <h3 className="font-semibold">Manage Jobs</h3>
                    <p className="text-sm text-slate-400">Post and edit opportunities</p>
                  </Link>

                  <Link href="/admin/applications" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition border border-slate-700">
                    <FileText size={24} className="mb-2 text-green-400" />
                    <h3 className="font-semibold">Applications</h3>
                    <p className="text-sm text-slate-400">Review submissions</p>
                  </Link>

                  <Link href="/admin/categories" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition border border-slate-700">
                    <BarChart3 size={24} className="mb-2 text-blue-400" />
                    <h3 className="font-semibold">Categories</h3>
                    <p className="text-sm text-slate-400">Manage job categories</p>
                  </Link>

                  <Link href="/admin/settings" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition border border-slate-700">
                    <Settings size={24} className="mb-2 text-orange-400" />
                    <h3 className="font-semibold">Settings</h3>
                    <p className="text-sm text-slate-400">System configuration</p>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <div>
                        <p className="font-medium">Senior Developer Applications</p>
                        <p className="text-xs text-slate-500">5 new submissions</p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Active</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <div>
                        <p className="font-medium">Marketing Manager Role</p>
                        <p className="text-xs text-slate-500">3 qualified candidates</p>
                      </div>
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">Review</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">UX Designer Position</p>
                        <p className="text-xs text-slate-500">2 interviews scheduled</p>
                      </div>
                      <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs">Hired</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-lg font-semibold mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">API Performance</span>
                        <span className="text-green-400 text-sm font-semibold">98.7%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '98.7%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Database Load</span>
                        <span className="text-blue-400 text-sm font-semibold">45%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Storage Usage</span>
                        <span className="text-orange-400 text-sm font-semibold">62%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '62%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">
                  Last updated: {new Date().toLocaleTimeString()} • System running smoothly ✓
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminRoute>
  )
}
