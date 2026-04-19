import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'

export default function AdminRoute({ children }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) return <Loader />;

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role.toLowerCase() !== 'admin') {
    router.push('/unauthorized');
    return null;
  }

  return children
}
