import apiClient from './apiClient'

export interface MpesaPaymentData {
  phoneNumber: string
  amount: number
  description: string
  type: 'interview_fee' | 'visa_processing'
}

export const paymentService = {
  initiatePayment: async (paymentData: MpesaPaymentData) => {
    const response = await apiClient.post('/payment/initiate', {
      ...paymentData,
      paymentMethod: 'mpesa',
      currency: 'KES',
    })
    return response.data
  },

  verifyPayment: async (transactionId: string) => {
    const response = await apiClient.post('/payment/verify', {
      transactionId,
      paymentMethod: 'mpesa',
    })
    return response.data
  },

  initiateMpesaPayment: async (phoneNumber: string, amount: number, description: string, type: 'interview_fee' | 'visa_processing') => {
    return paymentService.initiatePayment({
      phoneNumber: phoneNumber.replace(/^0/, '254'), // Convert to international format
      amount,
      description,
      type,
    })
  },
}