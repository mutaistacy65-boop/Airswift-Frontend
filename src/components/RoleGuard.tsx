import React from 'react'
import { useAuth } from '@/context/AuthContext'

interface RoleGuardProps {
  children: React.ReactNode
  roles: string[]
  fallback?: React.ReactNode
}

/**
 * Role-based UI guard component
 * Only renders children if user has one of the specified roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ children, roles, fallback = null }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <>{fallback}</>
  }

  if (roles.includes(user.role || '')) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Admin-only guard component
 */
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  return (
    <RoleGuard roles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * User-only guard component (non-admin)
 */
export const UserOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  return (
    <RoleGuard roles={['user']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}