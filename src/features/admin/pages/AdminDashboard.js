import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiUserCheck,
  FiBell,
  FiCalendar,
  FiTrendingUp,
  FiBarChart2,
  FiMessageSquare,
} from "react-icons/fi";
import "../../../assets/styles/dashboard.css";
import { adminAPI } from "../../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParents: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalAnnouncements: 0,
    totalEvents: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setAdminUser(JSON.parse(storedUser));
      }

      // Fetch stats from API
      const statsResponse = await adminAPI.getStats();
      const statsData = statsResponse.data;

      // Update stats with real data
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalParents: statsData.totalParents || 0,
        totalTeachers: statsData.totalTeachers || 0,
        totalStudents: statsData.totalStudents || 0,
        totalAnnouncements: statsData.totalAnnouncements || 0,
        totalEvents: statsData.totalEvents || 0,
        totalMessages: statsData.totalMessages || 0,
      });

      // Fetch recent users for activity feed
      const usersResponse = await adminAPI.getAllUsers();
      const users = usersResponse.data;

      // Create recent activities from recent users
      const recentUsers = users.slice(0, 5);
      const activities = recentUsers.map((user, index) => ({
        id: index + 1,
        action: `New ${user.role} registered`,
        user:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        date: new Date(user.createdAt || Date.now())
          .toISOString()
          .split("T")[0],
        type: user.role,
      }));

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to mock data if API fails
      setStats({
        totalUsers: 125,
        totalParents: 45,
        totalTeachers: 12,
        totalStudents: 68,
        totalAnnouncements: 24,
        totalEvents: 8,
        totalMessages: 5234,
      });
      setRecentActivities([
        {
          id: 1,
          action: "New teacher registered",
          user: "Mr. Smith",
          date: "2024-04-07",
          type: "teacher",
        },
        {
          id: 2,
          action: "New parent registered",
          user: "Jane Doe",
          date: "2024-04-06",
          type: "parent",
        },
        {
          id: 3,
          action: "Announcement posted",
          user: "Admin",
          date: "2024-04-05",
          type: "announcement",
        },
        {
          id: 4,
          action: "Student removed",
          user: "John Doe",
          date: "2024-04-04",
          type: "student",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "#3b82f6",
      link: "/admin/users",
    },
    {
      title: "Parents",
      value: stats.totalParents,
      icon: FiUserCheck,
      color: "#10b981",
      link: "/admin/users",
    },
    {
      title: "Teachers",
      value: stats.totalTeachers,
      icon: FiUserCheck,
      color: "#f59e0b",
      link: "/admin/users",
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: FiUserCheck,
      color: "#8b5cf6",
      link: "/admin/users",
    },
    {
      title: "Announcements",
      value: stats.totalAnnouncements,
      icon: FiBell,
      color: "#ef4444",
      link: "/announcements",
    },
    {
      title: "Events",
      value: stats.totalEvents,
      icon: FiCalendar,
      color: "#06b6d4",
      link: "/calendar",
    },
    {
      title: "Messages",
      value: stats.totalMessages,
      icon: FiMessageSquare,
      color: "#ec4899",
      link: "/messages",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {adminUser?.firstName || adminUser?.name || "Admin"}!
            👑
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <Link to={stat.link} key={index} className="stat-link">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="stat-card"
            >
              <div
                className="stat-icon"
                style={{
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                <stat.icon size={isMobile ? 20 : 24} />
              </div>
              <div>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.title}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">📋 Recent Activities</h2>
        <div className="activity-list">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {activity.type === "teacher" && "👨‍🏫"}
                {activity.type === "parent" && "👨‍👩‍👧"}
                {activity.type === "student" && "🎓"}
                {activity.type === "announcement" && "📢"}
              </div>
              <div className="activity-content">
                <p className="activity-action">{activity.action}</p>
                <p className="activity-user">{activity.user}</p>
              </div>
              <span className="activity-date">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">⚡ Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/users">
            <button className="action-btn">👥 Manage Users</button>
          </Link>
          <Link to="/announcements">
            <button className="action-btn">📢 Create Announcement</button>
          </Link>
          <Link to="/calendar">
            <button className="action-btn">📅 Add Event</button>
          </Link>
          <Link to="/admin/stats">
            <button className="action-btn">📊 View Reports</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
