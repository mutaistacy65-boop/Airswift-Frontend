import nodemailer from 'nodemailer'

/**
 * Email service using NodeMailer
 * Supports both SMTP and SendGrid
 */

let transporter: any = null

/**
 * Initialize email transporter
 */
const initializeTransporter = async () => {
  if (transporter) return transporter

  // Check if using SendGrid
  if (process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  }
  // Fallback to custom SMTP
  else if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  // Development/testing fallback - Ethereal Email
  else {
    console.warn('⚠️ Email service not configured. Using Ethereal Email for testing.')
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
      console.log('📧 Ethereal Email Account:', testAccount.user)
    } catch (error) {
      console.error('Failed to create test account:', error)
      throw error
    }
  }

  return transporter
}

/**
 * Send verification email
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  try {
    const transporter = await initializeTransporter()
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const verificationLink = `${frontendUrl}/verify?token=${verificationToken}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@airswift.com',
      to: email,
      subject: 'Verify your Airswift Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Airswift, ${name}!</h2>
          
          <p style="color: #666; font-size: 16px;">
            Thank you for signing up. Please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${verificationLink}"
              style="
                display: inline-block;
                padding: 12px 30px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              "
            >
              Verify Email
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #007bff; word-break: break-all; font-size: 12px;">
            ${verificationLink}
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 10 minutes.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `,
      text: `
        Welcome to Airswift, ${name}!
        
        Please verify your email by visiting this link:
        ${verificationLink}
        
        This link will expire in 10 minutes.
        
        If you didn't create this account, please ignore this email.
      `,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log('✅ Verification email sent to:', email)
    console.log('📧 Message ID:', result.messageId)

    return result
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    throw error
  }
}

/**
 * Send welcome email after verification
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const transporter = await initializeTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@airswift.com',
      to: email,
      subject: 'Welcome to Airswift!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Airswift, ${name}!</h2>
          
          <p style="color: #666; font-size: 16px;">
            Your email has been verified successfully. You can now log in to your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${process.env.FRONTEND_URL}/login"
              style="
                display: inline-block;
                padding: 12px 30px;
                background-color: #28a745;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              "
            >
              Go to Login
            </a>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Welcome email sent to:', email)

    return result
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    throw error
  }
}

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  try {
    const transporter = await initializeTransporter()
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@airswift.com',
      to: email,
      subject: 'Reset Your Airswift Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 16px;">
            Hi ${name},
          </p>
          
          <p style="color: #666; font-size: 16px;">
            We received a request to reset your Airswift password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${resetLink}"
              style="
                display: inline-block;
                padding: 12px 30px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #007bff; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `
        Password Reset Request
        
        Hi ${name},
        
        We received a request to reset your Airswift password. Visit this link to create a new password:
        
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email.
      `,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log('✅ Password reset email sent to:', email)
    console.log('📧 Message ID:', result.messageId)

    return result
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw error
  }
}
