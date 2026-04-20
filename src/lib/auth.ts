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

export const normalizeUser = (user) => {
  if (!user) return null

  const normalizedUser = { ...user }

  if (!normalizedUser.role && normalizedUser.email === 'admin@talex.com') {
    normalizedUser.role = 'admin'
  }

  if (!normalizedUser.id && normalizedUser._id) {
    normalizedUser.id = normalizedUser._id
  }

  return normalizedUser
}

export const redirectAfterLogin = (user, router) => {
  const normalizedUser = normalizeUser(user)
  const role = normalizedUser?.role || "user"

  if (role === "admin") {
    router.push("/admin/dashboard")
  } else {
    router.push("/dashboard")
  }
}
