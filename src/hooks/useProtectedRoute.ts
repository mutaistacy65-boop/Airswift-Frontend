import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export const useProtectedRoute = (requiredRole?: 'admin' | 'job_seeker') => {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (requiredRole && user.role !== requiredRole) {
        router.push('/')
      }
    }
  }, [isLoading, user, router, requiredRole])
}