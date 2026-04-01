import apiClient from './apiClient'

export const authService = {
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
}