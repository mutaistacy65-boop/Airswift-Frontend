// @ts-nocheck
import nodemailer from 'nodemailer'
import { emailLogger } from '@/lib/emailLogger'

/**
 * Email service using NodeMailer
 * Supports Brevo, SendGrid, and custom SMTP
 */

let transporter: any = null

/**
 * Initialize email transporter
 */
const initializeTransporter = async () => {
  if (transporter) return transporter

  // Check if using Brevo
  if (process.env.BREVO_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SMTP_USER || 'apikey', // Usually 'apikey' or your Brevo login
        pass: process.env.BREVO_API_KEY,
      },
    })
  }
  // Check if using SendGrid
  else if (process.env.SENDGRID_API_KEY) {
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

const getOTPTemplate = (otp: string) => {
  return `
    <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
      <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center; box-shadow:0 8px 24px rgba(15, 23, 42, 0.08);">
        <h2 style="color:#1a73e8; margin-bottom:10px;">Airswift</h2>
        <p style="color:#555; margin-bottom:24px; font-size:16px;">Verify your email address</p>

        <div style="margin:0 auto 24px; width:fit-content; padding:20px 26px; border-radius:16px; background:#f1f5fb; font-size:32px; font-weight:700; letter-spacing:8px; color:#111;">
          ${otp}
        </div>

        <p style="color:#777; font-size:15px; margin-bottom:24px; line-height:1.6;">
          This code will expire in <strong>10 minutes</strong>. Enter it on the Airswift page to continue.
        </p>

        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

        <p style="font-size:12px; color:#aaa; margin:0;">
          If you didn’t request this, you can ignore this email.
        </p>
      </div>
    </div>
  `
}

const getResetTemplate = (link: string) => {
  return `
    <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
      <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center; box-shadow:0 8px 24px rgba(15, 23, 42, 0.08);">
        <h2 style="color:#1a73e8; margin-bottom:10px;">Reset Your Password</h2>

        <p style="color:#555; font-size:16px; margin-bottom:24px; line-height:1.6;">
          Click the button below to reset your password.
        </p>

        <a href="${link}" style="display:inline-block; margin-top:20px; padding:12px 24px; background:#1a73e8; color:white; text-decoration:none; border-radius:8px; font-weight:600;">
          Reset Password
        </a>

        <p style="margin-top:24px; font-size:12px; color:#aaa; line-height:1.6;">
          Link expires in <strong>10 minutes</strong>. If you didn’t request this, you can ignore this email.
        </p>
      </div>
    </div>
  `
}

export const sendOTPEmail = async (email: string, otp: string) => {
  const htmlContent = getOTPTemplate(otp)
  const textContent = `Your Airswift verification code is ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`

  return sendEmail(email, 'Your Airswift verification code', textContent, htmlContent)
}

/**
 * Send verification email with secure token
 * @param email - User's email address
 * @param name - User's name
 * @param verificationToken - Raw verification token (not hashed)
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  try {
    const transporter = await initializeTransporter()
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    // Use verify-email endpoint to verify the token
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@airswift.com',
      to: email,
      subject: 'Verify your Airswift Account - Secure Link',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Airswift</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Email Verification</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; margin-top: 0;">
                Hi ${name},
              </p>
              
              <p style="color: #555; font-size: 15px; line-height: 1.6;">
                Thank you for signing up for Airswift! To complete your registration and verify your email address, click the button below:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a 
                  href="${verificationLink}"
                  style="
                    display: inline-block;
                    padding: 14px 36px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: transform 0.2s;
                  "
                >
                  Verify Email Address
                </a>
              </div>

              <!-- Alternative Link -->
              <p style="color: #888; font-size: 13px; margin: 25px 0;">
                Or copy and paste this link in your browser:
              </p>
              <p style="
                background: #f9f9f9;
                border-left: 4px solid #667eea;
                padding: 12px;
                border-radius: 4px;
                word-break: break-all;
                font-size: 12px;
                color: #555;
                font-family: 'Courier New', monospace;
              ">
                ${verificationLink}
              </p>

              <!-- Important Information -->
              <div style="background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; margin: 25px 0;">
                <p style="color: #555; font-size: 13px; margin: 0;">
                  <strong>⏰ This link expires in 24 hours</strong><br>
                  After expiration, you can request a new verification link.
                </p>
              </div>

              <!-- Security Note -->
              <p style="color: #888; font-size: 12px; margin-top: 25px;">
                <strong>🔒 Security:</strong> This token is unique and single-use only. Never share this link with anyone else.
              </p>

              <!-- Footer -->
              <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                If you didn't create this account, please ignore this email. Your email address will not be used without your confirmation.
              </p>
            </div>

            <!-- Footer Brand -->
            <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 11px; margin: 0;">
                © 2024 Airswift. All rights reserved.<br>
                <a href="${frontendUrl}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
                <a href="${frontendUrl}/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Hello ${name},

        Thank you for signing up for Airswift! To complete your registration and verify your email address, visit this link:

        ${verificationLink}

        This link expires in 24 hours. After expiration, you can request a new verification link.

        If you didn't create this account, please ignore this email.

        Airswift
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
      html: getResetTemplate(resetLink),
      text: `
        Password Reset Request
        
        Hi ${name},
        
        We received a request to reset your Airswift password. Visit this link to create a new password:
        
        ${resetLink}
        
        This link will expire in 10 minutes.
        
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

/**
 * General send email function
 */
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const transporter = await initializeTransporter()

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@airswift.com',
      to,
      subject,
      text,
      html: html || text,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log('✅ Email sent to:', to)
    console.log('📧 Message ID:', result.messageId)

    // Log successful send
    emailLogger.logSent(to, subject, result.messageId)

    return result
  } catch (error) {
    console.error('❌ Error sending email:', error)

    // Log failed send
    emailLogger.logFailed(to, subject, error instanceof Error ? error : new Error(String(error)))

    throw error
  }
}
