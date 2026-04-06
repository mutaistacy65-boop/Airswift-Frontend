import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const lineData = [
  { name: "Mon", applications: 20 },
  { name: "Tue", applications: 35 },
  { name: "Wed", applications: 28 },
  { name: "Thu", applications: 45 },
  { name: "Fri", applications: 60 },
  { name: "Sat", applications: 40 },
  { name: "Sun", applications: 70 }
];

const barData = [
  { name: "Marketing", jobs: 10 },
  { name: "IT", jobs: 18 },
  { name: "Finance", jobs: 8 },
  { name: "HR", jobs: 6 }
];

const initialJobs = [
  { id: 1, title: "Marketing Specialist", location: "Toronto, ON", status: "Active", applicants: 32 },
  { id: 2, title: "Software Developer", location: "Vancouver, BC", status: "Active", applicants: 50 },
  { id: 3, title: "Financial Analyst", location: "Ottawa, ON", status: "Paused", applicants: 21 }
];

const mockCVs = [
  { id: 1, name: "Jane Smith", skills: ["React", "Node", "AWS"], score: 86 },
  { id: 2, name: "Mark Johnson", skills: ["Java", "Spring", "SQL"], score: 78 },
  { id: 3, name: "Emily Nguyen", skills: ["Python", "ML", "TensorFlow"], score: 91 }
];

export default function AdminDashboard() {
  const [jobs, setJobs] = useState(initialJobs);
  const [form, setForm] = useState({ title: "", location: "" });

  const addJob = () => {
    if (!form.title || !form.location) return;
    setJobs([
      ...jobs,
      {
        id: Date.now(),
        title: form.title,
        location: form.location,
        status: "Active",
        applicants: 0
      }
    ]);
    setForm({ title: "", location: "" });
  };

  const deleteJob = (id) => setJobs(jobs.filter((job) => job.id !== id));

  const toggleStatus = (id) => {
    setJobs(jobs.map((job) => (job.id === id ? { ...job, status: job.status === "Active" ? "Paused" : "Active" } : job)));
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-2xl">🍁</span>
          <h1 className="text-xl font-bold text-blue-900">TALEX ADMIN</h1>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <a className="text-red-500 font-semibold">Dashboard</a>
          <a>Manage Jobs</a>
          <a>Applicants</a>
          <a>Messages</a>
          <a>Settings</a>
          <button className="bg-red-500 text-white px-4 py-1 rounded">Logout</button>
        </nav>
      </header>

      {/* Hero */}
      <div className="bg-blue-900 text-white px-8 py-6">
        <h2 className="text-xl font-semibold">Welcome, Admin!</h2>
        <p className="text-sm opacity-80">Monitor and manage recruitment activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8 py-6">
        {[
          { label: "Active Jobs", value: jobs.length },
          { label: "Applications", value: jobs.reduce((sum, job) => sum + job.applicants, 0) },
          { label: "Interviews", value: 48 },
          { label: "Messages", value: 9 }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">{stat.label}</p>
            <h4 className="text-2xl font-bold text-blue-900">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">Applications Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">Jobs by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jobs" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 py-6">
        {/* CRUD JOB MANAGEMENT */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Job Management (CRUD)</h2>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              placeholder="Job Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <button onClick={addJob} className="bg-blue-900 text-white px-4 rounded">
              Add
            </button>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b py-3 gap-3">
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                  <p className="text-xs text-gray-500">Applicants: {job.applicants}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(job.id)}
                    className="text-xs px-2 py-1 rounded bg-yellow-100"
                  >
                    {job.status}
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI CV SCORING PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">AI CV Scoring Panel</h2>

          <div className="space-y-4">
            {mockCVs.map((cv) => (
              <div key={cv.id} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{cv.name}</p>
                  <span className="text-sm font-bold text-blue-900">Score: {cv.score}</span>
                </div>
                <p className="text-xs text-gray-500">Skills: {cv.skills.join(", ")}</p>
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded" style={{ width: `${cv.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 bg-blue-900 text-white px-4 py-2 rounded">
            Run AI Bulk Analysis
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white text-center py-4">
        © 2026 Talex Admin System
      </footer>
    </div>
  );
}
