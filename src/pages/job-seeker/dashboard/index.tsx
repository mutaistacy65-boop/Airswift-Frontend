"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSocket } from "@/services/socket";
import { useAuth } from "@/context/AuthContext";
import API from "@/services/apiClient";
import UserLayout from "@/layouts/UserLayout";

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  interviewsScheduled: number;
  unreadMessages: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'interview' | 'message' | 'status_change';
  title: string;
  description: string;
  createdAt: string;
}

interface UpcomingInterview {
  id: string;
  job: { title: string };
  scheduledAt: string;
  location: string;
  status: string;
}

interface LatestApplication {
  id: string;
  job: { title: string };
  status: string;
  createdAt: string;
}

interface RecentMessage {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);
  const [latestApplications, setLatestApplications] = useState<LatestApplication[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  // 📊 Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await API.get('/user/dashboard');
        setStats(statsResponse.data.stats);

        // Fetch upcoming interviews
        const interviewsResponse = await API.get('/interviews/my');
        setUpcomingInterviews(interviewsResponse.data.interviews.slice(0, 3)); // Show next 3

        // Fetch latest applications
        const applicationsResponse = await API.get('/applications/my?page=1&limit=3');
        setLatestApplications(applicationsResponse.data.applications);

        // Fetch recent messages
        const messagesResponse = await API.get('/messages?page=1&limit=3');
        setRecentMessages(messagesResponse.data.messages);

        // Fetch notifications
        const notificationsResponse = await API.get('/notifications');
        setNotifications(notificationsResponse.data.notifications.slice(0, 5)); // Show latest 5

        // Mock recent activities (since API might not have this)
        setRecentActivities([
          {
            id: '1',
            type: 'application',
            title: 'Application Submitted',
            description: 'Your application for Software Engineer was submitted successfully',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'status_change',
            title: 'Status Updated',
            description: 'Your application status changed to Shortlisted',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // �🔥 Real-time updates
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
    <UserLayout sidebarItems={[
      { label: 'Dashboard', href: '/job-seeker/dashboard' },
      { label: 'My Applications', href: '/job-seeker/applications' },
      { label: 'Interviews', href: '/job-seeker/interviews' },
      { label: 'Messages', href: '/messages' },
    ]}>
      <div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <h1 className="text-3xl font-bold">Welcome back, {user && user.name}!</h1>
          <p className="text-blue-100 mt-2">Here's what's happening with your applications</p>
        </div>

        {/* 📊 2. Key Summary Cards */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.acceptedApplications}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejectedApplications || 0}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.interviewsScheduled}</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.unreadMessages}</div>
              <div className="text-sm text-gray-600">Unread Messages</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 📢 3. Recent Activity Feed */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-gray-600 text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📅 4. Upcoming Interviews */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium">{interview.job.title}</h3>
                    <p className="text-sm text-gray-600">
                      📅 {new Date(interview.scheduledAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {interview.location || 'TBD'}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {interview.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No interviews scheduled yet</p>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 📝 5. Latest Application Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Latest Applications</h2>
              <button
                onClick={() => router.push('/job-seeker/applications')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {latestApplications.map((app) => (
                <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.job.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 💬 6. Recent Messages Preview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Messages</h2>
              <button
                onClick={() => router.push('/messages')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Go to Messages →
              </button>
            </div>
            <div className="space-y-3">
              {recentMessages.map((message) => (
                <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">{message.subject || 'Message'}</p>
                  <p className="text-gray-600 text-sm truncate">{message.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(message.created_at).toLocaleDateString()}
                    {!message.is_read && <span className="ml-2 text-blue-600">●</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 🔔 7. Notifications Panel */}
        {notifications.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="text-blue-600 text-sm">New</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
