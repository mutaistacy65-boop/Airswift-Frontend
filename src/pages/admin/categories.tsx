
import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import { jobCategoryService } from '@/services/jobCategoryService'
import { JobCategory } from '@/types/jobCategories'
import { formatDate } from '@/utils/helpers'

const AdminCategoriesPage: React.FC = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [categories, setCategories] = useState<JobCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null)
  const [saving, setSaving] = useState(false)

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    if (isAuthorized) {
      fetchCategories()
    }
  }, [isAuthorized])

  const fetchCategories = async () => {
    try {
      const data = await jobCategoryService.getAllCategories()
      setCategories(data)
    } catch (error) {
      addNotification('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      isActive: true
    })
  }

  const handleCreateCategory = () => {
    resetCategoryForm()
    setShowCreateModal(true)
  }

  const handleEditCategory = (category: JobCategory) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    })
    setSelectedCategory(category)
    setShowEditModal(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      addNotification('Category name is required', 'error')
      return
    }

    setSaving(true)
    try {
      if (selectedCategory) {
        // Update existing category
        await jobCategoryService.updateCategory(selectedCategory.id, categoryForm)
        addNotification('Category updated successfully!', 'success')
      } else {
        // Create new category
        await jobCategoryService.createCategory(categoryForm)
        addNotification('Category created successfully!', 'success')
      }

      setShowCreateModal(false)
      setShowEditModal(false)
      fetchCategories() // Refresh the list
    } catch (error) {
      addNotification('Failed to save category', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (category: JobCategory) => {
    try {
      await jobCategoryService.updateCategory(category.id, {
        isActive: !category.isActive
      })
      addNotification(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully!`, 'success')
      fetchCategories()
    } catch (error) {
      addNotification('Failed to update category status', 'error')
    }
  }

  const handleDeleteCategory = async (category: JobCategory) => {
    if (!confirm(`Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`)) return

    try {
      await jobCategoryService.deleteCategory(category.id)
      addNotification('Category deleted successfully!', 'success')
      fetchCategories() // Refresh the list
    } catch (error) {
      addNotification('Failed to delete category', 'error')
    }
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

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

  const activeCategories = categories.filter(cat => cat.isActive)
  const inactiveCategories = categories.filter(cat => !cat.isActive)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false)
          setShowEditModal(false)
        }}
        onConfirm={handleSaveCategory}
        confirmText={saving ? 'Saving...' : 'Save Category'}
        title={selectedCategory ? 'Edit Category' : 'Create New Category'}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Software Developer, Housekeeper, Waiter"
            required
          />

          <Textarea
            label="Description (Optional)"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="Brief description of this job category..."
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={categoryForm.isActive}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-gray-700">
              Active (visible to users)
            </label>
          </div>
        </div>
      </Modal>

      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Job Categories</h1>
          <Button onClick={handleCreateCategory} className="bg-green-600 hover:bg-green-700">
            Create Category
          </Button>
        </div>

        {/* Active Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Active Categories ({activeCategories.length})</h2>

          {activeCategories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🏷️</div>
              <p className="text-gray-600">No active categories yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                      )}
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Active
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <p>Jobs: {category.jobCount || 0}</p>
                    <p>Applications: {category.applicationCount || 0}</p>
                    <p>Created: {formatDate(category.createdAt)}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditCategory(category)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleActive(category)}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Categories */}
        {inactiveCategories.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Inactive Categories ({inactiveCategories.length})</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                      )}
                    </div>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      Inactive
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <p>Jobs: {category.jobCount || 0}</p>
                    <p>Applications: {category.applicationCount || 0}</p>
                    <p>Created: {formatDate(category.createdAt)}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditCategory(category)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleActive(category)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Activate
                    </Button>
                    <Button
                      onClick={() => handleDeleteCategory(category)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminCategoriesPage
