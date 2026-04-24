import React from 'react'
import Link from 'next/link'
import { formatDate } from '@/utils/helpers'

export interface ActivityItem {
  id: string
  type: 'application' | 'interview' | 'message' | 'status_change'
  title: string
  description?: string
  timestamp: string
  icon: string
  link?: string
  action?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
  loading?: boolean
  limit?: number
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false, limit = 5 }) => {
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-100 text-blue-800'
      case 'interview':
        return 'bg-green-100 text-green-800'
      case 'message':
        return 'bg-purple-100 text-purple-800'
      case 'status_change':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">📢 Recent Activity</h2>
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const displayActivities = activities.slice(0, limit)

  if (displayActivities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">📢 Recent Activity</h2>
      </div>
      <div className="divide-y">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 hover:bg-gray-50 transition duration-200 flex items-start space-x-4"
          >
            <div className="text-2xl">{activity.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                  {activity.action || activity.type.replace('_', ' ')}
                </span>
              </div>
              {activity.description && (
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {formatDate(activity.timestamp)}
              </p>
            </div>
            {activity.link && (
              <Link
                href={activity.link}
                className="text-primary hover:text-primary/80 transition text-sm font-medium"
              >
                View →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivity
