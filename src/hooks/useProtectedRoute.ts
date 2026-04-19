import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

type UseRequireAuthOptions = {
  role?: 'admin' | 'user'
  status?: string[]
  redirectTo?: string
}

export const useRequireAuth = ({ role, status, redirectTo }: UseRequireAuthOptions = {}) => {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
      router.push('/unauthorized')
      return
    }

    if (status && !status.includes(user.applicationStatus || '')) {
      router.push(redirectTo || '/dashboard')
      return
    }
  }, [isLoading, user, role, status, redirectTo, router])

  return {
    isAuthorized:
      !isLoading &&
      !!user &&
      (!role || user.role?.toLowerCase() === role.toLowerCase()) &&
      (!status || status.includes(user.applicationStatus || '')),
    isLoading,
    user,
  }
}

export const useProtectedRoute = (requiredRole?: 'admin' | 'user') => useRequireAuth({ role: requiredRole })
