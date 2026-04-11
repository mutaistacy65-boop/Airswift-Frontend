import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import axios from 'axios'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import UserLocationEmitter from '@/components/UserLocationEmitter'
// @ts-ignore
import 'leaflet/dist/leaflet.css'
// @ts-ignore
import '@/styles/globals.css'


/**
 * 🍪 CRITICAL GLOBAL CONFIGURATION 🍪
 * 
 * This enables ALL axios requests to send cookies automatically.
 * 
 * BACKEND REQUIREMENT (MANDATORY):
 * Backend must set cookies with:
 * 
 * res.cookie('accessToken', token, {
 *   httpOnly: true,        ✅ no JS access (XSS protection)
 *   secure: true,          ✅ HTTPS only (production)
 *   sameSite: "none",      ✅ cross-origin (CRITICAL)
 * });
 * 
 * Without sameSite: "none" on backend, cookies will NOT be sent
 * with cross-origin requests even with withCredentials: true
 */
axios.defaults.withCredentials = true;

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
          <Component {...pageProps} />
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}