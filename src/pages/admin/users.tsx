import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import { adminService } from '@/services/adminService'
import { formatDate } from '@/utils/helpers'
import { Edit2, Trash2, Plus, Search, Eye, Lock, Unlock, Shield } from 'lucide-react'

interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: 'admin' | 'recruiter' | 'user' | 'job_seeker'
  isVerified: boolean
  isActive: boolean
  createdAt: string
  lastLogin?: string
  phone?: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'recruiter' | 'user' | 'job_seeker',
    phone: '',
  })

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '👥 Users', href: '/admin/users' },
    { label: '💼 Jobs', href: '/admin/jobs' },
    { label: '📝 Applications', href: '/admin/applications' },
    { label: '📞 Interviews', href: '/admin/interviews' },
    { label: '💰 Payments', href: '/admin/payments' },
    { label: '📋 Audit Logs', href: '/admin/audit' },
    { label: '🔍 Health', href: '/admin/health' },
    { label: '⚙️ Settings', href: '/admin/settings' },
  ]

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers()
    }
  }, [isAuthorized, currentPage, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      }
      const response = await adminService.getUsers(params)
      setUsers(Array.isArray(response) ? response : response.users || [])
      setTotalUsers(response.pagination?.total || response.length || 0)
    } catch (error) {
      addNotification('Failed to load users', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    })
    setShowEditModal(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    if (!formData.name || !formData.email) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    try {
      setSaving(true)
      await adminService.updateUser(selectedUser._id, formData)
      addNotification('User updated successfully', 'success')
      setShowEditModal(false)
      fetchUsers()
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to update user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    try {
      setSaving(true)
      await adminService.deleteUser(selectedUser._id)
      addNotification('User deleted successfully', 'success')
      setShowDeleteModal(false)
      fetchUsers()
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to delete user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await adminService.deactivateUser(user._id)
        addNotification('User deactivated successfully', 'success')
      } else {
        await adminService.activateUser(user._id)
        addNotification('User activated successfully', 'success')
      }
      fetchUsers()
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to update user status', 'error')
    }
  }

  const handleChangeRole = async (user: User, newRole: string) => {
    try {
      await adminService.changeUserRole(user._id, newRole)
      addNotification('User role updated successfully', 'success')
      fetchUsers()
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Failed to update user role', 'error')
    }
  }

  if (authLoading || protectedLoading) return <Loader />
  if (!isAuthorized) return null

  const totalPages = Math.ceil(totalUsers / pageSize)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage platform users and their roles</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-4 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="flex-1 outline-none text-sm"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
              <option value="user">User</option>
              <option value="job_seeker">Job Seeker</option>
            </select>

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            Total Users: <strong>{totalUsers}</strong> | Page {currentPage} of{' '}
            {totalPages || 1}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {userItem.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{userItem.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleChangeRole(userItem, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            userItem.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : userItem.role === 'recruiter'
                              ? 'bg-blue-100 text-blue-800'
                              : userItem.role === 'user'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          <option value="admin">Admin</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="user">User</option>
                          <option value="job_seeker">Job Seeker</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleActive(userItem)}
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                            userItem.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {userItem.isActive ? (
                            <>
                              <Unlock size={12} /> Active
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            userItem.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {userItem.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(userItem.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewUser(userItem)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditUser(userItem)}
                            className="text-amber-600 hover:text-amber-800"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* View User Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="User Details"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{selectedUser.email}</p>
              </div>
              {selectedUser.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold text-gray-900">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900">
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="font-semibold text-gray-900">
                  {selectedUser.isVerified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
              {selectedUser.lastLogin && (
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedUser.lastLogin)}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
        >
          <div className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter user name"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'admin' | 'recruiter' | 'user' | 'job_seeker' })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="user">User</option>
                <option value="job_seeker">Job Seeker</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete User"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleConfirmDelete}
                disabled={saving}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete User'}
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
