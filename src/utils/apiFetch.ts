/**
 * API Interceptor for handling automatic token refresh
 * Provides a fetch wrapper that handles 401 responses and token refresh
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface FetchOptions extends RequestInit {
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

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      // Refresh failed, clear tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        // Could redirect to login page here if needed
      }
      return null
    }

    const data = await response.json()

    if (data.accessToken && data.refreshToken) {
      // Store new tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      return data.accessToken
    }

    return null
  } catch (error) {
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
): Promise<Response> {
  let accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  // First attempt with current token
  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  })

  // Handle 401 - token expired
  if (response.status === 401) {
    // Try to refresh the token
    const newAccessToken = await refreshAccessToken()

    if (newAccessToken) {
      // Retry the request with new token
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      })
    } else {
      // Could not refresh, return the 401 response
      return response
    }
  }

  return response
}

/**
 * Parse JSON response with error handling
 */
export async function parseJsonResponse(response: Response) {
  try {
    const data = await response.json()
    return { data, status: response.status, ok: response.ok }
  } catch (error) {
    console.error('Failed to parse response:', error)
    return { data: null, status: response.status, ok: response.ok }
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
