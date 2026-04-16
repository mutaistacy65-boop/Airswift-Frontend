import { useEffect, useState } from 'react'
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

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    hasPermission: mounted ? hasPermission : () => false,
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
