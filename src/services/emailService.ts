import api from '@/lib/api'

interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

interface InterviewEmailData {
  candidateName: string
  candidateEmail: string
  jobTitle: string
  interviewDate: string
  interviewTime: string
  interviewerName: string
  zoomLink?: string
  companyName?: string
}

interface RejectionEmailData {
  candidateName: string
  candidateEmail: string
  jobTitle: string
  companyName?: string
}

export const emailService = {
  /**
   * Send interview invitation email
   */
  sendInterviewInvitation: async (data: InterviewEmailData) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Invitation</h2>
        <p>Hi ${data.candidateName},</p>
        
        <p>Congratulations! We are pleased to invite you for an interview for the position of <strong>${data.jobTitle}</strong> at ${data.companyName || 'our company'}.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Interview Details</h3>
          <p><strong>Position:</strong> ${data.jobTitle}</p>
          <p><strong>Date:</strong> ${new Date(data.interviewDate).toDateString()}</p>
          <p><strong>Time:</strong> ${data.interviewTime}</p>
          <p><strong>Interviewer:</strong> ${data.interviewerName}</p>
          ${data.zoomLink ? `<p><strong><a href="${data.zoomLink}" style="color: #007bff;">Join Interview</a></strong></p>` : ''}
        </div>
        
        <p>If you have any questions or need to reschedule, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>${data.interviewerName}<br>${data.companyName || 'TALEX'}</p>
      </div>
    `

    return api.post('/admin/email/send', {
      to: data.candidateEmail,
      subject: `Interview Invitation - ${data.jobTitle}`,
      html,
    })
  },

  /**
   * Send rejection email
   */
  sendRejectionEmail: async (data: RejectionEmailData) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Update</h2>
        <p>Hi ${data.candidateName},</p>
        
        <p>Thank you for your interest in the <strong>${data.jobTitle}</strong> position at ${data.companyName || 'our company'}.</p>
        
        <p>After careful consideration, we regret to inform you that we have decided not to move forward with your application at this time. We appreciate the time you spent with us and encourage you to apply for other positions in the future.</p>
        
        <p>We wish you the best in your career endeavors.</p>
        
        <p>Best regards,<br>The Recruitment Team<br>${data.companyName || 'TALEX'}</p>
      </div>
    `

    return api.post('/admin/email/send', {
      to: data.candidateEmail,
      subject: `Application Update - ${data.jobTitle}`,
      html,
    })
  },

  /**
   * Send shortlist notification email
   */
  sendShortlistNotification: async (candidateName: string, candidateEmail: string, jobTitle: string) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Great News!</h2>
        <p>Hi ${candidateName},</p>
        
        <p>We are pleased to inform you that you have been shortlisted for the <strong>${jobTitle}</strong> position!</p>
        
        <p>Your qualifications and experience stood out among many applicants. The next step will be an interview with our team.</p>
        
        <p>We will be in touch shortly with the interview details.</p>
        
        <p>Best regards,<br>The Recruitment Team<br>TALEX</p>
      </div>
    `

    return api.post('/admin/email/send', {
      to: candidateEmail,
      subject: `You've been shortlisted! - ${jobTitle}`,
      html,
    })
  },

  /**
   * Send interview rescheduling confirmation email
   */
  sendRescheduleConfirmation: async (
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    newDate: string,
    newTime: string,
    zoomLink?: string,
    interviewerName?: string,
    companyName?: string
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Rescheduled</h2>
        <p>Hi ${candidateName},</p>
        
        <p>Your interview for the <strong>${jobTitle}</strong> position has been successfully rescheduled.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">New Interview Details</h3>
          <p><strong>Position:</strong> ${jobTitle}</p>
          <p><strong>Date:</strong> ${new Date(newDate).toDateString()}</p>
          <p><strong>Time:</strong> ${newTime}</p>
          ${interviewerName ? `<p><strong>Interviewer:</strong> ${interviewerName}</p>` : ''}
          ${zoomLink ? `<p><strong><a href="${zoomLink}" style="color: #007bff;">Join Interview</a></strong></p>` : ''}
        </div>
        
        <p>Please mark your calendar and ensure you're available at the scheduled time. If you need to reschedule again or have any questions, please contact us.</p>
        
        <p>Best regards,<br>${interviewerName || 'The Recruitment Team'}<br>${companyName || 'TALEX'}</p>
      </div>
    `

    return api.post('/admin/email/send', {
      to: candidateEmail,
      subject: `Interview Rescheduled - ${jobTitle}`,
      html,
    })
  },

  /**
   * Send general email
   */
  sendEmail: async (payload: EmailPayload) => {
    return api.post('/admin/email/send', payload)
  },
}

export default emailService
