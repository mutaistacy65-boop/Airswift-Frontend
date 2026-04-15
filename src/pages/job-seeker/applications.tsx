import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useNotification } from "@/context/NotificationContext";

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
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app._id} className="bg-white p-4 rounded shadow">

              <h2 className="font-semibold text-lg">
                {app.jobId?.title}
              </h2>

              <p className="text-gray-500 text-sm">
                Applied on{" "}
                {new Date(app.createdAt).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {/* STATUS */}
              <span
                className={
                  app.status === "accepted"
                    ? "text-green-600 font-semibold"
                    : app.status === "rejected"
                    ? "text-red-600 font-semibold"
                    : "text-yellow-600 font-semibold"
                }
              >
                {app.status}
              </span>

              {/* FILES */}
              <div className="mt-3 bg-gray-50 p-2 rounded flex gap-3">
                <a href={app.cv} target="_blank">📄 CV</a>
                <a href={app.nationalIdFile} target="_blank">🆔 ID</a>
                <a href={app.passport} target="_blank">🛂 Passport</a>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
