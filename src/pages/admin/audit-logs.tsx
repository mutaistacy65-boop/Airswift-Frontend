"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { getSocket } from "@/services/socket";

interface AuditLog {
  _id: string;
  user_id?: { name: string };
  action: string;
  resource: string;
  description: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔒 Guard
  useEffect(() => {
    if (isLoading) return;

    if (!user) router.push("/login");
    if (user?.role !== "admin") router.push("/unauthorized");
  }, [user, isLoading]);

  // 🔄 Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/audit-logs", {
        params: { search, action, startDate, endDate },
      });
      setLogs(res.data.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchLogs();
    }
  }, [user]);

  // ⚡ Live updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("auditLogCreated", (log: AuditLog) => {
      setLogs((prev) => [log, ...prev]);
    });

    return () => {
      socket.off("auditLogCreated");
    };
  }, []);

  // 📤 Export CSV
  const exportCSV = () => {
    const csv = [
      ["User", "Action", "Resource", "Description", "Date"],
      ...logs.map((l) => [
        l.user_id?.name || "Unknown",
        l.action,
        l.resource,
        l.description,
        new Date(l.createdAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_logs.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  if (isLoading || loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Advanced Audit Logs
      </h1>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <input
          placeholder="Search description..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="UPDATE_APPLICATION">UPDATE_APPLICATION</option>
          <option value="CREATE_USER">CREATE_USER</option>
          <option value="DELETE_USER">DELETE_USER</option>
          <option value="UPDATE_PROFILE">UPDATE_PROFILE</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          onClick={fetchLogs}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      {/* 📤 Export */}
      <button
        onClick={exportCSV}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Export CSV
      </button>

      {/* 📊 Table */}
      <div className="bg-white shadow rounded overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Resource</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {log.user_id?.name || "Unknown User"}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3 text-gray-600">
                    {log.resource}
                  </td>

                  <td className="p-3 text-gray-700">
                    {log.description}
                  </td>

                  <td className="p-3 text-gray-500 text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}