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
  resumeUrl?: string
  coverLetter?: string
  appliedDate?: string
  createdAt?: string
  updatedAt?: string
  status:
    | 'Submitted'
    | 'Under Review'
    | 'Shortlisted'
    | 'Interview Scheduled'
    | 'Hired'
    | 'Rejected'
    | 'rejected'
    | 'pending'
    | 'reviewed'
    | 'accepted'
    | 'interview_scheduled'
    | 'interview_completed'
    | 'visa_payment_pending'
    | 'visa_processing'
    | 'visa_ready'
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
  aiScore?: number
  resumeSnapshot?: string
  interviewId?: string | null
  notes?: string
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  jobTitle?: string
  jobLocation?: string
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

  searchJobs: async (keyword: string, filters?: any) => {
    const response = await API.get('/jobs/search', { params: { keyword, ...filters } })
    return response.data
  },

  applyForJob: async (jobId: string, cv: File, coverLetter?: string, additionalData?: FormData) => {
    const formData = new FormData()
    formData.append('jobId', jobId)
    formData.append('cv', cv)
    if (coverLetter) formData.append('coverLetter', coverLetter)

    if (additionalData) {
      for (const [key, value] of additionalData.entries()) {
        if (key !== 'jobId' && key !== 'cv' && key !== 'coverLetter') {
          formData.append(key, value as File)
        }
      }
    }

    // ✅ Authorization header is set automatically by API interceptor
    const response = await API.post('/applications/apply', formData)
    return response.data
  },

  getMyApplications: async (userId?: string) => {
    const params = userId ? { userId } : undefined
    const response = await API.get('/applications/my', { params })
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

  getJobAnalytics: async () => {
    const response = await API.get('/jobs/dashboard/categories')
    return response.data
  },
}