/**
 * ✅ AdminSettings_FIXED.tsx
 * Fixed version of AdminSettings component with correct HTTP methods
 * 
 * Key fixes:
 * - Uses PUT method for updates (not POST)
 * - Proper error handling
 * - Better form state management
 * - User feedback (success/error messages)
 */

import React, { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Setting {
  _id: string
  key: string
  value: string | number | boolean
  description?: string
  category?: string
  isPublic?: boolean
}

interface SettingInput {
  key: string
  value: string
  description: string
  category: string
  isPublic: boolean
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [saving, setSaving] = useState(false)
  const [newSetting, setNewSetting] = useState<SettingInput>({
    key: '',
    value: '',
    description: '',
    category: 'general',
    isPublic: false
  })

  const categories = ['general', 'security', 'email', 'payment', 'maintenance', 'features']

  // ✅ Fetch settings by category
  useEffect(() => {
    fetchSettings()
  }, [selectedCategory])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📥 Fetching settings for category:', selectedCategory)

      const response = await api.get(`/settings/category/${selectedCategory}`)
      console.log('✅ Settings fetched:', response.data)
      setSettings(response.data || [])
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load settings'
      console.error('❌ Error fetching settings:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Update individual setting - USE PUT METHOD (not POST)
  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true)
      setError(null)
      console.log('💾 Updating setting:', key, '=', value)

      // ✅ IMPORTANT: Use PUT for individual updates (not POST)
      const response = await api.put(`/settings/${key}`, { value })
      
      console.log('✅ Setting updated successfully:', response.data)
      setSuccessMessage(`✅ Setting "${key}" updated successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // Refresh settings
      await fetchSettings()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update setting'
      console.error('❌ Error updating setting:', errorMsg)
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // ✅ Create new setting
  const createSetting = async () => {
    try {
      if (!newSetting.key || !newSetting.value) {
        setError('Please fill in key and value')
        return
      }

      setSaving(true)
      setError(null)
      console.log('📝 Creating new setting:', newSetting)

      const response = await api.post('/settings', newSetting)
      console.log('✅ Setting created:', response.data)

      setSuccessMessage('✅ Setting created successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)

      // Reset form
      setNewSetting({
        key: '',
        value: '',
        description: '',
        category: selectedCategory,
        isPublic: false
      })

      // Refresh settings
      await fetchSettings()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create setting'
      console.error('❌ Error creating setting:', errorMsg)
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  // ✅ Delete setting
  const deleteSetting = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) {
      return
    }

    try {
      setSaving(true)
      setError(null)
      console.log('🗑️  Deleting setting:', key)

      await api.delete(`/settings/${key}`)
      console.log('✅ Setting deleted successfully')

      setSuccessMessage(`✅ Setting "${key}" deleted successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)

      // Refresh settings
      await fetchSettings()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete setting'
      console.error('❌ Error deleting setting:', errorMsg)
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin - Settings Management</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 bg-gray-100 p-2 rounded-lg overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md whitespace-nowrap font-medium capitalize transition ${
                selectedCategory === category
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              disabled={saving}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Setting Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Setting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Key (e.g., site_name)"
            value={newSetting.key}
            onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          />
          <input
            type="text"
            placeholder="Value"
            value={newSetting.value}
            onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          />
          <input
            type="text"
            placeholder="Description"
            value={newSetting.description}
            onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          />
          <select
            value={newSetting.category}
            onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={createSetting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
            disabled={saving || !newSetting.key || !newSetting.value}
          >
            {saving ? 'Adding...' : 'Add Setting'}
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {settings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No settings found for this category. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settings.map((setting) => (
                  <tr key={setting._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {setting.key}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={String(setting.value)}
                        onChange={(e) => {
                          const updatedSettings = settings.map(s =>
                            s._id === setting._id ? { ...s, value: e.target.value } : s
                          )
                          setSettings(updatedSettings)
                        }}
                        onBlur={() => updateSetting(setting.key, setting.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={saving}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {setting.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {setting.isPublic ? '✅ Yes' : '❌ No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteSetting(setting.key)}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 transition"
                        disabled={saving}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSettings
