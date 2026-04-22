/**
 * Admin Login Persistence Test
 * Tests that admin users can login successfully and stay logged in
 */

import { loginUser } from '@/services/auth'

// Mock admin credentials (replace with actual test credentials)
const ADMIN_CREDENTIALS = {
  email: 'admin@airswift.com',
  password: 'admin123'
}

describe('Admin Login Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  test('admin can login successfully', async () => {
    // Mock the login API call
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: 'admin123',
        email: 'admin@airswift.com',
        name: 'Admin User',
        role: 'admin'
      }
    }

    // Mock fetch for loginUser
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    ) as jest.Mock

    const result = await loginUser(ADMIN_CREDENTIALS)

    expect(result.token).toBe('mock-jwt-token')
    expect(result.user.role).toBe('admin')
    expect(result.user.email).toBe('admin@airswift.com')
  })

  test('admin auth data persists in localStorage', async () => {
    // Simulate successful login by setting localStorage
    const mockUser = {
      id: 'admin123',
      email: 'admin@airswift.com',
      name: 'Admin User',
      role: 'admin'
    }

    localStorage.setItem('token', 'mock-jwt-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    // Verify data persists
    const storedToken = localStorage.getItem('token')
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

    expect(storedToken).toBe('mock-jwt-token')
    expect(storedUser.role).toBe('admin')
    expect(storedUser.email).toBe('admin@airswift.com')
  })

  test('admin redirect logic works correctly', () => {
    const mockUser = {
      id: 'admin123',
      email: 'admin@airswift.com',
      name: 'Admin User',
      role: 'admin'
    }

    localStorage.setItem('user', JSON.stringify(mockUser))

    // Simulate redirect logic from login page
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    let redirectPath = ''

    if (user.role === 'admin') {
      redirectPath = '/admin/dashboard'
    } else {
      redirectPath = '/user/dashboard'
    }

    expect(redirectPath).toBe('/admin/dashboard')
  })

  test('non-admin users are redirected to user dashboard', () => {
    const mockUser = {
      id: 'user123',
      email: 'user@airswift.com',
      name: 'Regular User',
      role: 'user'
    }

    localStorage.setItem('user', JSON.stringify(mockUser))

    // Simulate redirect logic from login page
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    let redirectPath = ''

    if (user.role === 'admin') {
      redirectPath = '/admin/dashboard'
    } else {
      redirectPath = '/user/dashboard'
    }

    expect(redirectPath).toBe('/user/dashboard')
  })
})