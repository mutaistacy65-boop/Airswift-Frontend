/**
 * Application Service
 * Handles all application-related API calls
 */

import API from './apiClient'

export const applicationService = {
  /**
   * Submit a new application for a job
   * @param jobId - ID of the job to apply for
   * @param phone - Phone number of the applicant
   * @param cv - CV file
   * @param passport - Passport file
   * @param nationalId - National ID file
   */
  submitApplication: async (
    jobId: string,
    phone: string,
    cv: File,
    passport: File,
    nationalId: File
  ) => {
    const formData = new FormData()
    formData.append('jobId', jobId)
    formData.append('phone', phone)
    formData.append('cv', cv)
    formData.append('passport', passport)
    formData.append('nationalId', nationalId)

    const response = await API.post('/applications', formData)
    return response.data
  },

  /**
   * Get all applications submitted by the current user
   */
  getMyApplications: async (params?: any) => {
    const response = await API.get('/applications/my', { params })
    return response.data
  },

  /**
   * Get a specific application by ID
   * @param id - Application ID
   */
  getApplicationById: async (id: string) => {
    const response = await API.get(`/applications/${id}`)
    return response.data
  },

  /**
   * Cancel an application
   * @param id - Application ID
   */
  cancelApplication: async (id: string) => {
    const response = await API.delete(`/applications/${id}`)
    return response.data
  },

  /**
   * Download application document
   * @param id - Application ID
   * @param fileType - Type of file to download: 'cv', 'passport', or 'nationalId'
   */
  downloadDocument: async (id: string, fileType: 'cv' | 'passport' | 'nationalId') => {
    const response = await API.get(`/applications/${id}/download`, {
      params: { fileType },
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Get available jobs for application (public endpoint)
   */
  getAvailableJobs: async () => {
    const response = await API.get('/applications/job-options')
    return response.data
  },

  // ADMIN ENDPOINTS

  /**
   * Get all applications (admin only)
   */
  getAllApplications: async (params?: any) => {
    // Use the dedicated admin endpoint
    const response = await API.get('/applications/admin', { params })
    return response.data
  },

  /**
   * Update application status (admin only)
   * @param id - Application ID
   * @param status - New status (pending, reviewed, shortlisted, accepted, rejected, interview)
   * @param notes - Optional notes
   */
  updateApplicationStatus: async (
    id: string,
    status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'interview',
    notes?: string
  ) => {
    const response = await API.put(`/applications/${id}/status`, { status, notes })
    return response.data
  },

  /**
   * Add notes to an application (admin only)
   * @param id - Application ID
   * @param notes - Notes to add
   */
  addApplicationNotes: async (id: string, notes: string) => {
    const response = await API.put(`/applications/${id}/notes`, { notes })
    return response.data
  },

  /**
   * Shortlist an application (admin only)
   * @param id - Application ID
   */
  shortlistApplication: async (id: string) => {
    const response = await API.patch(`/applications/${id}/shortlist`, { status: 'shortlisted' })
    return response.data
  },

  /**
   * Reject an application (admin only)
   * @param id - Application ID
   * @param reason - Reason for rejection
   */
  rejectApplication: async (id: string, reason?: string) => {
    const response = await API.patch(`/applications/${id}`, {
      status: 'rejected',
      notes: reason,
    })
    return response.data
  },

  /**
   * Schedule interview for an application (admin only)
   * @param id - Application ID
   * @param interviewDate - Date and time of the interview
   */
  scheduleInterview: async (id: string, interviewDate: string) => {
    const response = await API.patch(`/applications/${id}/status`, {
      status: 'interview',
      interviewDate,
    })
    return response.data
  },
}

export default applicationService
