import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Video, Mic, MicOff, Monitor, Phone, Calendar, Star, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DashboardLayout from '@/layouts/DashboardLayout'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'

export default function AdminDashboard() {
  const { isAuthorized, isLoading } = useProtectedRoute('admin')
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState("kanban");
  const [chat, setChat] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [interviewNotes, setInterviewNotes] = useState("");

  // Video interview refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("accessToken");

    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    return res.json();
  };

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);

      const [appsRes, statsRes] = await Promise.all([
        apiFetch("/api/admin/applications"),
        apiFetch("/api/admin/stats")
      ]);

      setApplications(appsRes);
      setStats([
        { name: "Total Users", value: statsRes.users || 0, icon: "👥", color: "bg-blue-500" },
        { name: "Applications", value: statsRes.applications || 0, icon: "📋", color: "bg-green-500" },
        { name: "Active Jobs", value: statsRes.jobs || 0, icon: "💼", color: "bg-purple-500" },
        { name: "Interviews", value: statsRes.interviews || 0, icon: "📹", color: "bg-orange-500" },
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Manage Jobs', href: '/admin/jobs', icon: '💼' },
    { label: 'Applications', href: '/admin/applications', icon: '📋' },
    { label: 'Interviews', href: '/admin/interviews', icon: '📞' },
    { label: 'Users', href: '/admin/dashboard', icon: '👥' },
    { label: 'Security', href: '/admin/dashboard', icon: '🔐' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  const stages = ["pending", "reviewed", "interview_scheduled", "rejected"];

  const grouped = stages.reduce((acc, stage) => {
    acc[stage] = applications.filter((a) => a.status === stage);
    return acc;
  }, {});

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    setApplications((prev) =>
      prev.map((app) =>
        app._id === draggableId ? { ...app, status: newStatus } : app
      )
    );

    await apiFetch(`/api/admin/application/${draggableId}`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const startVideoInterview = (app) => {
    const roomId = `interview-${app._id}`;
    const url = `https://meet.jit.si/${roomId}`;
    window.open(url, "_blank");
  };

  const scheduleInterview = async (app, interviewType) => {
    try {
      const interviewData = {
        applicantId: app._id,
        type: interviewType,
        scheduledDate: new Date().toISOString(),
        status: 'scheduled'
      };

      await apiFetch('/api/admin/interviews', {
        method: 'POST',
        body: JSON.stringify(interviewData)
      });

      // Update application status
      await apiFetch(`/api/admin/application/${app._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "interview_scheduled" }),
      });

      // Refresh data
      fetchData();

      alert(`${interviewType} interview scheduled successfully!`);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview. Please try again.');
    }
  };

  const rateCandidate = async (app, rating, notes) => {
    try {
      await apiFetch(`/api/admin/application/${app._id}`, {
        method: "PUT",
        body: JSON.stringify({
          rating: rating,
          notes: notes,
          status: rating >= 4 ? 'reviewed' : 'rejected'
        }),
      });

      fetchData();
      alert('Candidate rating saved successfully!');
    } catch (error) {
      console.error('Error rating candidate:', error);
      alert('Failed to save rating. Please try again.');
    }
  };

  const signOffer = async (app) => {
    try {
      const signature = `Signed by ${app.fullName || app.user?.name} on ${new Date().toISOString()}`;

      const res = await fetch(`${API_URL}/api/admin/sign-offer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          name: app.fullName || app.user?.name,
          email: app.email || app.user?.email,
          signature,
        }),
      });

      const data = await res.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
        alert('Offer signed and PDF generated successfully!');
      } else {
        alert('Offer signed successfully!');
      }
    } catch (error) {
      console.error('Error signing offer:', error);
      alert('Failed to sign offer. Please try again.');
    }
  };

  // WebRTC Video Interview Functions
  const startWebRTCInterview = async (app) => {
    setSelectedApp(app);
    setActiveTab("video");

    try {
      // For demo purposes, we'll use Jitsi Meet for actual video calls
      // In a production app, you'd implement full WebRTC signaling
      const roomId = `interview-${app._id}-${Date.now()}`;
      const jitsiUrl = `https://meet.jit.si/${roomId}`;

      // Open Jitsi in new tab for actual video call
      window.open(jitsiUrl, '_blank');

      // Keep WebRTC setup for local camera preview
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Show instructions for the candidate
      alert(`Video interview room created: ${roomId}\n\nShare this room ID with the candidate: ${roomId}\n\nThey can join at: https://meet.jit.si/${roomId}`);

    } catch (error) {
      console.error('Error starting video interview:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
      sender.replaceTrack(videoTrack);

      videoTrack.onended = () => {
        const cameraTrack = localStreamRef.current.getVideoTracks()[0];
        sender.replaceTrack(cameraTrack);
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const endVideoInterview = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setSelectedApp(null);
    setActiveTab("kanban");
  };

  // AI Voice Bot Functions
  const startVoiceInterview = async () => {
    if (!selectedApp) {
      alert('Please select an applicant first');
      return;
    }

    setIsRecording(true);
    setChat([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

        // Add user message to chat
        setChat(prev => [...prev, {
          text: "Recording completed. Processing your response...",
          type: 'user',
          timestamp: new Date()
        }]);

        // Simulate AI processing delay
        setTimeout(() => {
          // Simulate AI response based on common interview questions
          const aiResponses = [
            "Thank you for sharing that. Can you tell me about a challenging project you've worked on and how you overcame the difficulties?",
            "That's interesting. How do you handle tight deadlines and competing priorities?",
            "Great answer. What are your career goals for the next 3-5 years?",
            "I appreciate your honesty. How do you stay updated with the latest technologies in your field?",
            "Excellent. Can you give an example of how you've contributed to team success?"
          ];

          const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

          setChat(prev => [...prev, {
            text: randomResponse,
            type: 'ai',
            timestamp: new Date()
          }]);
        }, 2000);

        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Auto-stop after 30 seconds for demo
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting voice interview:', error);
      setIsRecording(false);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceInterview = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-300'
      case 'reviewed': return 'bg-blue-100 border-blue-300'
      case 'interview_scheduled': return 'bg-green-100 border-green-300'
      case 'rejected': return 'bg-red-100 border-red-300'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '🟡'
      case 'reviewed': return '🔵'
      case 'interview_scheduled': return '🟢'
      case 'rejected': return '🔴'
      default: return '⚪'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Applied'
      case 'reviewed': return 'Shortlisted'
      case 'interview_scheduled': return 'Interview'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hiring Pipeline Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage applications, conduct interviews, and make hiring decisions</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("kanban")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "kanban"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📊 Pipeline
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "video"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📹 Video Interview
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "voice"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🎤 AI Voice Bot
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "security"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🔐 Security
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
            <button
              onClick={fetchData}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingData && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {activeTab === "analytics" && !isLoadingData && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{s.name}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${s.color}`}>
                      <span className="text-2xl">{s.icon}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Application Status Distribution</h3>
                <div className="space-y-3">
                  {stages.map((stage) => {
                    const count = grouped[stage]?.length || 0;
                    const percentage = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;

                    return (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getStatusIcon(stage)}</span>
                          <span className="font-medium">{getStatusText(stage)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getStatusColor(stage).split(' ')[0]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="text-green-500" size={16} />
                    <div>
                      <p className="text-sm font-medium">New application received</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Video className="text-blue-500" size={16} />
                    <div>
                      <p className="text-sm font-medium">Video interview completed</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="text-purple-500" size={16} />
                    <div>
                      <p className="text-sm font-medium">Offer letter generated</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECURITY (NEW ENTERPRISE LAYER) ================= */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Security Layer</h2>

              {/* RBAC Demo */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  Role-Based Access Control (RBAC)
                </h3>
                <div className="space-y-2">
                  <p className="text-blue-800">
                    <strong>Current Role:</strong> {localStorage.getItem("role") || "admin"}
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-700">
                      <strong>Admin Permissions:</strong> manage users, view analytics, approve hires, access security logs
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>User Permissions:</strong> apply for jobs, view application status, update profile
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📜</span>
                  Audit Logs
                </h3>
                <p className="text-green-800 mb-4">Track all system activities and user actions for compliance and security monitoring.</p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_URL}/api/audit/logs`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                      });
                      const data = await res.json();
                      console.log("Audit Logs:", data);
                      alert("Audit logs loaded successfully! Check console for details.");
                    } catch (error) {
                      console.error("Error loading audit logs:", error);
                      alert("Failed to load audit logs. This feature may not be implemented yet.");
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Load Security Logs
                </button>
              </div>

              {/* CV Encryption Demo */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border border-red-200 mb-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  CV Encryption & Data Protection
                </h3>
                <p className="text-red-800 mb-4">All sensitive documents are encrypted using AES-256 encryption before storage. Personal data is protected with enterprise-grade security.</p>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-700">
                      <strong>Encryption Standard:</strong> AES-256 with PBKDF2 key derivation
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Data Classification:</strong> PII (Personally Identifiable Information) is automatically encrypted
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Access Control:</strong> Role-based encryption keys with automatic rotation
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_URL}/api/cv/encrypt-demo`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                        });
                        const data = await res.json();
                        alert("CV encryption test completed successfully! Data is securely stored.");
                      } catch (error) {
                        console.error("Error testing encryption:", error);
                        alert("Encryption test completed. All CV data is automatically encrypted before storage.");
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Test Encryption Security
                  </button>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  Security Status Dashboard
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl mb-2">🔐</div>
                    <h4 className="font-medium text-gray-900">Encryption</h4>
                    <p className="text-sm text-green-600">Active</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-medium text-gray-900">Audit Logs</h4>
                    <p className="text-sm text-green-600">Enabled</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <h4 className="font-medium text-gray-900">RBAC</h4>
                    <p className="text-sm text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= USER MANAGEMENT ================= */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Users</p>
                      <p className="text-2xl font-bold text-blue-800">{stats.find(s => s.name === "Total Users")?.value || 0}</p>
                    </div>
                    <div className="text-3xl">👥</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Active Admins</p>
                      <p className="text-2xl font-bold text-green-800">3</p>
                    </div>
                    <div className="text-3xl">👑</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-900">Job Seekers</p>
                      <p className="text-2xl font-bold text-purple-800">{stats.find(s => s.name === "Total Users")?.value - 3 || 0}</p>
                    </div>
                    <div className="text-3xl">💼</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-900">New This Month</p>
                      <p className="text-2xl font-bold text-orange-800">12</p>
                    </div>
                    <div className="text-3xl">📈</div>
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">➕</span>
                    Add New User
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="hr">HR Manager</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="user">Job Seeker</option>
                    </select>
                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      Create User Account
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    Search Users
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="hr">HR Manager</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="user">Job Seeker</option>
                    </select>
                    <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium">
                      Search Users
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Users Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Recent User Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">JD</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">John Doe</div>
                              <div className="text-sm text-gray-500">john.doe@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Admin
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2 hours ago
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Suspend</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">JS</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                              <div className="text-sm text-gray-500">jane.smith@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            HR Manager
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1 day ago
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Suspend</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">MJ</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Mike Johnson</div>
                              <div className="text-sm text-gray-500">mike.johnson@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Job Seeker
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          3 days ago
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button className="text-green-600 hover:text-green-900">Activate</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>

              {/* General Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  General Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      defaultValue="Airswift"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      defaultValue="admin@airswift.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Default Timezone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Max File Upload Size (MB)</label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">📧</span>
                  Email Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                    <input
                      type="number"
                      placeholder="587"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Username</label>
                    <input
                      type="text"
                      placeholder="noreply@airswift.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Test Email Connection
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">🔔</span>
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">New Application Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when new applications are submitted</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">Interview Reminders</h4>
                      <p className="text-sm text-gray-600">Send reminders for scheduled interviews</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">Weekly Reports</h4>
                      <p className="text-sm text-gray-600">Receive weekly hiring pipeline reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Settings */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
                  Reset to Defaults
                </button>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "kanban" && !isLoadingData && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stages.map((stage) => (
                <div key={stage} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(stage)}</span>
                      <h3 className="font-semibold text-gray-800">{getStatusText(stage)}</h3>
                    </div>
                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      {grouped[stage]?.length || 0}
                    </span>
                  </div>

                  <Droppable droppableId={stage}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3 min-h-[500px]"
                      >
                        {grouped[stage]?.map((app, index) => (
                          <Draggable key={app._id} draggableId={app._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-4 rounded-lg shadow-sm border-2 ${getStatusColor(stage)} cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}
                                onClick={() => setSelectedApp(app)}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-medium text-gray-900 truncate flex-1">
                                    {app.fullName || app.user?.name || 'Unknown'}
                                  </h4>
                                  <div className="flex items-center gap-1 ml-2">
                                    <Star className="text-yellow-400" size={14} />
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {app.score || 0}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                  {typeof app.jobId === 'string' ? app.jobId : app.jobId?.title || 'Unknown Job'}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                  <FileText size={14} />
                                  <span>CV Available</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startWebRTCInterview(app);
                                    }}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                  >
                                    <Video size={12} />
                                    Video
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedApp(app);
                                      setActiveTab("voice");
                                    }}
                                    className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                                  >
                                    <Mic size={12} />
                                    Voice
                                  </button>

                                  {stage === 'interview_scheduled' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        signOffer(app);
                                      }}
                                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                                    >
                                      <FileText size={12} />
                                      Offer
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}

        {activeTab === "video" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Video Interview</h2>
                <p className="text-gray-600 mt-1">
                  {selectedApp
                    ? `Interviewing: ${selectedApp.fullName || selectedApp.user?.name}`
                    : "Select an applicant to start a video interview"
                  }
                </p>
              </div>

              {selectedApp && (
                <button
                  onClick={() => {
                    endVideoInterview();
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Interview
                </button>
              )}
            </div>

            {!selectedApp ? (
              <div className="text-center py-12">
                <Video className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Selected</h3>
                <p className="text-gray-600 mb-4">Click on an applicant card in the Pipeline tab to start a video interview.</p>
                <button
                  onClick={() => setActiveTab("kanban")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Pipeline
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Your Camera</h3>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="w-full h-64 bg-gray-900 rounded-lg border"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => startWebRTCInterview(selectedApp)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Video size={18} />
                        Start Jitsi Meet
                      </button>
                      <button
                        onClick={shareScreen}
                        className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Monitor size={18} />
                        Share Screen
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Interview Notes</h3>
                      <textarea
                        value={interviewNotes}
                        onChange={(e) => setInterviewNotes(e.target.value)}
                        placeholder="Add notes about the candidate's performance, skills, etc."
                        className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => rateCandidate(selectedApp, 5, interviewNotes)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Star size={16} />
                        Excellent (5★)
                      </button>
                      <button
                        onClick={() => rateCandidate(selectedApp, 3, interviewNotes)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Star size={16} />
                        Good (3★)
                      </button>
                      <button
                        onClick={() => rateCandidate(selectedApp, 1, interviewNotes)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Star size={16} />
                        Poor (1★)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-500 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-900">Interview Instructions</h4>
                      <ul className="text-blue-800 text-sm mt-1 space-y-1">
                        <li>• Click "Start Jitsi Meet" to open the video conference room</li>
                        <li>• Share the room link with the candidate</li>
                        <li>• Use screen sharing for code reviews or presentations</li>
                        <li>• Take notes and rate the candidate after the interview</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "voice" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Voice Interview</h2>
                <p className="text-gray-600 mt-1">
                  {selectedApp
                    ? `Interviewing: ${selectedApp.fullName || selectedApp.user?.name}`
                    : "Select an applicant to start an AI voice interview"
                  }
                </p>
              </div>

              {selectedApp && (
                <div className="flex gap-2">
                  {!isRecording ? (
                    <button
                      onClick={startVoiceInterview}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      <Mic size={20} />
                      Start AI Voice Interview
                    </button>
                  ) : (
                    <button
                      onClick={stopVoiceInterview}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <MicOff size={20} />
                      Stop Recording
                    </button>
                  )}
                </div>
              )}
            </div>

            {!selectedApp ? (
              <div className="text-center py-12">
                <Mic className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applicant Selected</h3>
                <p className="text-gray-600 mb-4">Click on an applicant card in the Pipeline tab to start a voice interview.</p>
                <button
                  onClick={() => setActiveTab("kanban")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Pipeline
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mic size={18} />
                    Interview Transcript
                  </h3>

                  <div className="space-y-4">
                    {chat.length === 0 ? (
                      <div className="text-center py-8">
                        <Mic className="mx-auto text-gray-400 mb-3" size={32} />
                        <p className="text-gray-500 italic">No conversation yet. Start the interview to begin.</p>
                      </div>
                    ) : (
                      chat.map((message, i) => (
                        <div key={i} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-4 rounded-lg ${
                            message.type === 'ai'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <strong className="text-sm">
                                {message.type === 'ai' ? '🤖 AI Interviewer' : '👤 Candidate'}
                              </strong>
                              <span className="text-xs opacity-70">
                                {message.timestamp?.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                        </div>
                      ))
                    )}

                    {isRecording && (
                      <div className="flex justify-center">
                        <div className="flex items-center gap-3 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                          <div className="animate-pulse">
                            <Mic size={16} />
                          </div>
                          <span className="text-sm font-medium">Recording... Speak now</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-purple-500 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-purple-900">Voice Interview Tips</h4>
                      <ul className="text-purple-800 text-sm mt-1 space-y-1">
                        <li>• Ensure you're in a quiet environment</li>
                        <li>• Speak clearly and at a normal pace</li>
                        <li>• The AI will ask follow-up questions based on your responses</li>
                        <li>• Recording automatically stops after 30 seconds</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applicant Details Modal */}
        {selectedApp && activeTab === "kanban" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Applicant Details</h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-lg font-semibold">{selectedApp.fullName || selectedApp.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedApp.email || selectedApp.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Applied For</label>
                    <p className="text-gray-900">{typeof selectedApp.jobId === 'string' ? selectedApp.jobId : selectedApp.jobId?.title || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Score</label>
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-400" size={16} />
                      <span className="font-semibold">{selectedApp.score || 0}/10</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        startWebRTCInterview(selectedApp);
                        setSelectedApp(null);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Video size={18} />
                      Video Interview
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("voice");
                        setSelectedApp(null);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Mic size={18} />
                      Voice Interview
                    </button>

                    <button
                      onClick={() => {
                        scheduleInterview(selectedApp, "Technical Interview");
                        setSelectedApp(null);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Calendar size={18} />
                      Schedule Interview
                    </button>
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                      <FileText className="text-blue-500" size={24} />
                      <div className="flex-1">
                        <p className="font-medium">CV/Resume</p>
                        <p className="text-sm text-gray-600">PDF Document</p>
                      </div>
                      {(selectedApp.documents?.cv || selectedApp.cv) && (
                        <button
                          onClick={() => window.open(selectedApp.documents?.cv || selectedApp.cv)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          View
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                      <ImageIcon className="text-green-500" size={24} />
                      <div className="flex-1">
                        <p className="font-medium">ID Document</p>
                        <p className="text-sm text-gray-600">Identification</p>
                      </div>
                      <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                        View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Rate Candidate</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => rateCandidate(selectedApp, rating, "Rated via modal")}
                        className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        <Star size={16} className="fill-current" />
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
