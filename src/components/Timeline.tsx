import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'

interface TimelineStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending' | 'failed'
  date?: string
  action?: React.ReactNode
}

interface TimelineProps {
  steps: TimelineStep[]
}

const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'current':
        return <Clock className="text-blue-500" size={20} />
      case 'failed':
        return <XCircle className="text-red-500" size={20} />
      default:
        return <AlertCircle className="text-gray-400" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50'
      case 'current':
        return 'border-blue-500 bg-blue-50'
      case 'failed':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start"
          >
            {/* Timeline dot */}
            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(step.status)}`}>
              {getStatusIcon(step.status)}
            </div>

            {/* Content */}
            <div className="ml-6 flex-1">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${step.status === 'completed' ? 'text-green-700' : step.status === 'current' ? 'text-blue-700' : 'text-gray-700'}`}>
                    {step.title}
                  </h3>
                  {step.date && (
                    <span className="text-sm text-gray-500">{step.date}</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                {step.action && (
                  <div className="mt-3">
                    {step.action}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Timeline