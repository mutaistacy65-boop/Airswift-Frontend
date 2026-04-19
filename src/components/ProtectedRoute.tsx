import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useRequireAuth } from '@/hooks/useProtectedRoute'

interface ProtectedRouteProps {
  children: ReactNode
  role?: 'admin' | 'user'
  status?: string[]
}

const ProtectedRoute = ({ children, role, status }: ProtectedRouteProps) => {
  const router = useRouter()
  const { isLoading, isAuthorized } = useRequireAuth({ role, status })

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      // Navigation is handled inside useRequireAuth
      // This effect exists so children are not rendered during redirect.
      if (typeof window !== 'undefined') {
        // no-op
      }
    }
  }, [isLoading, isAuthorized])

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
