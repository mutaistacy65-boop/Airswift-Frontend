import API from './apiClient'
import { JobCategory, JobCategoryStats, EmailTemplate, InterviewPipelineItem } from '@/types/jobCategories'

export const jobCategoryService = {
  // Category Management
  getAllCategories: async (): Promise<JobCategory[]> => {
    const response = await API.get('/job-categories')
    return response.data
  },

  createCategory: async (category: Omit<JobCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobCategory> => {
    const response = await API.post('/job-categories', category)
    return response.data
  },

  updateCategory: async (id: string, category: Partial<JobCategory>): Promise<JobCategory> => {
    const response = await API.put(`/job-categories/${id}`, category)
    return response.data
  },

  deleteCategory: async (id: string): Promise<void> => {
    await API.delete(`/job-categories/${id}`)
  },

  // Category Statistics
  getCategoryStats: async (): Promise<JobCategoryStats[]> => {
    const response = await API.get('/job-categories/stats')
    return response.data
  },

  // Interview Pipeline
  getInterviewPipeline: async (): Promise<InterviewPipelineItem[]> => {
    const response = await API.get('/applications/interview-pipeline')
    return response.data
  }
}

export const emailService = {
  // Email Templates
  getAllTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await API.get('/email-templates')
    return response.data
  },

  createTemplate: async (template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => {
    const response = await API.post('/email-templates', template)
    return response.data
  },

  updateTemplate: async (id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const response = await API.put(`/email-templates/${id}`, template)
    return response.data
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await API.delete(`/email-templates/${id}`)
  },

  // Send Email
  sendEmail: async (templateId: string, recipientEmail: string, variables: Record<string, string>): Promise<void> => {
    await API.post('/emails/send', {
      templateId,
      recipientEmail,
      variables
    })
  },

  // Preview Template
  previewTemplate: async (templateId: string, variables: Record<string, string>): Promise<{ subject: string; body: string }> => {
    const response = await API.post('/email-templates/preview', {
      templateId,
      variables
    })
    return response.data
  }
}