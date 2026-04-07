import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getUserFromToken } from '../utils/auth'

export default function AdminRoute({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserFromToken()

    if (!user) {
      router.push('/login')
      return
    }

    // Only allow admin role AND specific admin email
    if (user.role !== 'admin' || user.email !== 'admin@talex.com') {
      router.push('/unauthorized')
      return
    }

    setLoading(false)
  }, [router])

  if (loading) return <p>Loading...</p>

  return children
}
