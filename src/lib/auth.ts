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
