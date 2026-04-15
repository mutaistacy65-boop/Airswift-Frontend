type ApplicationTimelineProps = {
  timeline?: any[];
  currentStatus?: string;
};

const steps = ["pending", "reviewed", "accepted"];

export default function ApplicationTimeline({
  timeline = [],
  currentStatus = "pending",
}: ApplicationTimelineProps) {
  const currentStep = steps.indexOf(currentStatus.toLowerCase());

  return (
    <div className="flex justify-between items-center mt-4">
      {steps.map((step, index) => (
        <div key={step} className="flex-1 text-center relative">

          {index !== steps.length - 1 && (
            <div
              className={`absolute top-3 left-1/2 w-full h-1 ${
                index < currentStep ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          )}

          <div
            className={`w-6 h-6 mx-auto rounded-full ${
              index <= currentStep ? "bg-green-500" : "bg-gray-300"
            }`}
          />

          <p className="text-sm mt-2 capitalize">{step}</p>
        </div>
      ))}
    </div>
  );
}