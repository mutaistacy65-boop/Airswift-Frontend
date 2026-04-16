export const getUser = () => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAdmin = () => {
  const user = getUser()
  return user?.role === 'admin'
}

export const isUser = () => {
  const user = getUser()
  return user?.role === 'user'
}
