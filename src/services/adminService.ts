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
    // Try to use the direct endpoint first, fallback to admin endpoint
    try {
      const response = await API.get('/applications/admin', { params })
      return response.data
    } catch (error: any) {
      // Fallback to admin proxy endpoint
      if (error.response?.status === 404) {
        const response = await API.get('/admin/applications', { params })
        return response.data
      }
      throw error
    }
  },

  getApplication: async (id: string) => {
    const response = await API.get(`/applications/${id}`)
    return response.data
  },

  updateApplicationStatus: async (id: string, status: string, notes?: string) => {
    const response = await API.patch(`/applications/${id}/status`, { status, notes })
    return response.data
  },

  verifyApplicationDocs: async (id: string) => {
    const response = await API.patch(`/applications/${id}`, { status: 'verified' })
    return response.data
  },

  shortlistApplication: async (id: string) => {
    const response = await API.patch(`/applications/${id}/shortlist`, { status: 'shortlisted' })
    return response.data
  },

  addApplicationNote: async (id: string, note: string) => {
    const response = await API.put(`/applications/${id}/notes`, { notes: note })
    return response.data
  },

  bulkUpdateApplications: async (applicationIds: string[], status: string) => {
    // Note: Check if backend supports bulk operations - may need to loop through IDs
    const promises = applicationIds.map(id =>
      API.patch(`/applications/${id}/status`, { status })
    )
    const responses = await Promise.all(promises)
    return { success: true, updated: responses.length }
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

  rescheduleInterview: async (id: string, newDate: string, newTime: string, reason?: string) => {
    const response = await API.post(`/admin/interviews/${id}/reschedule`, {
      scheduledAt: `${newDate}T${newTime}`,
      reason
    })
    return response.data
  },

  updateInterviewStatus: async (id: string, status: string) => {
    const response = await API.post(`/admin/interviews/${id}/status`, { status })
    return response.data
  },

  getInterviewCalendar: async (month: number, year: number) => {
    const response = await API.get('/admin/interviews/calendar', {
      params: { month, year }
    })
    return response.data
  },

  getInterviewStats: async () => {
    const response = await API.get('/admin/interviews/stats')
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
  },

  // Settings Management
  getSettings: async () => {
    const response = await API.get('/settings')
    return response.data
  },

  updateSettings: async (settings: any) => {
    const response = await API.put('/settings', settings)
    return response.data
  },

  // User Management
  getUsers: async (params?: any) => {
    const response = await API.get('/admin/users', { params })
    return response.data
  },

  getUser: async (id: string) => {
    const response = await API.get(`/admin/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, userData: any) => {
    const response = await API.put(`/admin/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id: string) => {
    const response = await API.delete(`/admin/users/${id}`)
    return response.data
  },

  activateUser: async (id: string) => {
    const response = await API.patch(`/admin/users/${id}/activate`)
    return response.data
  },

  deactivateUser: async (id: string) => {
    const response = await API.patch(`/admin/users/${id}/deactivate`)
    return response.data
  },

  suspendUser: async (id: string, suspendedUntil?: string) => {
    const response = await API.put(`/admin/users/${id}/suspend`, {
      suspendedUntil,
    })
    return response.data
  },

  banUser: async (id: string) => {
    const response = await API.put(`/admin/users/${id}/ban`)
    return response.data
  },

  changeUserRole: async (id: string, role: string) => {
    const response = await API.patch(`/admin/users/${id}/role`, { role })
    return response.data
  },

  // Payment Management
  getPayments: async (params?: any) => {
    const response = await API.get('/payment', { params })
    return response.data
  },

  updatePaymentStatus: async (id: string, status: string, notes?: string) => {
    const response = await API.put(`/payment/${id}/status`, { status, notes })
    return response.data
  },

  // Stats are calculated from payments data on the frontend
  getPaymentStats: async () => {
    // Deprecated: Use calculations from getPayments data instead
    throw new Error('Payment stats endpoint deprecated. Calculate stats from payments data.')
  },

  // Audit & Reports
  getAuditLogs: async (params?: any) => {
    const response = await API.get('/admin/audit-logs', { params })
    return response.data
  },

  getEmailLogs: async (params?: any) => {
    const response = await API.get('/email', { params })
    return response.data
  },

  getAuditStats: async () => {
    const response = await API.get('/admin/audit/stats')
    return response.data
  },

  getReports: async () => {
    const response = await API.get('/admin/reports')
    return response.data
  },

  updateReportStatus: async (id: string, status: string) => {
    const response = await API.put(`/admin/reports/${id}/status`, { status })
    return response.data
  },

  // System Health
  getSystemHealth: async () => {
    const response = await API.get('/system-health')
    return response.data
  },

  // Email Management
  sendEmail: async (emailData: any) => {
    const response = await API.post('/admin/email/send', emailData)
    return response.data
  },

  // Bulk Operations on Applications
  bulkDeleteApplications: async (applicationIds: string[], reason?: string) => {
    // Call delete for each application ID
    const promises = applicationIds.map(id =>
      API.delete(`/applications/${id}`)
    )
    const responses = await Promise.all(promises)
    return { success: true, deleted: responses.length }
  },

  sendInterviewInvitation: async (applicationId: string, interviewData: any) => {
    const response = await API.post(`/admin/send-interview/${applicationId}`, interviewData)
    return response.data
  },

  // Email Templates
  getEmailTemplates: async () => {
    const response = await API.get('/admin/email-templates')
    return response.data
  },

  createEmailTemplate: async (templateData: any) => {
    const response = await API.post('/admin/email-templates', templateData)
    return response.data
  },

  updateEmailTemplate: async (id: string, templateData: any) => {
    const response = await API.put(`/admin/email-templates/${id}`, templateData)
    return response.data
  },

  deleteEmailTemplate: async (id: string) => {
    const response = await API.delete(`/admin/email-templates/${id}`)
    return response.data
  },

  // Analytics
  getApplicationsOverTime: async (days: number = 30) => {
    const response = await API.get('/admin/dashboard/applications-over-time', { params: { days } })
    return response.data
  },

  getCVScoreDistribution: async () => {
    const response = await API.get('/admin/dashboard/cv-score-distribution')
    return response.data
  },

  getJobApplicationDistribution: async () => {
    const response = await API.get('/admin/dashboard/job-application-distribution')
    return response.data
  },

  getInterviewDashboardStats: async () => {
    const response = await API.get('/admin/dashboard/interview-stats')
    return response.data
  },

  getHiringFunnel: async () => {
    const response = await API.get('/admin/dashboard/hiring-funnel')
    return response.data
  },

  getTopSkills: async () => {
    const response = await API.get('/admin/dashboard/top-skills')
    return response.data
  },

  getAverageTimeToHire: async () => {
    const response = await API.get('/admin/dashboard/average-time-to-hire')
    return response.data
  }
}