import React from 'react'
import UserLayout from '@/layouts/UserLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import AdminUsers from '@/components/AdminUsers'

const AdminUsersPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Applications', href: '/admin/applications', icon: '📋' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthorized) {
    return <div>Access denied. Admin privileges required.</div>
  }

  return (
    <UserLayout sidebarItems={sidebarItems}>
      <AdminUsers />
    </UserLayout>
  )
}

export default AdminUsersPage

