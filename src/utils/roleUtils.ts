/**
 * Utility functions for role management and email validation
 */

/**
 * Determine user role based on email address
 * @param email - User's email address
 * @returns The role string ('admin', 'user', etc.)
 */
export const getRoleFromEmail = (email: string): string => {
  if (!email) return 'user'

  const emailLower = email.toLowerCase().trim()

  // Admin role for specific email
  if (emailLower === 'admin@talex.com') {
    return 'admin'
  }

  // User role for emails ending with @email.com or other valid domains
  if (emailLower.endsWith('@email.com') ||
      emailLower.endsWith('.com') ||
      emailLower.endsWith('.org') ||
      emailLower.endsWith('.net')) {
    return 'user'
  }

  // Default to user role
  return 'user'
}

/**
 * Validate if an email is allowed for login/registration
 * @param email - Email to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateEmailForAuth = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailLower = email.toLowerCase().trim()

  if (!emailLower.includes('@')) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  // Allow admin email
  if (emailLower === 'admin@talex.com') {
    return { isValid: true }
  }

  // Check for valid domains
  if (!emailLower.endsWith('@email.com') &&
      !emailLower.endsWith('.com') &&
      !emailLower.endsWith('.org') &&
      !emailLower.endsWith('.net')) {
    return {
      isValid: false,
      error: 'Please use an email address ending with @email.com or other common domains (.com, .org, .net)'
    }
  }

  return { isValid: true }
}

/**
 * Check if email is admin email
 * @param email - Email to check
 * @returns boolean indicating if email is admin
 */
export const isAdminEmail = (email: string): boolean => {
  return email?.toLowerCase().trim() === 'admin@talex.com'
}

/**
 * Check if email is valid user email
 * @param email - Email to check
 * @returns boolean indicating if email is valid for user login
 */
export const isValidUserEmail = (email: string): boolean => {
  if (!email) return false

  const emailLower = email.toLowerCase().trim()

  // Admin email is also valid
  if (isAdminEmail(emailLower)) return true

  // Check for valid domains
  return emailLower.endsWith('@email.com') ||
         emailLower.endsWith('.com') ||
         emailLower.endsWith('.org') ||
         emailLower.endsWith('.net')
}

export const getPostLoginPath = (role?: string, hasSubmittedApplication?: boolean) => {
  const normalizedRole = role?.toLowerCase()
  if (normalizedRole === 'admin') {
    return '/admin/dashboard'
  }

  if (hasSubmittedApplication) {
    return '/dashboard'
  }

  return '/apply'
}