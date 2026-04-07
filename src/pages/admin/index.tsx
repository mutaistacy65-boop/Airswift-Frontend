import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function AdminIndex() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (user.role === 'admin' && user.email === 'admin@talex.com') {
        router.push('/admin/dashboard')
      } else {
        router.push('/unauthorized')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    </div>
  )
}
