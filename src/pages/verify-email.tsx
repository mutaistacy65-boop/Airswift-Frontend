import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import API from '@/services/apiClient'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { token, email: queryEmail } = router.query
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [showResendForm, setShowResendForm] = useState(false)
  const isVerificationMessage = !token && queryEmail && typeof queryEmail === 'string'

  useEffect(() => {
    if (!token) {
      setShowResendForm(!queryEmail)
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await API.get(`/auth/verify-email?token=${token}`)
        const data = result.data

        setVerificationStatus('success')
        setMessage(data.message || 'Email verified successfully!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error: any) {
        console.error('Verification error:', error)
        setVerificationStatus('error')
        setMessage(error.response?.data?.message || 'Failed to verify email')
        setShowResendForm(true)
      }
    }

    verifyEmail()
  }, [token, queryEmail, router])

  useEffect(() => {
    if (queryEmail && typeof queryEmail === 'string') {
      setEmail(queryEmail)
    }
  }, [queryEmail])

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setResendMessage('Please enter a valid email address')
      return
    }

    setIsResending(true)
    setResendMessage('')

    try {
      const result = await API.post('/auth/resend-verification', { email })
      setResendMessage('✅ ' + result.data.message)
      setEmail('')
      
      // Suggest checking email
      setTimeout(() => {
        setResendMessage('Please check your email for the verification link.')
      }, 2000)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to resend verification email'
      setResendMessage('❌ ' + errorMsg)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <Head>
        <title>Verify Email - Airswift</title>
        <meta name="description" content="Verify your Airswift email address" />
      </Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          maxWidth: '500px',
          width: '100%',
          padding: '40px'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', color: '#333', margin: '0 0 10px 0' }}>Airswift</h1>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Email Verification</p>
          </div>

          {/* Loading State */}
          {verificationStatus === 'loading' && token && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #f0f0f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ color: '#666', fontSize: '16px' }}>Verifying your email...</p>
            </div>
          )}

          {/* Activation Email Sent / Resend Prompt */}
          {isVerificationMessage && !showResendForm && (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', color: '#16a34a', marginBottom: '12px' }}>✓</div>
              <h1 style={{ fontSize: '28px', margin: '0 0 8px', color: '#15803d' }}>Check Your Email</h1>
              <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '16px' }}>
                Check your email for activation instructions.
              </p>
              <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                The email may take a few minutes to arrive. Don't forget to check your spam folder.
              </p>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', margin: '0 auto 24px', maxWidth: '420px' }}>
                <p style={{ margin: 0, color: '#1d4ed8', fontSize: '14px' }}>
                  <strong>Tip:</strong> Activation links expire after 24 hours. Make sure to use it promptly.
                </p>
              </div>

              <button
                onClick={() => setShowResendForm(true)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                Send Another Email
              </button>

              <button
                onClick={() => router.push('/login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Back to login
              </button>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div style={{
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              color: '#155724',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
              <h2 style={{ margin: '10px 0', fontSize: '20px' }}>Verification Successful!</h2>
              <p style={{ margin: '10px 0' }}>{message}</p>
              <p style={{ fontSize: '14px', color: '#155724', marginTop: '15px' }}>
                Redirecting to login in a few seconds...
              </p>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <div style={{
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
              <h2 style={{ margin: '10px 0', fontSize: '20px' }}>Verification Failed</h2>
              <p style={{ margin: '10px 0', fontSize: '14px' }}>{message}</p>
            </div>
          )}

          {/* Resend Form */}
          {showResendForm && (
            <form onSubmit={handleResendEmail} style={{
              background: verificationStatus === 'error' ? '#f9f9f9' : '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <h3 style={{ fontSize: '16px', color: '#333', marginTop: 0, marginBottom: '15px' }}>
                Resend Verification Email
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#333',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  disabled={isResending}
                  required
                />
              </div>

              {resendMessage && (
                <div style={{
                  background: resendMessage.includes('❌') ? '#fff3cd' : '#d4edda',
                  border: `1px solid ${resendMessage.includes('❌') ? '#ffeaa7' : '#c3e6cb'}`,
                  color: resendMessage.includes('❌') ? '#856404' : '#155724',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '13px'
                }}>
                  {resendMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isResending}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: isResending ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isResending ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <p style={{
                fontSize: '12px',
                color: '#666',
                textAlign: 'center',
                marginTop: '15px',
                marginBottom: 0
              }}>
                🔐 We'll send you a new verification link to complete your registration.
              </p>
            </form>
          )}

          {/* Footer Links */}
          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Already have an account?{' '}
              <Link href="/login" style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                Log in
              </Link>
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
              Need help?{' '}
              <Link href="/contact" style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
