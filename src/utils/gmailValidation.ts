/**
 * Email Validation Utilities
 * ✅ Allows any valid email address for user registration,
 *    while reserving admin@talex.com for admin accounts only.
 */

/**
 * Validates if an email is a valid address for registration
 * @param email - Email address to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateGmailEmail = (email: string): { valid: boolean; message: string } => {
  if (!email || email.trim() === '') {
    return {
      valid: false,
      message: '📧 Email address is required'
    };
  }

  const emailTrimmed = email.trim().toLowerCase();

  if (emailTrimmed === 'admin@talex.com') {
    return {
      valid: false,
      message: '❌ Admin email is reserved. Please use another email address.'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailTrimmed)) {
    return {
      valid: false,
      message: '❌ Invalid email format. Please enter a valid email address.'
    };
  }

  return {
    valid: true,
    message: '✅ Valid email address'
  };
};

/**
 * Get a user-friendly email hint
 * Useful for helping users understand the email requirement
 * @returns String with email hint
 */
export const getGmailHint = (): string => {
  return 'Please use a valid email address (e.g., yourname@example.com)';
};

/**
 * Extract the local part of a Gmail address (before @)
 * Useful for pre-filling name fields from email
 * @param email - Gmail email address
 * @returns Local part of email or empty string if invalid
 */
export const getNameFromGmailEmail = (email: string): string => {
  const validation = validateGmailEmail(email);
  if (!validation.valid) return '';

  const localPart = email.split('@')[0];
  // Convert dots and underscores to spaces for a human-readable name
  return localPart
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};
