import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);

  // Protect admin route
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role !== "admin") {
      window.location.href = "/";
      return;
    }

    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "https://airswift-backend-fjt3.onrender.com/api/admin/applications",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setApplications(data);
  };

  const updateStatus = async (id, action) => {
    const token = localStorage.getItem("token");

    await fetch(
      `https://airswift-backend-fjt3.onrender.com/api/admin/applications/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      }
    );

    fetchApplications(); // refresh
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-4">
        {applications.map((app) => (
          <div key={app._id} className="border p-4 rounded shadow">
            <p><strong>User:</strong> {app.user?.name}</p>
            <p><strong>Email:</strong> {app.user?.email}</p>
            <p><strong>Job:</strong> {app.jobId?.title}</p>
            <p><strong>Status:</strong>
              <span className={
                app.status === "accepted"
                  ? "text-green-600"
                  : app.status === "rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
              }>
                {app.status}
              </span>
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => updateStatus(app._id, "approve")}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus(app._id, "reject")}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap gap-4 items-center text-sm">
                {/* CV */}
                <a
                  href={app.documents?.cv}
                  target="_blank"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  📄 <span>CV</span>
                </a>

                {/* National ID */}
                <a
                  href={app.documents?.nationalId}
                  target="_blank"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  🆔 <span>ID</span>
                </a>

                {/* Passport */}
                <a
                  href={app.documents?.passport}
                  target="_blank"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  🛂 <span>Passport</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}