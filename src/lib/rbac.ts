import API from './api'

export const getRoles = () => API.get('/roles')
export const getPermissions = () => API.get('/permissions')
export const createRole = (data: any) => API.post('/roles', data)
export const updateRole = (id: string, data: any) => API.put(`/roles/${id}`, data)
export const assignRole = (userId: string, roleId: string) =>
  API.put(`/users/${userId}/role`, { roleId })
