import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import SystemHealth from '@/components/SystemHealth'
import Loader from '@/components/Loader'

export default function AdminHealthPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Check if user is admin
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const userRole = user?.role?.toLowerCase() || 'user'
    if (userRole !== 'admin') {
      router.push('/unauthorized')
      return
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <Loader />
  }

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return null
  }

  return (
    <div>
      <SystemHealth />
    </div>
  )
}
