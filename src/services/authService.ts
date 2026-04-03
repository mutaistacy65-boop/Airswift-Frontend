import API from './apiClient'

export const authService = {
  login: async (email: string, password: string) => {
    const response = await API.post('/login', {
      email,
      password,
    })
    return response.data
  },

  register: async (name: string, email: string, password: string) => {
    const response = await API.post('/register', {
      name,
      email,
      password,
    })
    return response.data
  },

  updateProfile: async (userData: any) => {
    const response = await API.put('/profile', userData)
    return response.data
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData()
    formData.append('cv', file)

    const response = await API.post('/profile/upload-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await API.post('/auth/change-password', {
      oldPassword,
      newPassword,
    })
    return response.data
  },

  forgotPassword: async (email: string) => {
    // Use local mock API during development; replace with external endpoint as needed.
    const response = await API.post('/api/auth/forgot-password', { email })
    return response.data
  },

  sendRegistrationOTP: async (userData: { name: string; email: string; password: string; role?: string }) => {
    const payload = {
      ...userData,
      role: userData.role || 'job-seeker',
    }
    const response = await API.post('/api/auth/send-registration-otp', payload)
    return response.data
  },

  resendRegistrationOTP: async (email: string, name?: string, password?: string) => {
    if (!email || !name || !password) {
      throw new Error('Missing email, name, or password for OTP resend.')
    }
    return authService.sendRegistrationOTP({ email, name, password, role: 'job-seeker' })
  },

  verifyRegistrationOTP: async (email: string, otp: string) => {
    const response = await API.post('/api/auth/verify-registration-otp', { email, otp })
    return response.data
  },
}