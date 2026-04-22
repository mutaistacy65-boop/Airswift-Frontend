/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines roles and their associated permissions
 */

export const PERMISSIONS = {
  // User permissions
  'apply_jobs': 'Apply for job positions',
  'view_profile': 'View own profile',
  'edit_profile': 'Edit own profile',
  'submit_application': 'Submit job applications',
  'view_my_applications': 'View own applications',
  'view_interviews': 'View own interviews',

  // Admin permissions
  'manage_users': 'Manage all users',
  'delete_user': 'Delete user accounts',
  'view_dashboard': 'Access admin dashboard',
  'view_all_applications': 'View all applications',
  'manage_applications': 'Update application status',
  'update_applications': 'Update application status',
  'edit_templates': 'Edit email templates',
  'manage_jobs': 'Create and edit jobs',
  'manage_interviews': 'Manage all interviews',
  'view_analytics': 'View system analytics',
  'view_audit_logs': 'View audit logs',
  'manage_settings': 'Manage system settings',

  // Recruiter permissions (future)
  'recruit_users': 'Manage recruitment',
  'schedule_interviews': 'Schedule interviews',
  'view_recruiter_dashboard': 'Access recruiter dashboard',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ROLES = {
  admin: {
    description: 'System Administrator',
    permissions: [
      'manage_users',
      'delete_user',
      'view_dashboard',
      'view_all_applications',
      'manage_applications',
      'update_applications',
      'edit_templates',
      'manage_jobs',
      'manage_interviews',
      'view_analytics',
      'view_audit_logs',
      'manage_settings',
      'view_profile',
      'apply_jobs',
    ] as Permission[],
  },

  user: {
    description: 'Regular User (Job Applicant)',
    permissions: [
      'apply_jobs',
      'view_profile',
      'edit_profile',
      'submit_application',
      'view_my_applications',
      'view_interviews',
    ] as Permission[],
  },

  recruiter: {
    description: 'Recruiter',
    permissions: [
      'recruit_users',
      'schedule_interviews',
      'view_recruiter_dashboard',
      'view_all_applications',
      'manage_applications',
      'view_profile',
    ] as Permission[],
  },
} as const;

export type Role = keyof typeof ROLES;

/**
 * Get permissions for a role
 * @param {string} role - Role name (admin, user, recruiter)
 * @returns {array} Array of permission strings
 */
export const getPermissions = (role: Role): Permission[] => {
  return ROLES[role]?.permissions || [];
};

/**
 * Check if a role has a specific permission
 * @param {string} role - Role name
 * @param {string} permission - Permission to check
 * @returns {boolean} True if role has permission
 */
export const hasPermission = (role: Role, permission: Permission): boolean => {
  const permissions = getPermissions(role);
  return permissions.includes(permission);
};

/**
 * Check if a role has any of the required permissions
 * @param {string} role - Role name
 * @param {array} requiredPermissions - Array of permissions, at least one needed
 * @returns {boolean} True if role has at least one permission
 */
export const hasAnyPermission = (role: Role, requiredPermissions: Permission[]): boolean => {
  const permissions = getPermissions(role);
  return requiredPermissions.some(p => permissions.includes(p));
};

/**
 * Check if a role has all required permissions
 * @param {string} role - Role name
 * @param {array} requiredPermissions - Array of permissions, all needed
 * @returns {boolean} True if role has all permissions
 */
export const hasAllPermissions = (role: Role, requiredPermissions: Permission[]): boolean => {
  const permissions = getPermissions(role);
  return requiredPermissions.every(p => permissions.includes(p));
};