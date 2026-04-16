export const hasPermission = (perm: string) => {
  if (typeof window === 'undefined') return false

  const perms = JSON.parse(localStorage.getItem('permissions') || '[]')
  return perms.includes(perm)
}
