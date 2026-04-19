import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login')
      } else if (user?.role?.toLowerCase() === 'admin') {
        router.replace('/admin/dashboard')
      } else if (user?.hasSubmittedApplication) {
        router.replace('/job-seeker/dashboard')
      } else {
        router.replace('/apply')
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  return <Loader fullScreen />
}