export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship']
export const APPLICATION_STATUS = ['pending', 'reviewed', 'accepted', 'rejected']
export const USER_ROLES = ['job_seeker', 'admin']

// Payment Constants (M-Pesa - Kenya Safaricom)
export const PAYMENT_METHODS = ['mpesa']
export const PAYMENT_AMOUNTS = {
  INTERVIEW_FEE: 3, // KSH
  VISA_PROCESSING: 30000, // KSH
}
export const PAYMENT_CURRENCY = 'KES'

export const ROUTES = {
  HOME: '/',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/[id]',
  LOGIN: '/login',
  REGISTER: '/register',
  JOB_SEEKER_DASHBOARD: '/job-seeker/dashboard',
  JOB_SEEKER_PROFILE: '/job-seeker/profile',
  JOB_SEEKER_APPLICATIONS: '/job-seeker/applications',
  JOB_SEEKER_INTERVIEWS: '/job-seeker/interviews',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_INTERVIEWS: '/admin/interviews',
  ADMIN_USERS: '/admin/users',
}