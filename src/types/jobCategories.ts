export interface JobCategory {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  jobCount?: number
  applicationCount?: number
}

export interface JobCategoryStats {
  categoryId: string
  categoryName: string
  totalJobs: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  interviewScheduled: number
  interviewCompleted: number
  visaProcessing: number
  visaReady: number
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  stage: ApplicationStage | 'password_reset'
  isActive: boolean
  variables: string[] // e.g., ['applicantName', 'jobTitle', 'companyName', 'interviewDate']
}

export type ApplicationStage =
  | 'application_submitted'
  | 'application_reviewed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'visa_payment_required'
  | 'visa_processing_started'
  | 'visa_ready'
  | 'application_rejected'

export interface InterviewPipelineItem {
  applicantId: string
  applicantName: string
  jobId: string
  jobTitle: string
  categoryName: string
  currentStage: ApplicationStage
  stageDate: string
  nextAction?: string
  daysInStage: number
  priority: 'high' | 'medium' | 'low'
}