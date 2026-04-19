/**
 * 🎯 Redirect Logic - Determines where users should be sent after login
 * Implements the full flow:
 * 1. Admin users → /admin/dashboard
 * 2. Users who submitted applications → /dashboard
 * 3. New users → /apply
 */

export interface User {
  role?: string;
  hasSubmittedApplication?: boolean;
  _id?: string;
  id?: string;
  [key: string]: any;
}

/**
 * Get the redirect path based on user role and application status
 * @param user - User object from login response or localStorage
 * @returns The path where user should be redirected
 *
 * @example
 * const user = { role: 'admin', hasSubmittedApplication: false };
 * getRedirectPath(user); // Returns '/admin/dashboard'
 */
export const getRedirectPath = (user: User | null | undefined): string => {
  if (!user) {
    return '/login';
  }

  // ✅ 1. Admin users always go to admin dashboard
  if (user.role.toLowerCase() === 'admin') {
    console.log('👨‍💼 Admin user detected, redirecting to /admin/dashboard');
    return '/admin/dashboard';
  }

  // ✅ 2. Users who have submitted applications go to user dashboard
  if (user.hasSubmittedApplication) {
    console.log('✅ Application submitted, redirecting to /dashboard');
    return '/dashboard';
  }

  // ✅ 3. New users without applications go to apply page
  console.log('📝 New user, redirecting to /apply');
  return '/apply';
};
