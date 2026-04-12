import { EmailTemplate } from '@/types/jobCategories'

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'application_submitted',
    name: 'Application Submitted',
    subject: 'Application Received - {{jobTitle}} at {{companyName}}',
    body: `Dear {{applicantName}},

Thank you for submitting your application for the {{jobTitle}} position at {{companyName}}.

Your application has been received and is now under review. We have received the following documents:
- Passport
- National ID
- CV/Resume
{{#certificates}}- Certificate: {{certificateName}}{{/certificates}}

We will review your application and get back to you within 3-5 business days. If you have any questions, please don't hesitate to contact us.

Best regards,
The {{companyName}} Recruitment Team
Email: recruitment@talex.com
Phone: +1-800-TALEX`,
    stage: 'application_submitted',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'certificates']
  },
  {
    id: 'application_reviewed',
    name: 'Application Reviewed',
    subject: 'Application Update - {{jobTitle}} Position',
    body: `Dear {{applicantName}},

We have completed the initial review of your application for the {{jobTitle}} position at {{companyName}}.

Thank you for your interest in joining our team. We appreciate the time and effort you put into your application. While we were impressed with your qualifications, we have decided to move forward with other candidates at this time.

We encourage you to apply for future opportunities that match your skills and experience.

Best regards,
The {{companyName}} Recruitment Team`,
    stage: 'application_reviewed',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName']
  },
  {
    id: 'interview_scheduled',
    name: 'Interview Scheduled',
    subject: 'Interview Scheduled - {{jobTitle}} Position',
    body: `Dear {{applicantName}},

Congratulations! Your application for the {{jobTitle}} position at {{companyName}} has been shortlisted.

We would like to invite you for an interview via Zoom. Here are the details:

📅 Date & Time: {{interviewDate}}
🔗 Zoom Link: {{zoomLink}}
📝 Interview Notes: {{interviewNotes}}

Please ensure you have:
- A stable internet connection
- A quiet environment
- Your Zoom application installed and updated
- All required documents ready for verification

If you need to reschedule or have any questions, please contact us immediately.

Best regards,
The {{companyName}} Recruitment Team
Email: recruitment@talex.com
Phone: +1-800-TALEX`,
    stage: 'interview_scheduled',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'interviewDate', 'zoomLink', 'interviewNotes']
  },
  {
    id: 'interview_completed',
    name: 'Interview Completed',
    subject: 'Interview Completed - Next Steps for {{jobTitle}} Position',
    body: `Dear {{applicantName}},

Thank you for attending your interview for the {{jobTitle}} position at {{companyName}}.

Our team is currently reviewing your interview performance. We will get back to you with the next steps within 2-3 business days.

In the meantime, please prepare for the next stage of the process, which may include:
- Visa processing requirements
- Background verification
- Reference checks

We appreciate your patience and continued interest in joining our team.

Best regards,
The {{companyName}} Recruitment Team`,
    stage: 'interview_completed',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName']
  },
  {
    id: 'visa_payment_required',
    name: 'Visa Payment Required',
    subject: 'Visa Processing Fee Required - {{jobTitle}} Position',
    body: `Dear {{applicantName}},

Congratulations! You have successfully completed the interview process for the {{jobTitle}} position at {{companyName}}.

To proceed with your visa processing, you need to pay the visa processing fee of KES 30,000. This fee covers:
- Visa application processing
- Document verification
- Embassy coordination
- Work permit processing

Please complete the payment using M-Pesa by following these steps:
1. Go to M-Pesa menu on your phone
2. Select "Lipa na M-Pesa"
3. Select "Pay Bill"
4. Enter Business Number: 123456
5. Enter Account Number: VISA-{{applicationId}}
6. Enter Amount: 30000
7. Enter your M-Pesa PIN and confirm

Once payment is confirmed, your visa processing will begin immediately. You will receive a confirmation email with tracking details.

If you have any questions about the payment process, please contact our support team.

Best regards,
The {{companyName}} Visa Processing Team
Email: visa@talex.com
Phone: +1-800-TALEX`,
    stage: 'visa_payment_required',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'applicationId']
  },
  {
    id: 'visa_processing_started',
    name: 'Visa Processing Started',
    subject: 'Visa Processing Started - {{jobTitle}} Position',
    body: `Dear {{applicantName}},

We have received your visa processing payment and have started processing your work visa for the {{jobTitle}} position at {{companyName}}.

Your application tracking number is: {{trackingNumber}}

Processing Timeline:
- Document verification: 2-3 business days
- Embassy submission: 5-7 business days
- Visa approval: 10-15 business days
- Total processing time: 3-4 weeks

You will receive regular updates on your visa status. Please keep all your documents safe and available for any additional requirements.

If you have any questions, please contact our visa processing team.

Best regards,
The {{companyName}} Visa Processing Team
Email: visa@talex.com
Phone: +1-800-TALEX
Tracking: {{trackingNumber}}`,
    stage: 'visa_processing_started',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'trackingNumber']
  },
  {
    id: 'visa_ready',
    name: 'Visa Ready for Collection',
    subject: 'Visa Approved - Ready for Collection - {{jobTitle}} Position',
    body: `Dear {{applicantName}},

🎉 Congratulations! Your work visa has been approved!

Your visa for the {{jobTitle}} position at {{companyName}} is now ready for collection. Here are the details:

📋 Visa Details:
- Visa Number: {{visaNumber}}
- Issue Date: {{issueDate}}
- Expiry Date: {{expiryDate}}
- Work Permit Valid Until: {{workPermitExpiry}}

📍 Collection Information:
- Location: {{embassyLocation}}
- Collection Hours: Monday-Friday, 9:00 AM - 4:00 PM
- Required Documents: Original passport, collection receipt, ID

Please collect your visa within 30 days of this notification. Bring all required documents and the collection receipt attached to this email.

Once you have collected your visa, please contact us to arrange your travel and onboarding details.

Welcome to the {{companyName}} team!

Best regards,
The {{companyName}} Visa Processing Team
Email: visa@talex.com
Phone: +1-800-TALEX`,
    stage: 'visa_ready',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'visaNumber', 'issueDate', 'expiryDate', 'workPermitExpiry', 'embassyLocation']
  },
  {
    id: 'application_rejected',
    name: 'Application Rejected',
    subject: 'Application Update - {{jobTitle}} Position',
    body: `Dear {{applicantName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful consideration of your application and qualifications, we have decided not to proceed with your candidacy for this position. This decision was made based on our current requirements and the competitive nature of the applicant pool.

We were impressed with your background and experience, and we encourage you to apply for future opportunities that match your skills. We will keep your information on file for 6 months for consideration in other suitable positions.

Thank you again for your interest in {{companyName}}. We wish you the best in your job search.

Best regards,
The {{companyName}} Recruitment Team
Email: recruitment@talex.com
Phone: +1-800-TALEX`,
    stage: 'application_rejected',
    isActive: true,
    variables: ['applicantName', 'jobTitle', 'companyName']
  },
  {
    id: 'user_suspended',
    name: 'Account Suspended',
    subject: 'Your account has been temporarily suspended',
    body: `Dear {{userName}},

We regret to inform you that your account has been temporarily suspended.

Suspension details:
- Reason: Account suspension
- Suspended until: {{suspendedUntil}}

While your account is suspended, you will not be able to access the platform. If you believe this is an error or have questions, please contact our support team.

Best regards,
The TALEX Support Team
Email: support@talex.com`,
    stage: 'user_suspended',
    isActive: true,
    variables: ['userName', 'suspendedUntil']
  },
  {
    id: 'user_banned',
    name: 'Account Banned',
    subject: 'Your account has been permanently banned',
    body: `Dear {{userName}},

We regret to inform you that your account has been permanently banned.

This means that your account can no longer access the platform.

If you believe this action was taken in error, please contact our support team for assistance.

Best regards,
The TALEX Support Team
Email: support@talex.com`,
    stage: 'user_banned',
    isActive: true,
    variables: ['userName']
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset Your Talex Password',
    body: `Dear {{userName}},

We received a request to reset your password for your Talex account.

If you made this request, click the link below to reset your password:

{{resetLink}}

This link will expire in 24 hours for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

For security reasons, please don't share this email or the reset link with anyone.

If you have any questions or need assistance, please contact our support team.

Best regards,
The Talex Support Team
Email: support@talex.com
Phone: +1-800-TALEX

---
This is an automated message. Please do not reply to this email.`,
    stage: 'password_reset',
    isActive: true,
    variables: ['userName', 'resetLink']
  }
]