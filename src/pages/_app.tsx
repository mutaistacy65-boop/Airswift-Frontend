import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import axios from 'axios'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
// @ts-ignore
import '@/styles/globals.css'

// ✅ CRITICAL: Enable credentials for all axios requests (cookies, headers, etc)
axios.defaults.withCredentials = true;

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
    <NotificationProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </NotificationProvider>
  )
}