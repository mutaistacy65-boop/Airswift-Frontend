/**
 * API Interceptor for handling automatic token refresh
 * 
 * NOTE: This utility is DEPRECATED. Use the API client from @/lib/api instead.
 * The principal API client with interceptors is now centralized and recommended.
 * 
 * This file is maintained for backward compatibility only.
 */

import API from '@/lib/api'

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const API_URL =
  BACKEND_BASE_URL.replace(/\/+$/, '') +
  (BACKEND_BASE_URL.endsWith('/api') ? '' : '/api')

/**
 * DEPRECATED: Use API client from @/lib/api instead
 * 
 * This wrapper now delegates to the centralized API client
 * which handles token refresh automatically via interceptors.
 */
export async function apiFetch(
  url: string,
  options: any = {}
): Promise<any> {
  try {
    const response = await API({
      method: options.method || 'GET',
      url: url,
      data: options.data,
      headers: options.headers,
      ...options,
    })
    return response.data
  } catch (error) {
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
