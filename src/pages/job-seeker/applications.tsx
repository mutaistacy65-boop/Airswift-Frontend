import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useNotification } from "@/context/NotificationContext";
import ApplicationTimeline from "@/components/ApplicationTimeline";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const { subscribe, isConnected } = useSocket();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchApps = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://airswift-backend-fjt3.onrender.com/api/applications/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setApps(data);
    };

    fetchApps();
  }, []);

  // Listen for real-time application status updates
  useEffect(() => {
    // Listen for status updates from admin actions
    const unsubscribeStatusUpdate = subscribe("statusUpdate", (data: any) => {
      setApps((prev) =>
        prev.map((app) =>
          app._id === data.applicationId || app._id === data.id
            ? { ...app, status: data.status }
            : app
        )
      );
      
      // Show notification based on status
      if (data.status === "accepted") {
        addNotification("🎉 Congratulations! Your application was accepted!", "success");
      } else if (data.status === "rejected") {
        addNotification("Your application has been reviewed.", "info");
      } else if (data.status === "shortlisted" || data.status === "Shortlisted") {
        addNotification("✨ Great news! You've been shortlisted!", "success");
      } else if (data.status === "interview-scheduled" || data.status === "Interview Scheduled") {
        addNotification("📅 Your interview has been scheduled!", "success");
      }
    });

    // Listen for general application updates
    const unsubscribeAppUpdate = subscribe("application_updated", (data: any) => {
      if (data.applicationId) {
        setApps((prev) =>
          prev.map((app) =>
            app._id === data.applicationId ? { ...app, ...data.updates } : app
          )
        );
        addNotification("📝 Your application status has been updated", "info");
      }
    });

    // Listen for interview scheduling
    const unsubscribeInterview = subscribe("interviewScheduled", (data: any) => {
      if (data.applicationId) {
        setApps((prev) =>
          prev.map((app) =>
            app._id === data.applicationId
              ? { ...app, status: "Interview Scheduled", interviewId: data.interviewId }
              : app
          )
        );
        addNotification("📅 Interview has been scheduled! Check your email for details.", "success");
      }
    });

    return () => {
      unsubscribeStatusUpdate?.();
      unsubscribeAppUpdate?.();
      unsubscribeInterview?.();
    };
  }, [subscribe, addNotification]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        {isConnected && (
          <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            ✓ Live Updates Active
          </span>
        )}
      </div>

      {apps.length === 0 ? (
        <p>No applications submitted yet.</p>
      ) : (
        <div className="space-y-6">
          {apps.map((app) => (
            <div key={app._id} className="bg-white p-6 rounded-lg shadow-md">

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-semibold text-lg text-gray-900">
                    {app.jobId?.title || 'Job Application'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Applied on{" "}
                    {new Date(app.createdAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* STATUS BADGE */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    app.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : app.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : app.status === "shortlisted"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {app.status || 'pending'}
                </span>
              </div>

              {/* APPLICATION TIMELINE */}
              <div className="mb-4">
                <ApplicationTimeline
                  timeline={app.timeline || []}
                  currentStatus={app.status || 'pending'}
                />
              </div>

              {/* FILES */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted Documents</h4>
                <div className="flex gap-4">
                  {app.cv && (
                    <a
                      href={app.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      📄 CV
                    </a>
                  )}
                  {app.nationalIdFile && (
                    <a
                      href={app.nationalIdFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      🆔 National ID
                    </a>
                  )}
                  {app.passport && (
                    <a
                      href={app.passport}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      🛂 Passport
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
