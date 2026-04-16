import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '@/services/apiClient'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import UserLocationEmitter from '@/components/UserLocationEmitter'
import { Toaster } from 'react-hot-toast'
// @ts-ignore
import 'leaflet/dist/leaflet.css'
// @ts-ignore
import '@/styles/globals.css'

/**
 * 🍪 CRITICAL GLOBAL CONFIGURATION 🍪
 *
 * We use one shared axios client in src/services/apiClient.ts.
 * This instance includes baseURL, withCredentials, and token injection.
 *
 * Use the shared API client for backend requests:
 *   API.get('/profile')
 *   API.post('/applications', data)
 */

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token && !localStorage.getItem("token")) {
      localStorage.setItem("token", token);

      // Only redirect to dashboard if we're not already on a specific page
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "/login" || currentPath === "/register") {
        window.history.replaceState({}, document.title, "/dashboard");
      } else {
        // Remove token from URL without redirecting
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]*/, '');
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [])

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <UserLocationEmitter />
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          <Component {...pageProps} />
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}