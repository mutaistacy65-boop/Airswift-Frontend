import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Loader from '@/components/Loader'

/**
 * Backward Compatibility Redirect
 * This page handles old links to /application-form and redirects them to /apply
 * This ensures existing bookmarks, links, and navigation don't break
 */
export default function ApplicationFormRedirect() {
  const router = useRouter()

  useEffect(() => {
    console.log("🔄 Backward compatibility redirect: /application-form → /apply");
    router.replace('/apply')
  }, [router])

  return <Loader fullScreen />
}
