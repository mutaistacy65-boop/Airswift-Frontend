/**
 * ✅ Centralized API Client - axios instance with authentication
 * 
 * This file provides:
 * - Automatic Bearer token injection from localStorage
 * - Request/response logging for debugging
 * - Error handling and redirects
 * - Centralized base URL configuration
 * 
 * Usage:
 *   import api from '../api'
 *   const response = await api.get('/admin/interviews')
 */

import axios from 'axios'

// ✅ Configure base URL from environment or fallback
const baseURL = process.env.REACT_APP_API_URL || 
                process.env.NEXT_PUBLIC_API_URL || 
                'https://airswift-backend-fjt3.onrender.com/api'

console.log('📡 API baseURL set to:', baseURL)

// ✅ Create axios instance with configuration
const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ REQUEST INTERCEPTOR - Add authorization header
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    const url = config.url || ''

    // Skip auth for login/register endpoints
    const isAuthEndpoint = url.includes('/auth/login') || 
                          url.includes('/auth/register') ||
                          url.includes('/auth/forgot') ||
                          url.includes('/auth/reset') ||
                          url.includes('/auth/verify')

    console.log('📤 API REQUEST:')
    console.log('   URL:', url)
    console.log('   METHOD:', config.method?.toUpperCase())
    console.log('   Token exists:', !!token)

    // Add authorization header if token exists and not an auth endpoint
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('   ✅ Authorization header added')
    } else if (!token && !isAuthEndpoint) {
      console.warn('   ⚠️  No token found - request may fail with 401')
    }

    return config
  },
  error => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ✅ RESPONSE INTERCEPTOR - Handle responses and errors
api.interceptors.response.use(
  response => {
    console.log(`✅ API RESPONSE: ${response.status} ${response.config.url}`)
    return response
  },
  error => {
    const status = error.response?.status
    const url = error.config?.url
    const message = error.response?.data?.message || error.message

    console.error('❌ API ERROR:', {
      status,
      url,
      message,
      data: error.response?.data
    })

    // Handle 401 Unauthorized
    if (status === 401) {
      console.error('🔐 UNAUTHORIZED - Session expired')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.error('🚫 FORBIDDEN - Insufficient permissions')
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.error('🔍 NOT FOUND - Endpoint does not exist:', url)
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error('💥 SERVER ERROR - Backend error occurred')
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 NETWORK ERROR - No response from server')
    }

    return Promise.reject(error)
  }
)

// ✅ Export the configured instance
export default api
