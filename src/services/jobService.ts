import apiClient from './apiClient'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  requirements: string[]
  type: 'full-time' | 'part-time' | 'contract'
  postedDate: string
  appliedCount: number
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  resumeUrl: string
  coverLetter: string
  appliedDate: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
}

export const jobService = {
  getAllJobs: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/jobs', { params: { page, limit } })
    return response.data
  },

  getJobById: async (id: string) => {
    const response = await apiClient.get(`/jobs/${id}`)
    return response.data
  },

  searchJobs: async (query: string, filters?: any) => {
    const response = await apiClient.get('/jobs/search', { params: { q: query, ...filters } })
    return response.data
  },

  applyForJob: async (jobId: string, resume: File, coverLetter?: string) => {
    const formData = new FormData()
    formData.append('job_id', jobId)
    formData.append('resume', resume)
    if (coverLetter) formData.append('cover_letter', coverLetter)

    const response = await apiClient.post('/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getMyApplications: async () => {
    const response = await apiClient.get('/applications/my')
    return response.data
  },

  getApplicationById: async (id: string) => {
    const response = await apiClient.get(`/applications/${id}`)
    return response.data
  },

  cancelApplication: async (id: string) => {
    const response = await apiClient.delete(`/applications/${id}`)
    return response.data
  },
}