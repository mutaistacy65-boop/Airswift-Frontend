import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/job-seeker/dashboard')
      }
    }
  }, [user, isLoading, router])

  return <Loader fullScreen />
}