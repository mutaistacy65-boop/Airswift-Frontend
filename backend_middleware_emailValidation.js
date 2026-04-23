/**
 * ✅ emailValidation.js - Backend Email Validation Middleware
 * 
 * This middleware validates that user registration emails are Gmail addresses only.
 * Implements defense in depth - validates on both frontend AND backend.
 * 
 * Usage:
 *   const { validateGmailEmail } = require('../middleware/emailValidation');
 *   router.post('/register', validateGmailEmail, registerController);
 */

/**
 * Validate Gmail email address
 * @param {string} email - Email address to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
const validateGmailEmail = (email) => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      message: 'Email address is required'
    }
  }

  const emailTrimmed = email.trim().toLowerCase()

  // ✅ Check @gmail.com domain
  if (!emailTrimmed.endsWith('@gmail.com')) {
    return {
      isValid: false,
      message: 'Only Gmail addresses (@gmail.com) are allowed for registration'
    }
  }

  // ✅ Validate Gmail format
  // Gmail addresses can contain: letters, numbers, dots, hyphens, underscores, plus sign
  // But cannot start/end with a dot
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@gmail\.com$|^[a-zA-Z0-9]@gmail\.com$/

  if (!gmailRegex.test(emailTrimmed)) {
    return {
      isValid: false,
      message: 'Invalid Gmail address format'
    }
  }

  return {
    isValid: true,
    message: 'Valid Gmail address'
  }
}

/**
 * Express middleware - Validates Gmail email in request body
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const emailValidationMiddleware = (req, res, next) => {
  const { email } = req.body

  console.log('📧 Email Validation Middleware - Validating:', email)

  // ✅ Validate email
  const validation = validateGmailEmail(email)

  if (!validation.isValid) {
    console.warn('❌ Email validation failed:', validation.message)

    return res.status(400).json({
      code: 'INVALID_EMAIL_DOMAIN',
      message: validation.message,
      email: email
    })
  }

  console.log('✅ Email validation passed:', email)

  // ✅ Email is valid, continue to next middleware
  next()
}

/**
 * Registration handler with Gmail validation
 * Can be used as a complete registration function
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerWithGmailValidation = async (req, res) => {
  try {
    const { email, password, name } = req.body

    // ✅ Validate email is Gmail
    const emailValidation = validateGmailEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({
        code: 'INVALID_EMAIL_DOMAIN',
        message: emailValidation.message
      })
    }

    // ✅ Continue with registration logic
    // (Your existing registration code here)
    console.log('📝 Processing registration for Gmail user:', email)

    // Placeholder for actual registration logic
    res.json({
      code: 'REGISTRATION_SUCCESS',
      message: 'User registered successfully',
      user: {
        email,
        name,
        role: 'user',
        verified: false
      }
    })
  } catch (error) {
    console.error('❌ Registration error:', error)
    res.status(500).json({
      code: 'REGISTRATION_ERROR',
      message: 'Registration failed',
      error: error.message
    })
  }
}

module.exports = {
  validateGmailEmail,
  emailValidationMiddleware,
  registerWithGmailValidation
}
