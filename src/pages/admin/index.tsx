import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function AdminIndex() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  // FIXED: Only redirect when user state is definitively known
  // Prevents redirect loops by checking user existence and role properly
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user && user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/unauthorized')
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    </div>
  )
}

export async function getServerSideProps(context: any) {
  const { req } = context;
  const token = req.cookies.accessToken;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
