/**
 * Test Helper Utilities for Authentication Testing
 * These utilities can be used in both automated and manual testing scenarios
 */

/**
 * Generate test data for registration
 */
export const generateTestUser = () => {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    email: `testuser+${timestamp}@example.com`,
    password: 'TestPassword123!',
  };
};

/**
 * Check if localStorage contains token
 */
export const hasToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

/**
 * Get stored token
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
};

/**
 * Mock API response for testing
 */
export const createMockAuthResponse = (user: any = {}) => {
  return {
    ok: true,
    json: async () => ({
      message: 'Success',
      token: 'mock_jwt_token_' + Date.now(),
      user: {
        id: '123',
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'user',
        ...user,
      },
    }),
  };
};

/**
 * Mock error response for testing
 */
export const createMockErrorResponse = (message = 'Error') => {
  return {
    ok: false,
    status: 400,
    json: async () => ({
      message,
      error: message,
    }),
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Get error message from API response
 */
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unknown error occurred';
};

/**
 * Test data sets for various scenarios
 */
export const TEST_DATA = {
  VALID_USER: {
    name: 'John Test User',
    email: `john+${Date.now()}@example.com`,
    password: 'TestPassword123!',
  },
  INVALID_EMAIL: {
    name: 'Jane Doe',
    email: 'invalidemail',
    password: 'TestPassword123!',
  },
  WEAK_PASSWORD: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: '123', // Too weak
  },
  DUPLICATE_USER: {
    name: 'Duplicate User',
    email: 'existing@example.com',
    password: 'TestPassword123!',
  },
  LOGIN_VALID: {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
  },
  LOGIN_WRONG_PASSWORD: {
    email: 'testuser@example.com',
    password: 'WrongPassword123!',
  },
  LOGIN_NONEXISTENT: {
    email: 'nonexistent@example.com',
    password: 'TestPassword123!',
  },
};

/**
 * Test scenarios descriptor
 */
export const TEST_SCENARIOS = {
  REGISTRATION: {
    HAPPY_PATH: 'User registers with valid data',
    EMPTY_FIELDS: 'User tries to register with empty fields',
    INVALID_EMAIL: 'User tries to register with invalid email',
    DUPLICATE_EMAIL: 'User tries to register with existing email',
    WEAK_PASSWORD: 'User tries to register with weak password',
  },
  LOGIN: {
    HAPPY_PATH: 'User logs in with valid credentials',
    WRONG_PASSWORD: 'User tries to login with wrong password',
    NONEXISTENT_USER: 'User tries to login with non-existent email',
    EMPTY_FIELDS: 'User tries to login with empty fields',
  },
  SESSION: {
    PERSISTENCE: 'Token persists after page refresh',
    LOGOUT: 'User can logout and session is cleared',
    PROTECTED_ROUTE: 'Unauthenticated user is redirected from protected route',
  },
};
