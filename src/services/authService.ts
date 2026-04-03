import apiClient from './apiClient'
import API_BASE_URL from '../api'

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Login failed')
    }
    const data = await response.json()
    return data
  },

  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Registration failed')
    }
    const data = await response.json()
    return data
  },

  updateProfile: async (userData: any) => {
    const response = await apiClient.put('/profile', userData)
    return response.data
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData()
    formData.append('cv', file)

    const response = await apiClient.post('/profile/upload-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    })
    return response.data
  },

  forgotPassword: async (email: string) => {
    // Use local mock API during development; replace with external endpoint as needed.
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.data
  },

  sendRegistrationOTP: async (userData: { name: string; email: string; password: string; role?: string }) => {
    const payload = {
      ...userData,
      role: userData.role || 'job-seeker',
    }
    const response = await apiClient.post('/api/auth/send-registration-otp', payload)
    return response.data
  },

  resendRegistrationOTP: async (email: string, name?: string, password?: string) => {
    if (!email || !name || !password) {
      throw new Error('Missing email, name, or password for OTP resend.')
    }
    return authService.sendRegistrationOTP({ email, name, password, role: 'job-seeker' })
  },

  verifyRegistrationOTP: async (email: string, otp: string) => {
    const response = await apiClient.post('/api/auth/verify-registration-otp', { email, otp })
    return response.data
  },
}