import apiClient from './apiClient'

export const adminService = {
  // Jobs Management
  createJob: async (jobData: any) => {
    const response = await apiClient.post('/admin/jobs', jobData)
    return response.data
  },

  updateJob: async (id: string, jobData: any) => {
    const response = await apiClient.put(`/admin/jobs/${id}`, jobData)
    return response.data
  },

  deleteJob: async (id: string) => {
    const response = await apiClient.delete(`/admin/jobs/${id}`)
    return response.data
  },

  // Applications Management
  getAllApplications: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/admin/applications', { params: { page, limit } })
    return response.data
  },

  updateApplicationStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/admin/applications/${id}/status`, { status })
    return response.data
  },

  // Interview Scheduling
  scheduleInterview: async (applicationId: string, interviewData: any) => {
    const response = await apiClient.post('/admin/interviews/schedule', {
      application_id: applicationId,
      ...interviewData,
    })
    return response.data
  },

  getInterviews: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/admin/interviews', { params: { page, limit } })
    return response.data
  },

  updateInterview: async (id: string, interviewData: any) => {
    const response = await apiClient.put(`/admin/interviews/${id}`, interviewData)
    return response.data
  },

  // Users Management
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/admin/users', { params: { page, limit } })
    return response.data
  },

  updateUserStatus: async (userId: string, status: string) => {
    const response = await apiClient.put(`/admin/users/${userId}`, { status })
    return response.data
  },

  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`)
    return response.data
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/stats')
    return response.data
  },
}