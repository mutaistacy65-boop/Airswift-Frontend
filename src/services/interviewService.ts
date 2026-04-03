import API from './apiClient'

export const interviewService = {
  getMyInterviews: async () => {
    const response = await API.get('/interviews/my')
    return response.data
  },
}