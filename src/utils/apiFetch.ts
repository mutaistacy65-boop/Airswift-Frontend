/**
 * API Interceptor for handling automatic token refresh
 * Provides an axios wrapper that handles 401 responses and token refresh
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface FetchOptions extends AxiosRequestConfig {
  headers?: Record<string, string>
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refreshToken') 
      : null

    if (!refreshToken) {
      // No refresh token available, need to login again
      return null
    }

    const result = await axios.post(`${API_URL}/api/auth/refresh`, {
      refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const data = result.data

    if (data.accessToken && data.refreshToken) {
      // Store new tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      return data.accessToken
    }

    return null
  } catch (error: any) {
    console.error('Token refresh failed:', error)
    // Clear tokens on error
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    return null
  }
}

/**
 * API fetch wrapper with automatic token refresh on 401
 * Handles Bearer token injection and automatic retry on token expiry
 */
export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<any> {
  let accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  const config: AxiosRequestConfig = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  }

  try {
    // First attempt with current token
    const result = await axios(`${API_URL}${url}`, config)
    return result.data
  } catch (error: any) {
    // Handle 401 - token expired
    if (error.response?.status === 401) {
      // Try to refresh the token
      const newAccessToken = await refreshAccessToken()

      if (newAccessToken) {
        // Retry the request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newAccessToken}`,
        }
        const retryResult = await axios(`${API_URL}${url}`, config)
        return retryResult.data
      } else {
        // Could not refresh, throw the error
        throw error
      }
    }
    throw error
  }
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

/**
 * Get current refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

/**
 * Clear all auth tokens
 */
export function clearAuthTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

/**
 * Store auth tokens
 */
export function storeAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export default apiFetch
