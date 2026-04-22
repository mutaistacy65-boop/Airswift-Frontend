/**
 * In-memory rate limiter for preventing email spam abuse
 * Tracks requests per email to enforce rate limits
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private windowMs: number = 60000 // 1 minute default

  /**
   * Initialize rate limiter with custom window (in milliseconds)
   * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
   */
  constructor(windowMs: number = 60000) {
    this.windowMs = windowMs
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Check if request is allowed (doesn't exceed limit)
   * @param key - Unique identifier (e.g., email)
   * @param maxRequests - Maximum requests allowed in time window
   * @returns {object} { allowed: boolean, retryAfter: number (in seconds) }
   */
  isAllowed(key: string, maxRequests: number = 3): { allowed: boolean; retryAfter: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    // New entry or window expired
    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return { allowed: true, retryAfter: 0 }
    }

    // Check if within limit
    if (entry.count < maxRequests) {
      entry.count++
      return { allowed: true, retryAfter: 0 }
    }

    // Exceeded limit - calculate wait time
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  /**
   * Get current request count for a key
   */
  getCount(key: string): number {
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return 0
    }
    return entry.count
  }

  /**
   * Reset count for a specific key
   */
  reset(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Clear all entries (useful for testing)
   */
  clear(): void {
    this.store.clear()
  }
}

// Global instances for different rate-limited actions
// Email verification resend: max 3 requests per 5 minutes
export const verificationResendLimiter = new RateLimiter(5 * 60 * 1000) // 5 minutes

// Login attempts: max 5 requests per 15 minutes
export const loginAttemptLimiter = new RateLimiter(15 * 60 * 1000) // 15 minutes

// OTP verification: max 5 attempts per 10 minutes
export const otpVerificationLimiter = new RateLimiter(10 * 60 * 1000) // 10 minutes

// Registration: max 3 per 30 minutes per email
export const registrationLimiter = new RateLimiter(30 * 60 * 1000) // 30 minutes

/**
 * Helper function to create error responses for rate limiting
 */
export function createRateLimitErrorResponse(retryAfter: number) {
  const minutes = Math.ceil(retryAfter / 60)
  return {
    message: `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
    retryAfter,
    code: 'RATE_LIMIT_EXCEEDED',
  }
}

/**
 * Middleware for rate limiting API endpoints
 */
export const withRateLimit = (
  limiter: RateLimiter,
  maxRequests: number = 3,
  keyExtractor: (req: any) => string
) => {
  return (req: any, res: any, next: any) => {
    const key = keyExtractor(req)
    const { allowed, retryAfter } = limiter.isAllowed(key, maxRequests)

    if (!allowed) {
      const error = createRateLimitErrorResponse(retryAfter)
      return res.status(429).json(error)
    }

    next()
  }
}

export default RateLimiter
