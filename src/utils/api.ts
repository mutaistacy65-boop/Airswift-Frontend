import API, { API_URL } from '@/services/apiClient';

/**
 * 🍪 CRITICAL: withCredentials: true
 *
 * This is REQUIRED for cookie-based authentication.
 * Without it, browsers will NOT send cookies with requests.
 *
 * withCredentials enables:
 * 1. Sending cookies with requests (Authorization)
 * 2. Receiving Set-Cookie headers (Authentication)
 * 3. Cross-origin cookie sharing (requires sameSite: "none" on backend)
 *
 * Frontend sends credentials ✅
 * Backend MUST set sameSite: "none" ✅
 * Backend MUST set secure: true (on HTTPS) ✅
 */

export const api = API;
export default API;
export { API_URL };
