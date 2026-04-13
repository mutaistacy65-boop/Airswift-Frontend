import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export const useProtectedRoute = (requiredRole?: 'admin' | 'user') => {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const isAuthenticated = !!user

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (requiredRole === 'admin' && user?.role !== 'admin') {
        router.push('/unauthorized')
      } else if (requiredRole === 'user' && user?.role !== 'user') {
        if (user?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/job-seeker/dashboard')
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole])

  return {
    isAuthorized: !isLoading && isAuthenticated && (
      !requiredRole ||
      (requiredRole === 'admin' && user?.role === 'admin') ||
      (requiredRole === 'user' && user?.role === 'user')
    ),
    isLoading
  }
}