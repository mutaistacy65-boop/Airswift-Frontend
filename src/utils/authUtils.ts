/**
 * Safe utility functions for authentication
 */

export interface StoredUser {
  id?: string;
  _id?: string;
  role: string;
  email?: string;
  name?: string;
  isVerified?: boolean;
  hasSubmittedApplication?: boolean;
  [key: string]: any;
}

/**
 * Safely get user from localStorage (works only in browser)
 * @returns User object or null if not found
 */
export const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }
    
    const user = JSON.parse(userStr);
    return user as StoredUser;
  } catch (error) {
    console.error("🔴 Error parsing stored user:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns true if user exists in localStorage
 */
export const isAuthenticated = (): boolean => {
  return getStoredUser() !== null;
};

/**
 * Check if user has a specific role
 * @param role - Role to check
 * @returns true if user has the specified role
 */
export const hasRole = (role: string): boolean => {
  const user = getStoredUser();
  return user?.role === role;
};

/**
 * Check if user is admin
 * @returns true if user role is 'admin'
 */
export const isAdmin = (): boolean => {
  return hasRole("admin");
};

/**
 * Check if user has submitted application
 * @returns true if user.hasSubmittedApplication is true
 */
export const hasSubmittedApplication = (): boolean => {
  const user = getStoredUser();
  return user?.hasSubmittedApplication === true;
};

/**
 * Get stored authentication token
 * @returns Token string or null
 */
export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token") || localStorage.getItem("accessToken");
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuthData = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
  localStorage.removeItem("permissions");
  localStorage.removeItem("adminToken");
};
