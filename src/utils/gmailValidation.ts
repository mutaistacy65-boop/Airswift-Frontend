/**
 * Gmail Validation Utilities
 * ✅ Enforces Gmail-only registration for regular users
 */

/**
 * Validates if an email is a valid Gmail address
 * @param email - Email address to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateGmailEmail = (email: string): { valid: boolean; message: string } => {
  // Check if email is empty
  if (!email || email.trim() === '') {
    return {
      valid: false,
      message: '📧 Email address is required'
    };
  }

  const emailTrimmed = email.trim().toLowerCase();

  // Check if email ends with @gmail.com
  if (!emailTrimmed.endsWith('@gmail.com')) {
    return {
      valid: false,
      message: '❌ Only Gmail addresses (@gmail.com) are allowed for user registration'
    };
  }

  // Validate Gmail email format
  // Gmail addresses can contain:
  // - Letters (a-z, A-Z)
  // - Numbers (0-9)
  // - Dots (.), hyphens (-), underscores (_)
  // - Plus sign (+) for label filtering
  // But cannot start or end with a dot
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@gmail\.com$|^[a-zA-Z0-9]@gmail\.com$/;

  if (!gmailRegex.test(emailTrimmed)) {
    return {
      valid: false,
      message: '❌ Invalid Gmail address format'
    };
  }

  return {
    valid: true,
    message: '✅ Valid Gmail address'
  };
};

/**
 * Get a user-friendly Gmail hint
 * Useful for helping users understand the Gmail requirement
 * @returns String with Gmail hint
 */
export const getGmailHint = (): string => {
  return 'Please use a valid Gmail address (e.g., yourname@gmail.com)';
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
