'use client'
import React, { useEffect, useState } from 'react'
import { useNotification } from '@/context/NotificationContext'
import { adminService } from '@/services/adminService'

interface AppSettings {
  platformName: string
  maxJobsPerDay: number
  maxApplicationsPerDay: number
  emailNotificationsEnabled: boolean
  maintenanceMode: boolean
  paymentProviderKey: string
  defaultCurrency: string
  companyContactEmail: string
  companyPhoneNumber: string
  termsAndConditionsUrl: string
  privacyPolicyUrl: string
}

const defaultSettings: AppSettings = {
  platformName: 'Airswift',
  maxJobsPerDay: 50,
  maxApplicationsPerDay: 100,
  emailNotificationsEnabled: true,
  maintenanceMode: false,
  paymentProviderKey: '',
  defaultCurrency: 'USD',
  companyContactEmail: 'support@airswift.com',
  companyPhoneNumber: '+1-800-AIRSWIFT',
  termsAndConditionsUrl: '/terms',
  privacyPolicyUrl: '/privacy',
}

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await adminService.getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Use default settings if API fails
      setSettings(defaultSettings)
    }
  }

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await adminService.updateSettings(settings)
      setHasChanges(false)
      addNotification('Settings saved successfully!', 'success')
    } catch (error) {
      console.error('Failed to save settings:', error)
      addNotification('Failed to save settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings(defaultSettings)
    setHasChanges(false)
    addNotification('Settings reset to defaults', 'info')
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Application Settings</h2>
      </div>

      <div className="p-6 space-y-8">
        {/* Platform Settings */}
        <section className="border-b border-gray-100 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
          </div>
        </section>

        {/* Limits */}
        <section className="border-b border-gray-100 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Jobs Per Day
              </label>
              <input
                type="number"
                min="1"
                value={settings.maxJobsPerDay}
                onChange={(e) => handleChange('maxJobsPerDay', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Applications Per Day
              </label>
              <input
                type="number"
                min="1"
                value={settings.maxApplicationsPerDay}
                onChange={(e) => handleChange('maxApplicationsPerDay', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="border-b border-gray-100 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Email
              </label>
              <input
                type="email"
                value={settings.companyContactEmail}
                onChange={(e) => handleChange('companyContactEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Phone Number
              </label>
              <input
                type="tel"
                value={settings.companyPhoneNumber}
                onChange={(e) => handleChange('companyPhoneNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Legal URLs */}
        <section className="border-b border-gray-100 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms & Conditions URL
              </label>
              <input
                type="url"
                value={settings.termsAndConditionsUrl}
                onChange={(e) => handleChange('termsAndConditionsUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Policy URL
              </label>
              <input
                type="url"
                value={settings.privacyPolicyUrl}
                onChange={(e) => handleChange('privacyPolicyUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Payment Settings */}
        <section className="border-b border-gray-100 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Provider API Key
              </label>
              <input
                type="password"
                value={settings.paymentProviderKey}
                onChange={(e) => handleChange('paymentProviderKey', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">For M-Pesa or other payment providers</p>
            </div>
          </div>
        </section>

        {/* Feature Toggles */}
        <section className="border-b border-gray-100 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Email Notifications
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable/disable email notifications for users
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotificationsEnabled}
                onChange={(e) => handleChange('emailNotificationsEnabled', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Maintenance Mode
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Disable platform for all users except admins
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
        <button
          onClick={handleResetSettings}
          disabled={!hasChanges || isSaving}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Reset
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={!hasChanges || isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
