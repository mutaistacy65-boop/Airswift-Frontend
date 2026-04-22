// @ts-nocheck
import crypto from 'crypto'

/**
 * Generate verification token for email confirmation
 * @returns {object} Token and hashed token with expiry time
 */
export function generateVerificationToken(expiryMinutes = 10) {
  // Generate a random 32-byte token and convert to hex
  const token = crypto.randomBytes(32).toString('hex')

  // Hash the token using SHA256 for storage
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  // Set expiry time (default 10 minutes)
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

  return { 
    token,           // Raw token to send in email
    hashedToken,     // Hashed token to store in DB
    expiresAt        // Expiration time
  }
}

/**
 * Verify token by comparing hashes
 * @param providedToken - Raw token from user (from URL)
 * @param hashedTokenInDB - Hashed token stored in database
 * @returns boolean - True if tokens match
 */
export function verifyTokenMatch(providedToken: string, hashedTokenInDB: string): boolean {
  try {
    console.log('Incoming token:', providedToken)

    // Hash the provided token
    const hashedToken = crypto
      .createHash('sha256')
      .update(providedToken)
      .digest('hex')

    console.log('Hashed token:', hashedToken)

    // Compare hashes using constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hashedToken),
      Buffer.from(hashedTokenInDB)
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}

/**
 * Check if token has expired
 * @param expiresAt - Token expiration date
 * @returns boolean - True if token is still valid
 */
export function isTokenValid(expiresAt: Date): boolean {
  if (!expiresAt) return false
  return new Date() <= expiresAt
}

/**
 * SECURITY BEST PRACTICES:
 * 
 * ✅ DO:
 * - Store only the HASHED token in the database
 * - Send the RAW token in the email link
 * - Use crypto.timingSafeEqual() for comparison (prevents timing attacks)
 * - Set expiration time on tokens (10 minutes for email verification)
 * - Clear the token after successful verification
 * - Regenerate tokens if user requests a new verification email
 * 
 * ❌ DON'T:
 * - Store raw tokens in the database
 * - Send hashed tokens in emails
 * - Use simple string comparison (==)
 * - Keep tokens indefinitely
 * - Reuse tokens for multiple verifications
 * - Log raw tokens in production
 */
