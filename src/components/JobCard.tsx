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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
          {job.type}
        </span>
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