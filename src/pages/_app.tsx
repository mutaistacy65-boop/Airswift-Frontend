import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
// @ts-ignore
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Prevent hydration mismatch
  }, [])

  return (
    <SessionProvider session={pageProps.session}>
      <NotificationProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </NotificationProvider>
    </SessionProvider>
  )
}