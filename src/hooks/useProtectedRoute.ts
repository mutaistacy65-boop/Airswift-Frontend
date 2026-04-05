import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import AuthService from '@/services/authService'

export const useProtectedRoute = (requiredRole?: 'admin' | 'user') => {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!AuthService.isAuthenticated()) {
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
  }, [isLoading, user, router, requiredRole])

  return {
    isAuthorized: !isLoading && AuthService.isAuthenticated() && (!requiredRole || user?.role === requiredRole),
    isLoading
  }
}