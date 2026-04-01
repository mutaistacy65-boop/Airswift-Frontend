import apiClient from './apiClient'

export const interviewService = {
  getMyInterviews: async () => {
    const response = await apiClient.get('/interviews/my')
    return response.data
  },
}