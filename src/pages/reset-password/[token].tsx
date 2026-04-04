import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { resetPassword } from '@/api/auth'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!token || typeof token !== 'string') {
      alert('Invalid reset token')
      return
    }

    setLoading(true)

    try {
      const data = await resetPassword(token, password)

      alert(data.message || '✅ Password reset successful')
      router.push('/login')
    } catch (err: any) {
      alert(err?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
  }, [token])

  return (
    <div style={{ padding: 40 }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', margin: '12px 0', padding: '10px', width: '100%', maxWidth: '400px' }}
      />

      <button onClick={handleReset} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </div>
  )
}
