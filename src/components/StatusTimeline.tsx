import React from 'react';

interface StatusTimelineProps {
  status: string;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({ status }) => {
  const steps = ["Pending", "Reviewed", "Accepted"];

  return (
    <div className="flex items-center gap-4">
      {steps.map((step, index) => {
        const isActive = steps.indexOf(status) >= index;

        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${
              isActive ? "bg-green-500" : "bg-gray-300"
            }`} />
            <span className={`text-sm ${
              isActive ? "text-green-600" : "text-gray-400"
            }`}>
              {step}
            </span>

            {index < steps.length - 1 && (
              <div className="w-8 h-1 bg-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;