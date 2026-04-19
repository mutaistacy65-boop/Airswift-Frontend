/**
 * User Application Form Redirect
 * This maps /user/application to /apply for consistency
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Loader from '@/components/Loader'

export default function UserApplicationRedirect() {
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 Redirecting: /user/application → /apply')
    router.replace('/apply')
  }, [router])

  return <Loader fullScreen />
}
