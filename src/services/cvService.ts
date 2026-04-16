import api from '@/lib/api'

export interface CVScore {
  overallScore: number
  skillsMatch: number
  experienceScore: number
  keywordsMatch: number
  educationScore: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export const cvService = {
  /**
   * Analyze CV and generate AI score
   * Scores CV based on:
   * - Skills match with job requirements (0-100)
   * - Years of experience (0-100)
   * - Keywords match with job description (0-100)
   * - Education level (0-100)
   * - Overall fit (average of above)
   */
  analyzeCv: async (
    cvText: string,
    jobDescription: string,
    requirements: string[]
  ): Promise<CVScore> => {
    try {
      const response = await api.post('/admin/ai/cv-analysis', {
        cvText,
        jobDescription,
        requirements,
      })
      return response.data
    } catch (error: any) {
      console.error('CV Analysis Error:', error)
      throw error
    }
  },

  /**
   * Score a candidate against job requirements
   */
  scoreCandidate: async (
    candidateName: string,
    email: string,
    cv: string,
    jobId: string,
    jobDescription: string
  ): Promise<{ candidateName: string; score: number; analysis: CVScore }> => {
    try {
      const response = await api.post('/admin/candidates/score', {
        candidateName,
        email,
        cv,
        jobId,
        jobDescription,
      })
      return response.data
    } catch (error: any) {
      console.error('Candidate Scoring Error:', error)
      throw error
    }
  },

  /**
   * Batch score multiple candidates
   */
  batchScoreCandidates: async (
    candidates: Array<{ id: string; name: string; cv: string }>,
    jobDescription: string,
    requirements: string[]
  ): Promise<Array<{ id: string; name: string; score: number }>> => {
    try {
      const response = await api.post('/admin/candidates/batch-score', {
        candidates,
        jobDescription,
        requirements,
      })
      return response.data
    } catch (error: any) {
      console.error('Batch Scoring Error:', error)
      throw error
    }
  },

  /**
   * Get scoring details for a candidate
   */
  getCandidateScore: async (candidateId: string): Promise<CVScore> => {
    try {
      const response = await api.get(`/admin/candidates/${candidateId}/score`)
      return response.data
    } catch (error: any) {
      console.error('Get Score Error:', error)
      throw error
    }
  },
}

export default cvService
