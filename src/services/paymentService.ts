import API from './apiClient'

export interface PaymentData {
  amount: number
  serviceType: string
  applicationId?: string
  description?: string
}

export interface MpesaPaymentData {
  phoneNumber: string
  amount: number
  description: string
  type: 'interview_fee' | 'visa_processing'
}

export const paymentService = {
  initiatePayment: async (paymentData: PaymentData) => {
    const response = await API.post('/payment/initiate', paymentData)
    return response.data
  },

  processPaymentCallback: async (callbackData: any) => {
    const response = await API.post('/payment/callback', callbackData)
    return response.data
  },

  initiateMpesaPayment: async (phoneNumber: string, amount: number, description: string, type: 'interview_fee' | 'visa_processing', applicationId?: string) => {
    return paymentService.initiatePayment({
      amount,
      serviceType: type,
      applicationId,
      description
    })
  },

  // Legacy methods for backward compatibility
  verifyPayment: async (transactionId: string) => {
    const response = await API.post('/payment/verify', {
      transactionId,
      paymentMethod: 'mpesa',
    })
    return response.data
  },
}