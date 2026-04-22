export const JOB_TYPES = [
  'full-time', 'part-time', 'contract', 'internship', 'temporary', 'freelance',
  // A
  'accountant', 'actor', 'administrator', 'analyst', 'architect', 'artist', 'attorney',
  // B
  'babysitter', 'baker', 'banker', 'barista', 'bartender', 'bookkeeper', 'butcher',
  // C
  'carpenter', 'cashier', 'chef', 'cleaner', 'clerk', 'coach', 'consultant', 'cook', 'counselor',
  // D
  'dancer', 'dentist', 'designer', 'developer', 'dietitian', 'director', 'doctor', 'driver',
  // E
  'editor', 'electrician', 'engineer', 'executive',
  // F
  'farmer', 'firefighter', 'fisherman', 'flight-attendant',
  // G
  'gardener', 'graphic-designer', 'guard',
  // H
  'hair-stylist', 'housekeeper', 'house-keeper',
  // I
  'instructor', 'inspector', 'installer',
  // J
  'janitor', 'journalist', 'judge',
  // K
  'kindergarten-teacher',
  // L
  'laborer', 'lawyer', 'librarian',
  // M
  'manager', 'mechanic', 'miner', 'model', 'musician',
  // N
  'nanny', 'nurse', 'nutritionist',
  // O
  'officer', 'operator',
  // P
  'painter', 'paramedic', 'pharmacist', 'photographer', 'physician', 'pilot', 'plumber', 'police-officer', 'programmer',
  // Q
  'quality-assurance',
  // R
  'receptionist', 'researcher', 'retail-worker',
  // S
  'salesperson', 'scientist', 'secretary', 'security-guard', 'server', 'social-worker', 'software-engineer', 'soldier', 'stockbroker', 'surgeon',
  // T
  'tailor', 'teacher', 'technician', 'therapist', 'trainer',
  // U
  'underwriter',
  // V
  'veterinarian',
  // W
  'waiter', 'waitress', 'warehouse-worker', 'web-developer', 'welder', 'writer',
  // X, Y, Z
  'x-ray-technician', 'yoga-instructor', 'zookeeper'
]

export const APPLICATION_STATUS = [
  'pending', 'reviewed', 'accepted', 'interview_scheduled', 'interview_completed',
  'visa_payment_pending', 'visa_processing', 'visa_ready', 'rejected'
]
export const USER_ROLES = ['job_seeker', 'admin']

// Payment Constants (M-Pesa - Kenya Safaricom)
export const PAYMENT_METHODS = ['mpesa']
export const PAYMENT_AMOUNTS = {
  INTERVIEW_FEE: 3, // USD
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