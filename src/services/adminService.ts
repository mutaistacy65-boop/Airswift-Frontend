import API from './apiClient'

export const adminService = {
  // Jobs Management
  createJob: async (jobData: any) => {
    const response = await API.post('/admin/jobs', jobData)
    return response.data
  },

  updateJob: async (id: string, jobData: any) => {
    const response = await API.put(`/admin/jobs/${id}`, jobData)
    return response.data
  },

  deleteJob: async (id: string) => {
    const response = await API.delete(`/admin/jobs/${id}`)
    return response.data
  },

  getJobs: async (params?: any) => {
    const response = await API.get('/admin/jobs', { params })
    return response.data
  },

  // Categories Management
  getCategories: async () => {
    const response = await API.get('/admin/categories')
    return response.data
  },

  createCategory: async (categoryData: any) => {
    const response = await API.post('/admin/categories', categoryData)
    return response.data
  },

  updateCategory: async (id: string, categoryData: any) => {
    const response = await API.put(`/admin/categories/${id}`, categoryData)
    return response.data
  },

  deleteCategory: async (id: string) => {
    const response = await API.delete(`/admin/categories/${id}`)
    return response.data
  },

  // Applications Management
  getAllApplications: async (params?: any) => {
    const response = await API.get('/admin/applications', { params })
    return response.data
  },

  getApplication: async (id: string) => {
    const response = await API.get(`/admin/applications/${id}`)
    return response.data
  },

  updateApplicationStatus: async (id: string, status: string, notes?: string) => {
    const response = await API.patch(`/admin/applications/${id}`, { status, notes })
    return response.data
  },

  addApplicationNote: async (id: string, note: string) => {
    const response = await API.post(`/admin/applications/${id}`, { note })
    return response.data
  },

  bulkUpdateApplications: async (applicationIds: string[], status: string) => {
    const response = await API.patch('/admin/applications', {
      applicationIds,
      status,
      bulkAction: 'status_update'
    })
    return response.data
  },

  // Interview Management
  scheduleInterview: async (interviewData: any) => {
    const response = await API.post('/admin/interviews', interviewData)
    return response.data
  },

  getInterviews: async (params?: any) => {
    const response = await API.get('/admin/interviews', { params })
    return response.data
  },

  getInterview: async (id: string) => {
    const response = await API.get(`/admin/interviews/${id}`)
    return response.data
  },

  updateInterview: async (id: string, interviewData: any) => {
    const response = await API.put(`/admin/interviews/${id}`, interviewData)
    return response.data
  },

  deleteInterview: async (id: string) => {
    const response = await API.delete(`/admin/interviews/${id}`)
    return response.data
  },

  // AI CV Analysis
  analyzeCV: async (applicationId: string) => {
    const response = await API.post('/admin/cv-scoring/analyze', { applicationId })
    return response.data
  },

  // Email Management
  sendBulkEmails: async (applicationIds: string[], templateId: string, variables?: any) => {
    const response = await API.post('/admin/email/send-bulk', {
      applicationIds,
      templateId,
      variables
    })
    return response.data
  },

  // Offer Management
  generateOffer: async (applicationId: string, offerDetails?: any) => {
    const response = await API.post(`/admin/generate-offer/${applicationId}`, { offerDetails })
    return response.data
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await API.get('/admin/dashboard')
    return response.data
  },

  // Job Analytics
  getJobAnalytics: async () => {
    const response = await API.get('/jobs/dashboard/categories')
    return response.data
  }
}
    const response = await API.put(`/admin/interviews/${id}`, interviewData)
    return response.data
  },

  // Users Management
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await API.get('/admin/users', { params: { page, limit } })
    return response.data
  },

  updateUserStatus: async (userId: string, status: string) => {
    const response = await API.put(`/admin/users/${userId}`, { status })
    return response.data
  },

  deleteUser: async (userId: string) => {
    const response = await API.delete(`/admin/users/${userId}`)
    return response.data
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await API.get('/dashboard/summary')
    return response.data
  },

  // Settings Management
  getSettings: async () => {
    const response = await API.get('/admin/settings')
    return response.data
  },

  updateSettings: async (settings: any) => {
    const response = await API.put('/admin/settings', settings)
    return response.data
  },
}