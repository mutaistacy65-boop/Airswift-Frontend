import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export const useProtectedRoute = (requiredRole?: 'admin' | 'user') => {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (requiredRole && user?.role !== requiredRole) {
        // Redirect based on user role
        if (user?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/job-seeker/dashboard')
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole])

  return {
    isAuthorized: !isLoading && isAuthenticated && (!requiredRole || user?.role === requiredRole),
    isLoading
  }
}