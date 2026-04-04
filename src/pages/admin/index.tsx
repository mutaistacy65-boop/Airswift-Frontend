import { useEffect, useState } from 'react'
import AdminRoute from '@/components/AdminRoute'
import { apiFetch } from '@/utils/api'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch('/api/admin/dashboard')
        setData(res)
      } catch (err: any) {
        setError(err?.message || 'Failed to load admin data')
      }
    }

    fetchData()
  }, [])

  return (
    <AdminRoute>
      <div style={{ padding: 40 }}>
        <h1>Admin Dashboard</h1>

        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : data ? (
          <>
            <p>{data.message}</p>
            <p>Users: {data.stats?.users}</p>
            <p>Applications: {data.stats?.applications}</p>
          </>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </AdminRoute>
  )
}
