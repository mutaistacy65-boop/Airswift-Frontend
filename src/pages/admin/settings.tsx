import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import AdminSettingsPanel from '@/components/AdminSettingsPanel'
import Loader from '@/components/Loader'
import { Settings as SettingsIcon } from 'lucide-react'

export default function AdminSettings() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) return <Loader />

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: '💼 Jobs', href: '/admin/jobs', icon: '💼' },
    { label: '👥 Applicants', href: '/admin/applications', icon: '👥' },
    { label: '📞 Interviews', href: '/admin/interviews', icon: '📞' },
    { label: '💬 Messages', href: '/admin/messages', icon: '💬' },
    { label: '⚙️ Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <SettingsIcon size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600 mt-1">Configure global application settings and preferences</p>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2">
            <AdminSettingsPanel />
          </div>

          {/* Settings Info Sidebar */}
          <div className="space-y-4">
            {/* General Settings */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-4">General Settings</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Language & Locale</li>
                <li>✓ Time Zone Configuration</li>
                <li>✓ Email Notifications</li>
                <li>✓ Privacy Controls</li>
              </ul>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Change Password</li>
                <li>✓ Two-Factor Authentication</li>
                <li>✓ Session Management</li>
                <li>✓ API Keys</li>
              </ul>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-4">System Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Last Updated:</strong> Today</p>
                <p><strong>Status:</strong> <span className="text-green-600">Operational</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
