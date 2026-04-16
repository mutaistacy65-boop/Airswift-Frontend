import axios from 'axios'


const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api',
})

// ✅ Attach token safely
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization // 🚀 prevents "Bearer undefined"
    }
  }

  return config
})

export default API
export { API };

