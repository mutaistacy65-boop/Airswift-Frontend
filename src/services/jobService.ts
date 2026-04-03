import API from './apiClient'

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
  status: 'pending' | 'reviewed' | 'accepted' | 'interview_scheduled' | 'interview_completed' | 'visa_payment_pending' | 'visa_processing' | 'visa_ready' | 'rejected'
  documents?: {
    passport?: string
    nationalId?: string
    cv?: string
    certificates?: string[]
  }
  interviewDetails?: {
    zoomLink?: string
    scheduledDate?: string
    notes?: string
  }
}

export const jobService = {
  getAllJobs: async (page = 1, limit = 10) => {
    const response = await API.get('/jobs', { params: { page, limit } })
    return response.data
  },

  getJobById: async (id: string) => {
    const response = await API.get(`/jobs/${id}`)
    return response.data
  },

  searchJobs: async (query: string, filters?: any) => {
    const response = await API.get('/jobs/search', { params: { q: query, ...filters } })
    return response.data
  },

  applyForJob: async (jobId: string, cv: File, coverLetter?: string, additionalData?: FormData) => {
    const formData = new FormData()
    formData.append('job_id', jobId)
    formData.append('cv', cv)
    if (coverLetter) formData.append('cover_letter', coverLetter)

    // Add additional documents if provided
    if (additionalData) {
      for (const [key, value] of additionalData.entries()) {
        if (key !== 'job_id' && key !== 'cv' && key !== 'cover_letter') {
          formData.append(key, value as File)
        }
      }
    }

    const response = await API.post('/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getMyApplications: async () => {
    const response = await API.get('/applications/my')
    return response.data
  },

  getApplicationById: async (id: string) => {
    const response = await API.get(`/applications/${id}`)
    return response.data
  },

  cancelApplication: async (id: string) => {
    const response = await API.delete(`/applications/${id}`)
    return response.data
  },

  getJobs: async () => {
    const response = await API.get('/jobs')
    return response.data
  },
}