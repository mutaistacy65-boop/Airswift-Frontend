import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import AdminSettingsPanel from '@/components/AdminSettingsPanel'
import Loader from '@/components/Loader'

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
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Jobs', href: '/admin/jobs', icon: '💼' },
    { label: 'Applications', href: '/admin/applications', icon: '📝' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Configure global application settings</p>
        </div>
        <AdminSettingsPanel />
      </div>
    </DashboardLayout>
  )
}
