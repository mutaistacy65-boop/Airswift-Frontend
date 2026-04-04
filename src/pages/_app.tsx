import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
// @ts-ignore
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);

      // remove token from URL
      window.history.replaceState({}, document.title, "/dashboard");
    }
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