import apiClient from './apiClient'

export const paymentService = {
  initiatePayment: async (paymentData: any) => {
    const response = await apiClient.post('/payment/initiate', paymentData)
    return response.data
  },

  verifyPayment: async (paymentData: any) => {
    const response = await apiClient.post('/payment/verify', paymentData)
    return response.data
  },
}