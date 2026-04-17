import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com/api'

// ✅ Log API Configuration
console.log('🌍 API BASE URL:', baseURL)

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true, // needed for cookies
})

// ✅ Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ✅ Response interceptor (AUTO REFRESH)
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'https://airswift-backend-fjt3.onrender.com/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newToken = res.data.accessToken

        localStorage.setItem('token', newToken)

        // retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return API(originalRequest)
      } catch (err) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default API

