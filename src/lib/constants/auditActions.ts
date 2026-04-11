export const ACTIONS = {
  REGISTER: 'REGISTER',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  ACTION: 'ACTION',
} as const

export type AuditAction = (typeof ACTIONS)[keyof typeof ACTIONS]
