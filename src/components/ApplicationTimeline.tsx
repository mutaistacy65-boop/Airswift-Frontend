import React from 'react'

interface ApplicationTimelineProps {
  status: string
}

const steps = ["Pending", "Reviewed", "Accepted"];

export default function ApplicationTimeline({ status }: ApplicationTimelineProps) {
  const currentStep = steps.indexOf(status);

  return (
    <div className="flex justify-between items-center mt-6">
      {steps.map((step, index) => (
        <div key={step} className="flex-1 text-center relative">

          {/* Line */}
          {index !== steps.length - 1 && (
            <div className={`absolute top-3 left-1/2 w-full h-1
              ${index < currentStep ? "bg-green-500" : "bg-gray-300"}`} />
          )}

          {/* Circle */}
          <div
            className={`w-6 h-6 mx-auto rounded-full z-10 relative
              ${index <= currentStep ? "bg-green-500" : "bg-gray-300"}
              transition-all duration-500`}
          />

          {/* Label */}
          <p
            className={`text-sm mt-2 ${
              index <= currentStep ? "text-green-600 font-semibold" : "text-gray-500"
            }`}
          >
            {step}
          </p>
        </div>
      ))}
    </div>
  );
}