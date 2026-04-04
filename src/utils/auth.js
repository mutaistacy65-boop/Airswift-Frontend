export const getUserFromToken = () => {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('accessToken')
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch (error) {
    console.error('Invalid access token:', error)
    return null
  }
}
