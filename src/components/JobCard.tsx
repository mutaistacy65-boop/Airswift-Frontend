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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-primary font-semibold">{job.company}</p>
        </div>
        <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">{job.type}</span>
      </div>

      <div className="space-y-2 mb-4 text-gray-600 text-sm">
        <p>📍 {job.location}</p>
        <p>💰 {job.salary}</p>
        <p>📅 Posted {formatDate(job.postedDate)}</p>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">
        {truncateText(job.description, 150)}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.requirements.slice(0, 3).map((req, index) => (
          <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
            {req}
          </span>
        ))}
      </div>

      <Link
        href={`/jobs/${job.id}`}
        className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium text-sm"
      >
        View Details
      </Link>
    </div>
  )
}

export default JobCard