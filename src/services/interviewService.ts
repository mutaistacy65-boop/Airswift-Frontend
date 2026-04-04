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
  }
}