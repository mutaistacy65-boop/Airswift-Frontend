import React, { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import { Calendar, Clock, MapPin, User, Mail, Phone } from 'lucide-react'

interface InterviewEvent {
  _id: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  jobTitle: string
  interviewDate: string
  interviewTime: string
  interviewType: 'video' | 'phone' | 'in-person'
  interviewerName: string
  interviewerEmail: string
  zoomLink?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

interface InterviewCalendarProps {
  onRefresh?: () => void
}

const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ onRefresh }) => {
  const { addNotification } = useNotification()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [interviews, setInterviews] = useState<InterviewEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewEvent | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    jobTitle: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'video' as 'video' | 'phone' | 'in-person',
    interviewerName: '',
    interviewerEmail: '',
    zoomLink: '',
    notes: '',
  })

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const data = await adminService.getInterviews()
      setInterviews(Array.isArray(data) ? data : data.interviews || [])
    } catch (error) {
      addNotification('Failed to load interviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleInterview = async () => {
    if (!formData.candidateName || !formData.interviewDate || !formData.interviewTime) {
      addNotification('Please fill in all required fields', 'error')
      return
    }

    try {
      setSaving(true)
      await adminService.scheduleInterview('', formData)
      addNotification('Interview scheduled successfully', 'success')
      setFormData({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        jobTitle: '',
        interviewDate: '',
        interviewTime: '',
        interviewType: 'video',
        interviewerName: '',
        interviewerEmail: '',
        zoomLink: '',
        notes: '',
      })
      setShowScheduleModal(false)
      fetchInterviews()
      onRefresh?.()
    } catch (error: any) {
      addNotification(error?.message || 'Failed to schedule interview', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter(
      interview =>
        new Date(interview.interviewDate).toDateString() === date.toDateString() &&
        interview.status === 'scheduled'
    )
  }

  const getCalendarDays = () => {
    const today = new Date()
    const days = []

    // Get days in current month
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i)
      const dayInterviews = getInterviewsForDate(date)
      days.push({
        date,
        interviewCount: dayInterviews.length,
        isToday: date.toDateString() === today.toDateString(),
      })
    }

    return days
  }

  const getDayName = (date: Date) => {
    return date.toLocaleString('default', { weekday: 'short' })
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const dayInterviews = getInterviewsForDate(selectedDate)

  if (loading) {
    return <Loader />
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Calendar</h3>
            <Button
              onClick={() => {
                setFormData({
                  candidateName: '',
                  candidateEmail: '',
                  candidatePhone: '',
                  jobTitle: '',
                  interviewDate: selectedDate.toISOString().split('T')[0],
                  interviewTime: '',
                  interviewType: 'video',
                  interviewerName: '',
                  interviewerEmail: '',
                  zoomLink: '',
                  notes: '',
                })
                setShowScheduleModal(true)
              }}
              className="text-sm bg-blue-600 hover:bg-blue-700"
            >
              Schedule
            </Button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h4 className="font-semibold text-gray-900">{getMonthName(selectedDate)}</h4>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(({ date, interviewCount, isToday }, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded text-sm aspect-square flex flex-col items-center justify-center transition ${
                  selectedDate.toDateString() === date.toDateString()
                    ? 'bg-blue-600 text-white font-bold'
                    : isToday
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{date.getDate()}</span>
                {interviewCount > 0 && <span className="text-xs mt-0.5">●{interviewCount}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Interviews for Selected Date */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Interviews - {selectedDate.toDateString()}
          </h3>

          {dayInterviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No interviews scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayInterviews.map(interview => (
                <div
                  key={interview._id}
                  onClick={() => {
                    setSelectedInterview(interview)
                    setShowDetailModal(true)
                  }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{interview.candidateName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{interview.jobTitle}</p>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} />
                          {interview.interviewTime}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {interview.interviewType === 'video' ? (
                            <>
                              <div className="w-4 h-4">📹</div>
                              {interview.zoomLink && (
                                <a
                                  href={interview.zoomLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-blue-600 hover:underline"
                                >
                                  Join Zoom
                                </a>
                              )}
                            </>
                          ) : interview.interviewType === 'phone' ? (
                            <>
                              <Phone size={16} />
                              <span>Phone Interview</span>
                            </>
                          ) : (
                            <>
                              <MapPin size={16} />
                              <span>In-Person</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {interview.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Interview</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Candidate Name"
                value={formData.candidateName}
                onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                placeholder="Full name"
                required
              />
              <Input
                label="Candidate Email"
                type="email"
                value={formData.candidateEmail}
                onChange={e => setFormData({ ...formData, candidateEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Candidate Phone"
                value={formData.candidatePhone}
                onChange={e => setFormData({ ...formData, candidatePhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
              <Input
                label="Job Title"
                value={formData.jobTitle}
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Position"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Interview Date"
                type="date"
                value={formData.interviewDate}
                onChange={e => setFormData({ ...formData, interviewDate: e.target.value })}
                required
              />
              <Input
                label="Interview Time"
                type="time"
                value={formData.interviewTime}
                onChange={e => setFormData({ ...formData, interviewTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
              <select
                value={formData.interviewType}
                onChange={e => setFormData({ ...formData, interviewType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>

            {formData.interviewType === 'video' && (
              <Input
                label="Zoom Link"
                value={formData.zoomLink}
                onChange={e => setFormData({ ...formData, zoomLink: e.target.value })}
                placeholder="https://zoom.us/j/..."
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Interviewer Name"
                value={formData.interviewerName}
                onChange={e => setFormData({ ...formData, interviewerName: e.target.value })}
                placeholder="Your name"
              />
              <Input
                label="Interviewer Email"
                type="email"
                value={formData.interviewerEmail}
                onChange={e => setFormData({ ...formData, interviewerEmail: e.target.value })}
                placeholder="your@company.com"
              />
            </div>

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
            />

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Interview Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
        {selectedInterview && (
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedInterview.candidateName}</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-500" />
                <span>{selectedInterview.jobTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                <a href={`mailto:${selectedInterview.candidateEmail}`} className="text-blue-600 hover:underline">
                  {selectedInterview.candidateEmail}
                </a>
              </div>
              {selectedInterview.candidatePhone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <a href={`tel:${selectedInterview.candidatePhone}`} className="text-blue-600 hover:underline">
                    {selectedInterview.candidatePhone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span>{new Date(selectedInterview.interviewDate).toDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span>{selectedInterview.interviewTime}</span>
              </div>
              {selectedInterview.zoomLink && (
                <>
                  <a
                    href={selectedInterview.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
                  >
                    Join Meeting
                  </a>
                </>
              )}
              {selectedInterview.notes && (
                <div className="bg-gray-50 p-3 rounded mt-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Notes:</p>
                  <p className="text-gray-700">{selectedInterview.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InterviewCalendar
