import React from 'react'
import { JobApplication } from '@/services/jobService'
import { formatDate } from '@/utils/helpers'

interface ApplicationCardProps {
  application: JobApplication & { jobTitle?: string }
  onCancel?: (id: string) => void
  showActions?: boolean
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onCancel, showActions = false }) => {
  const statusColors = {
    Submitted: 'bg-yellow-100 text-yellow-800',
    'Under Review': 'bg-blue-100 text-blue-800',
    Shortlisted: 'bg-green-100 text-green-800',
    'Interview Scheduled': 'bg-purple-100 text-purple-800',
    Hired: 'bg-emerald-100 text-emerald-800',
    Rejected: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{application.jobTitle}</h3>
          <p className="text-gray-600">Applied on {formatDate(application.appliedDate)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm capitalized ${statusColors[application.status]}`}>
          {application.status}
        </span>
      </div>

      {application.coverLetter && (
        <div className="mb-4">
          <p className="text-gray-600">{application.coverLetter}</p>
        </div>
      )}

      <div className="flex gap-4">
        <a
          href={application.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          View Resume
        </a>
        {showActions && application.status === 'pending' && onCancel && (
          <button
            onClick={() => onCancel(application.id)}
            className="text-red-500 hover:text-red-700"
          >
            Withdraw Application
          </button>
        )}
      </div>
    </div>
  )
}

export default ApplicationCard