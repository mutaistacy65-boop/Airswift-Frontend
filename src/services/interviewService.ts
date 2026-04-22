import API from './apiClient'

export interface InterviewResult {
  sessionId: string
  totalQuestions: number
  averageConfidence: number
  overallFeedback: string
  completedAt: string
}

export const interviewService = {
  getMyInterviews: async () => {
    const response = await API.get('/interviews/my')
    return response.data
  },

  startVoiceInterview: async (applicationId: string, jobRole: string) => {
    const response = await API.post('/interviews/start-voice', {
      applicationId,
      jobRole
    })
    return response.data
  },

  getInterviewResults: async (interviewId: string) => {
    const response = await API.get(`/interviews/${interviewId}/results`)
    return response.data
  },

  submitInterviewFeedback: async (interviewId: string, feedback: any) => {
    const response = await API.post(`/interviews/${interviewId}/feedback`, feedback)
    return response.data
  },

  // Reschedule interview (applicant)
  rescheduleInterview: async (interviewId: string, newDate: string, newTime: string) => {
    const response = await API.patch(`/interviews/${interviewId}/reschedule`, {
      date: newDate,
      time: newTime,
    })
    return response.data
  },

  // Get interview details
  getInterviewDetails: async (interviewId: string) => {
    const response = await API.get(`/interviews/${interviewId}`)
    return response.data
  },

  // Update interview status (admin)
  updateInterviewStatus: async (interviewId: string, status: 'scheduled' | 'done' | 'no-show') => {
    const response = await API.patch(`/interviews/${interviewId}/status`, { status })
    return response.data
  },

  // Get all interviews for admin
  getAllInterviews: async (page = 1, limit = 20) => {
    const response = await API.get('/admin/interviews', { params: { page, limit } })
    return response.data
  },
}