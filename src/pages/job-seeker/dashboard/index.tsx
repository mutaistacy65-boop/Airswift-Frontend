"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSocket } from "@/services/socket";
import { useAuth } from "@/context/AuthContext";

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [application, setApplication] = useState({
    status: "pending",
    interviewDate: null,
  });

  // 🔒 Guard
  useEffect(() => {
    if (isLoading) return;

    if (!user) router.push("/login");
    if (user?.role !== "user") router.push("/unauthorized");
  }, [user, isLoading]);

  // 🔥 Real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("applicationUpdated", (data) => {
      console.log("REAL-TIME:", data);

      setApplication({
        status: data.status,
        interviewDate: data.interviewDate,
      });
    });

    return () => {
      socket.off("applicationUpdated");
    };
  }, []);

  if (isLoading) return <p>Loading...</p>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600";
      case "shortlisted": return "text-blue-600";
      case "rejected": return "text-red-600";
      case "accepted": return "text-green-600";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold">
        Welcome, {user?.name}
      </h1>

      {/* STATUS CARD */}
      <div className="mt-6 bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold">Application Status</h2>

        <p className={`mt-2 font-bold ${getStatusColor(application.status)}`}>
          {application.status.toUpperCase()}
        </p>
      </div>

      {/* INTERVIEW CARD */}
      <div className="mt-4 bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold">Interview</h2>

        {application.interviewDate ? (
          <p className="text-green-600">
            Scheduled on{" "}
            {new Date(application.interviewDate).toLocaleString()}
          </p>
        ) : (
          <p className="text-gray-500">Not scheduled yet</p>
        )}
      </div>

      {/* TIMELINE */}
      <div className="mt-6 bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-3">Progress</h2>

        <div className="flex justify-between text-sm">
          <span>Applied</span>
          <span>Reviewed</span>
          <span>Shortlisted</span>
          <span>Interview</span>
          <span>Final</span>
        </div>
      </div>

    </div>
  );
}
