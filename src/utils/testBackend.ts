/**
 * Test Backend Connection Utility
 * Use this to verify the frontend can connect to the backend API
 */

import API from '@/services/apiClient'
import axios from 'axios'

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com'
export const API_URL =
  BACKEND_BASE_URL.replace(/\/+$/, '') +
  (BACKEND_BASE_URL.endsWith('/api') ? '' : '/api')

export const testBackendConnection = async () => {
  try {
    console.log('🔄 Testing backend connection...')
    console.log(`📍 Backend URL: ${process.env.NEXT_PUBLIC_API_URL}`)

    // Test 1: Direct axios to backend API
    console.log('\n📡 Test 1: Direct axios request')
    const axiosResult = await axios.get(API_URL)
    const axiosData = axiosResult.data
    console.log('✅ Direct axios response:', axiosData)

    // Test 2: Using axios API client
    console.log('\n📡 Test 2: Axios API client request')
    const axiosResponse = await API.get('/')
    console.log('✅ Axios response:', axiosResponse.data)

    // Test 3: Check API health endpoint (if available)
    console.log('\n📡 Test 3: Health check endpoint')
    try {
      const healthResponse = await API.get('/health')
      console.log('✅ Health check:', healthResponse.data)
    } catch (error) {
      console.log('ℹ️ Health endpoint not available')
    }

    console.log('\n✅ Backend connection test completed successfully!')
    return {
      success: true,
      backendUrl: process.env.NEXT_PUBLIC_API_URL,
      axiosData,
      axiosClientData: axiosResponse.data,
      message: 'Backend is reachable and responding'
    }
  } catch (error) {
    console.error('❌ Backend connection test failed:', error)
    return {
      success: false,
      backendUrl: process.env.NEXT_PUBLIC_API_URL,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to backend. Check if backend is running and URL is correct.'
    }
  }
}

// Alternative simple test function
export const simpleBackendTest = async () => {
  try {
    const result = await axios.get(API_URL)
    const data = result.data
    console.log('Backend Status:', data)
    return data
  } catch (error) {
    console.error('Backend connection error:', error)
    throw error
  }
}
