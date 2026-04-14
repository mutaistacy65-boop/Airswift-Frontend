import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import { profileService } from '@/services/profileService'

interface UserProfile {
  name: string
  email: string
  phone: string
  bio: string
  skills: string[]
  experience: string
  education: string
  location: string
}

const ProfilePage = () => {
  const { isAuthorized, isLoading } = useProtectedRoute('user')
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)

  useEffect(() => {
    if (isAuthorized && user) {
      // Load user profile data
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        skills: user.skills || [],
        experience: user.experience || '',
        education: user.education || '',
        location: user.location || ''
      })
      setLoading(false)
    }
  }, [isAuthorized, user])

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    console.log('CV selected:', file)
    setCvFile(file)
    setError(null)
  }

  const handleSave = async () => {
    console.log('CV FILE BEFORE SUBMIT:', cvFile)
    setError(null)

    if (!cvFile) {
      setError('CV file is required')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', profile.name)
      formData.append('phone', profile.phone)
      formData.append('location', profile.location)
      formData.append('cv', cvFile)

      const data = await profileService.setupProfile(formData)

      if (data?.profile) {
        setProfile(prev => ({
          ...prev,
          name: data.profile.name || prev.name,
          skills: data.profile.skills || prev.skills,
          education: data.profile.education || prev.education,
          experience: data.profile.experience || prev.experience,
        }))
      }
    } catch (error) {
      console.error('Profile setup error:', error)
      addNotification('Failed to setup profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return <Loader fullScreen />
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/job-seeker/dashboard', icon: '📊' },
    { label: 'My Applications', href: '/job-seeker/applications', icon: '📋' },
    { label: 'Interviews', href: '/job-seeker/interviews', icon: '📞' },
    { label: 'Profile', href: '/job-seeker/profile', icon: '👤' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div>
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
              <Input
                label="Location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CV</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {cvFile && (
                  <p className="text-sm text-gray-600 mt-2">Selected file: {cvFile.name}</p>
                )}
                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">Upload your CV to automatically populate skills, experience, and education from the profile setup endpoint.</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Professional Information</h2>

            <div className="mb-6">
              <Textarea
                label="Professional Bio"
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself, your career goals, and what you're looking for..."
              />
            </div>

            <div className="mb-6">
              <Textarea
                label="Work Experience"
                value={profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                rows={4}
                placeholder="Describe your work experience, previous roles, and achievements..."
              />
            </div>

            <div className="mb-6">
              <Textarea
                label="Education"
                value={profile.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                rows={3}
                placeholder="List your educational background, degrees, certifications..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Skills</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill} type="button">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-white hover:text-red-200"
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {profile.skills.length === 0 && (
                <p className="text-gray-500 text-sm mt-2">No skills added yet. Add skills to improve your job matches.</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
            >
              {saving ? 'Saving...' : cvFile ? 'Upload CV & Setup Profile' : 'Select CV to Setup Profile'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
