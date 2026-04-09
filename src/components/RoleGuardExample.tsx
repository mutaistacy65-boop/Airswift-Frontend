// Example usage of RoleGuard components
import React from 'react'
import { RoleGuard, AdminOnly, UserOnly } from '@/components/RoleGuard'

export default function ExamplePage() {
  return (
    <div>
      {/* Show different content based on user role */}
      <RoleGuard roles={['admin', 'user']} fallback={<div>Please log in</div>}>
        <div>Welcome, authenticated user!</div>
      </RoleGuard>

      {/* Admin-only content */}
      <AdminOnly fallback={<div>Admin access required</div>}>
        <div>🔧 Admin Dashboard</div>
        <button>Delete All Users</button>
      </AdminOnly>

      {/* User-only content */}
      <UserOnly fallback={<div>User access required</div>}>
        <div>📝 User Profile</div>
        <button>Edit Profile</button>
      </UserOnly>

      {/* Multiple roles */}
      <RoleGuard roles={['admin']} fallback={<div>Access denied</div>}>
        <div>Super secret admin content</div>
      </RoleGuard>
    </div>
  )
}