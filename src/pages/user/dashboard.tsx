/**
 * User Dashboard Redirect
 * This maps /user/dashboard to /job-seeker/dashboard for consistency
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Loader from '@/components/Loader'

export default function UserDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 Redirecting: /user/dashboard → /job-seeker/dashboard')
    router.replace('/job-seeker/dashboard')
  }, [router])

  return <Loader fullScreen />
}
