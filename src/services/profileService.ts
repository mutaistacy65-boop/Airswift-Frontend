import API from './apiClient'

export const profileService = {
  setupProfile: async (formData: FormData) => {
    const response = await API.post('/api/profile/setup-profile', formData)
    return response.data
  },
}
