<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import ProtectedRoute from '@/components/ProtectedRoute'
import Loader from '@/components/Loader'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
=======
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import AdminUsers from '@/components/AdminUsers'
import Loader from '@/components/Loader'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
>>>>>>> fee8ffbd9587e97ff13d6c344ad80b952310e5e7

  // Check if user is admin
  useEffect(() => {
    if (isLoading) return

<<<<<<< HEAD
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📡 Fetching users from adminService...')
      
      const response = await adminService.getUsers()
      console.log('✅ Users fetched:', response)
      
      // Handle both direct array and wrapped response
      const userData = Array.isArray(response) ? response : response?.users || []
      setUsers(userData)
    } catch (err: any) {
      console.error('❌ Error fetching users:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load users'
      setError(errorMessage)
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  const handleRetry = () => {
    setRetrying(true)
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <ProtectedRoute role="admin">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute role="admin">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ↻ Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'recruiter'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' || user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.status === 'active' || user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

export default AdminUsers
=======
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
      <AdminUsers title="Admin Users Management" />
    </div>
  )
}
>>>>>>> fee8ffbd9587e97ff13d6c344ad80b952310e5e7
