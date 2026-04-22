"use client";

import { useRequireAuth } from '@/hooks/useProtectedRoute'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthorized } = useRequireAuth({ role: 'admin' })

  if (isLoading) return <p>Loading...</p>
  if (!isAuthorized) return null

  return <>{children}</>
}
