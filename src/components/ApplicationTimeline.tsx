import React from 'react'

interface TimelineStep {
  status: string
  timestamp?: string
  notes?: string
}

interface ApplicationTimelineProps {
  timeline?: TimelineStep[]
  currentStatus?: string
}

const statusSteps = ['pending', 'reviewed', 'accepted']

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-400'
    case 'reviewed':
      return 'bg-blue-400'
    case 'accepted':
      return 'bg-green-500'
    case 'rejected':
      return 'bg-red-500'
    default:
      return 'bg-gray-300'
  }
}

const getStepIndex = (status: string) => {
  return statusSteps.indexOf(status.toLowerCase())
}

export default function ApplicationTimeline({ timeline = [], currentStatus = 'pending' }: ApplicationTimelineProps) {
  const currentStepIndex = getStepIndex(currentStatus)

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-4 text-gray-900">Application Status</h3>

      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
          />
        </div>

        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step} className="flex-1 text-center relative">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                  isCompleted ? getStatusColor(step) : 'bg-gray-200 text-gray-500'
                } ${isCurrent ? 'ring-4 ring-blue-200 scale-110' : ''}`}
              >
                {index + 1}
              </div>

              <p className={`text-sm mt-2 capitalize font-medium ${
                isCompleted ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step}
              </p>

              {isCurrent && (
                <p className="text-xs text-blue-600 mt-1 font-medium">Current</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Timeline details */}
      {timeline && timeline.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Timeline</h4>
          {timeline.map((item, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(item.status)}`} />
              <div className="flex-1">
                <p className="font-medium capitalize">{item.status}</p>
                {item.timestamp && (
                  <p className="text-gray-500 text-xs">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                )}
                {item.notes && (
                  <p className="text-gray-600 text-xs mt-1">{item.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}