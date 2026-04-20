export interface AuthUser {
  id?: string
  _id?: string
  role?: string
  email?: string
  name?: string
  permissions?: string[]
  hasSubmittedApplication?: boolean
  applicationStatus?: string
  [key: string]: any
}

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null

  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.role?.toLowerCase() === 'admin'
}

export const isLoggedIn = (): boolean => {
  return getUser() !== null
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token') || localStorage.getItem('accessToken')
}

export const normalizeUser = (user: AuthUser | null): AuthUser | null => {
  if (!user) return null

  const normalizedUser: AuthUser = { ...user }

  if (!normalizedUser.role && normalizedUser.email?.toLowerCase() === 'admin@talex.com') {
    normalizedUser.role = 'admin'
  }

  if (!normalizedUser.id && normalizedUser._id) {
    normalizedUser.id = normalizedUser._id
  }

  return normalizedUser
}

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return

  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('role')
  localStorage.removeItem('permissions')
}

const getBackendUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    'https://airswift-backend-fjt3.onrender.com'
  ).replace(/\/+$/, '')
}

export const verifyGoogleToken = async (googleToken: string): Promise<{ token: string; user: AuthUser }> => {
  try {
    const baseUrl = getBackendUrl()
    const response = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: googleToken }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Google token verification failed')
    }

    const data = await response.json()

    if (data.token && data.user) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('accessToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  } catch (error: any) {
    console.error('Google OAuth error:', error.message || error)
    throw error
  }
}

const navigateTo = async (router: any, path: string): Promise<void> => {
  if (router && typeof router.push === 'function') {
    try {
      await router.push(path)
      return
    } catch (error) {
      console.warn('Redirect failed via router.push, falling back to window.location:', error)
    }
  }

  if (typeof window !== 'undefined') {
    window.location.href = path
  }
}

export const redirectAfterLogin = async (user: AuthUser | null, router: any): Promise<void> => {
  if (!user) return

  const normalizedUser = normalizeUser(user)
  const role = normalizedUser?.role?.toLowerCase() || 'user'

  if (role === 'admin') {
    await navigateTo(router, '/admin/dashboard')
    return
  }

  if (normalizedUser.hasSubmittedApplication) {
    await navigateTo(router, '/dashboard')
    return
  }

  await navigateTo(router, '/apply')
}

export const normalizeUser = (user) => {
  if (!user) return null

  const normalizedUser = { ...user }

  // Case-insensitive email check for admin
  if (!normalizedUser.role && normalizedUser.email?.toLowerCase() === 'admin@talex.com') {
    normalizedUser.role = 'admin'
    console.log("📌 Normalized admin user based on email:", normalizedUser.email)
  }

  // Normalize ID field
  if (!normalizedUser.id && normalizedUser._id) {
    normalizedUser.id = normalizedUser._id
  }

  return normalizedUser
}

export const redirectAfterLogin = (user, router) => {
  const normalizedUser = normalizeUser(user)
  const role = (normalizedUser?.role || "user").toLowerCase()

  console.log("🔄 Redirect After Login:")
  console.log("   User Email:", normalizedUser?.email)
  console.log("   User Role:", normalizedUser?.role)
  console.log("   Has Submitted Application:", normalizedUser?.hasSubmittedApplication)
  console.log("   Application Status:", normalizedUser?.applicationStatus)
  
  if (role === "admin") {
    console.log("   → Redirecting to /admin/dashboard")
    router.push("/admin/dashboard")
  } else if (role === "user") {
    // Check if user has submitted an application
    if (normalizedUser?.hasSubmittedApplication) {
      console.log("   → User has submitted application, redirecting to /dashboard")
      router.push("/dashboard")
    } else {
      console.log("   → User has NOT submitted application, redirecting to /apply")
      router.push("/apply")
    }
  } else {
    console.log("   → Unknown role, redirecting to /dashboard as default")
    router.push("/dashboard")
  }
}
