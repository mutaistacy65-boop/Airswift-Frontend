import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { hasPermission } from '@/lib/permissions'

/**
 * Hook to check user permissions
 *
 * Usage:
 * const { hasPermission: can } = usePermissions()
 *
 * {can('edit_templates') && <button>Edit Template</button>}
 */
export const usePermissions = () => {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * Check if user has a specific permission
   * First checks user.permissions array, then falls back to role-based permissions
   */
  const checkPermission = (permission: string): boolean => {
    if (!user) return false

    // Check permissions array first
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission)
    }

    // Fallback to role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'view_dashboard',
        'edit_users',
        'update_status',
        'view_audit_logs',
        'manage_jobs',
        'view_payments',
        'send_notifications',
        'edit_templates'
      ],
      recruiter: [
        'view_jobs',
        'edit_jobs',
        'view_applications',
        'schedule_interviews',
        'update_application_status'
      ],
      user: [
        'apply_job',
        'view_own_application',
        'view_own_profile',
        'edit_own_profile'
      ]
    }

    const userRole = user.role?.toLowerCase()
    return rolePermissions[userRole]?.includes(permission) || false
  }

  /**
   * Check if user has any of the specified permissions (OR logic)
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => checkPermission(permission))
  }

  /**
   * Check if user has all of the specified permissions (AND logic)
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => checkPermission(permission))
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.role?.toLowerCase() === role.toLowerCase()
  }

  return {
    hasPermission: mounted ? checkPermission : () => false,
    hasAnyPermission: mounted ? hasAnyPermission : () => false,
    hasAllPermissions: mounted ? hasAllPermissions : () => false,
    hasRole: mounted ? hasRole : () => false,
    isAdmin: mounted ? hasRole('admin') : false,
    isRecruiter: mounted ? hasRole('recruiter') : false,
    isUser: mounted ? hasRole('user') : false,
  }
}

/**
 * Helper to check multiple permissions (AND logic)
 * Returns true only if user has ALL permissions
 */
export const hasAllPermissions = (perms: string[]) => {
  return perms.every(perm => hasPermission(perm))
}

/**
 * Helper to check multiple permissions (OR logic)
 * Returns true if user has ANY permission
 */
export const hasAnyPermission = (perms: string[]) => {
  return perms.some(perm => hasPermission(perm))
}
