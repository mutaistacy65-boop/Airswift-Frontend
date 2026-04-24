import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import UserDashboardLayout from '@/components/UserDashboardLayout'
import Loader from '@/components/Loader'
import API from '@/services/apiClient'
import toast from 'react-hot-toast'

interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  skills: string
  experience: string
  education: string
  bio: string
  cv_url?: string
  avatar_url?: string
}

export default function SettingsPage() {
  const { user, isLoading, refreshUser } = useAuth()
  const { addNotification } = useNotification()
  const router = useRouter()

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: '',
    experience: '',
    education: '',
    bio: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Guard: Check authentication
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user?.role !== 'user') {
      router.push('/unauthorized')
      return
    }
  }, [user, isLoading, router])

  // Load profile data
  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      try {
        setPageLoading(true)
        const response = await API.get('/profile')
        const profileData = response.data

        setFormData({
          name: profileData.name || user?.name || '',
          email: profileData.email || user?.email || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          skills: profileData.skills || '',
          experience: profileData.experience || '',
          education: profileData.education || '',
          bio: profileData.bio || '',
          cv_url: profileData.cv_url,
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        addNotification('Failed to load profile', 'error')
      } finally {
        setPageLoading(false)
      }
    }

    loadProfile()
  }, [user, addNotification])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      await API.put('/profile', formData)
      addNotification('✅ Profile updated successfully', 'success')
      await refreshUser()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      addNotification(
        error.response?.data?.message || 'Failed to save profile',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addNotification('Passwords do not match', 'error')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      addNotification('Password must be at least 8 characters', 'error')
      return
    }

    try {
      setSaving(true)
      await API.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      addNotification('✅ Password changed successfully', 'success')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      console.error('Error changing password:', error)
      addNotification(
        error.response?.data?.message || 'Failed to change password',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('word')) {
      addNotification('Please upload a PDF or Word document', 'error')
      return
    }

    try {
      setUploadingCV(true)
      const formDataCV = new FormData()
      formDataCV.append('cv', file)

      const response = await API.post('/profile/cv-upload', formDataCV, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setFormData((prev) => ({
        ...prev,
        cv_url: response.data.cv_url,
      }))

      addNotification('✅ CV uploaded successfully', 'success')
    } catch (error: any) {
      console.error('Error uploading CV:', error)
      addNotification(
        error.response?.data?.message || 'Failed to upload CV',
        'error'
      )
    } finally {
      setUploadingCV(false)
    }
  }

  if (isLoading || !user || pageLoading) {
    return <Loader fullScreen />
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile and account settings</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">👤 Personal Information</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows={2}
                placeholder="e.g., JavaScript, React, Node.js"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Your work experience..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Your education details..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        {/* CV Management */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">📄 CV Management</h2>
          </div>

          <div className="space-y-4">
            {formData.cv_url && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ CV Uploaded:{' '}
                  <a
                    href={formData.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    Download
                  </a>
                </p>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCVUpload}
                disabled={uploadingCV}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer inline-block"
              >
                <p className="text-2xl mb-2">📄</p>
                <p className="text-sm font-medium text-gray-900">
                  {uploadingCV ? '⏳ Uploading...' : 'Click to upload CV'}
                </p>
                <p className="text-xs text-gray-600 mt-1">PDF or Word document</p>
              </label>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">🔐 Change Password</h2>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {saving ? '🔄 Updating...' : '🔐 Change Password'}
            </button>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Account Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>User ID:</strong> {user?.id || user?._id}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Role:</strong> {user?.role}
            </p>
            <p>
              <strong>Joined:</strong> {user && new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
