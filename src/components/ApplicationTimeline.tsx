import React from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { ApplicationStatus, getStatusColor } from '@/utils/statusColors'

type ApplicationTimelineProps = {
  timeline?: any[];
  currentStatus: ApplicationStatus | string;
};

const TIMELINE_STEPS = [
  { label: '✔ Application Submitted', key: 'pending' },
  { label: '✔ Under Review', key: 'reviewed' },
  { label: '✔ Shortlisted', key: 'shortlisted' },
  { label: '⏳ Interview Scheduled', key: 'interview_scheduled' },
  { label: 'Offer Made', key: 'offer_made' }
];

export default function ApplicationTimeline({
  timeline = [],
  currentStatus = "pending",
}: ApplicationTimelineProps) {
  const statusKey = (currentStatus as string).toLowerCase().replace(' ', '_');
  const statusToStepIndex: Record<string, number> = {
    pending: 0,
    reviewed: 1,
    shortlisted: 2,
    interview_scheduled: 3,
    interview_completed: 3,
    rejected: -1,
    offer_made: 4,
    visa_ready: 4
  };

  const currentStep = statusToStepIndex[statusKey] ?? 0;
  const isRejected = statusKey === 'rejected';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h3>

      {isRejected && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Application Status: Rejected</p>
          <p className="text-red-700 text-sm mt-1">
            We appreciate your interest. You can apply again for other positions.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted || (isCurrent && !isRejected)
                      ? 'bg-green-100'
                      : 'bg-gray-200'
                  } flex-shrink-0`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock
                      className={`w-5 h-5 ${
                        isCurrent ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${
                      isCompleted ? 'bg-green-200' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Timeline content */}
              <div className="pb-4">
                <p
                  className={`font-medium ${
                    isCompleted || isCurrent
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && !isRejected && (
                  <p className="text-sm text-blue-600 font-medium">Current</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}