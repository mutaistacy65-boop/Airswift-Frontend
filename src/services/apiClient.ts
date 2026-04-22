/**
 * ✅ CENTRALIZED API CLIENT (RE-EXPORT)
 * 
 * This file re-exports the main API client from @/lib/api
 * All imports from '@/services/apiClient' will automatically use the centralized client.
 * 
 * Usage:
 *   import API from '@/services/apiClient'  // Still works! (redirected)
 *   API.post('/auth/login', { email, password })
 *   API.get('/users/profile')
 */

import API from '@/lib/api'

export const API_URL = API.defaults.baseURL

export default API
