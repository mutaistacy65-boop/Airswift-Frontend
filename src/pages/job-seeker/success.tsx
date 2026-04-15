import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ApplicationTimeline from "@/components/ApplicationTimeline";

export default function SuccessPage() {
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("latestApplication");
    if (data) {
      setApplication(JSON.parse(data));
    }
  }, []);

  // Auto redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/job-seeker/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">

        <h1 className="text-2xl font-bold text-green-600 mb-3">
          🎉 Application Submitted!
        </h1>

        <p className="text-gray-600 mb-4">
          Your application was successfully sent.
        </p>

        {/* Submission Date */}
        <div className="text-sm text-gray-500 mb-6">
          Submitted on:{" "}
          <strong>
            {new Date(application.createdAt).toLocaleString()}
          </strong>
        </div>

        {/* Timeline */}
        <ApplicationTimeline status={application.status || "Pending"} />

        {/* Button */}
        <button
          onClick={() => router.push("/job-seeker/dashboard")}
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}