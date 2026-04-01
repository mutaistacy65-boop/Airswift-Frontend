import React from 'react'
import Link from 'next/link'
import { Job } from '@/services/jobService'
import { formatDate, truncateText } from '@/utils/helpers'

interface JobCardProps {
  job: Job
  showApplyButton?: boolean
}

const JobCard: React.FC<JobCardProps> = ({ job, showApplyButton = false }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">{job.title}</h3>
          <p className="text-blue-600 font-semibold">{job.company}</p>
        </div>
        <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide">{job.type}</span>
      </div>

      <div className="space-y-2 mb-4 text-gray-600">
        <p>📍 {job.location}</p>
        <p>💰 {job.salary}</p>
        <p>📅 Posted {formatDate(job.postedDate)}</p>
      </div>

      <p className="text-gray-700 mb-4">
        {truncateText(job.description, 150)}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.requirements.slice(0, 3).map((req, index) => (
          <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
            {req}
          </span>
        ))}
      </div>

      <Link
        href={`/jobs/${job.id}`}
        className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
      >
        View Details
      </Link>
    </div>
  )
}

export default JobCard