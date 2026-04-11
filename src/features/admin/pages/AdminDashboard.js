import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiBookOpen,
  FiCalendar,
  FiBell,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParents: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalAnnouncements: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Demo data - Replace with API call
    setTimeout(() => {
      setStats({
        totalUsers: 125,
        totalParents: 45,
        totalTeachers: 12,
        totalStudents: 68,
        totalAnnouncements: 24,
        totalEvents: 8,
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
      setLoading(false);
    }, 500);
  }, []);

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
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name || "Admin"}! 👑</p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <Link to={stat.link} key={index} style={{ textDecoration: "none" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={styles.statCard}
            >
              <div
                style={{
                  ...styles.statIcon,
                  backgroundColor: `${stat.color}15`,
                }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <p style={styles.statValue}>{loading ? "..." : stat.value}</p>
                <p style={styles.statLabel}>{stat.title}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 Recent Activities</h2>
        <div style={styles.activityList}>
          {recentActivities.map((activity) => (
            <div key={activity.id} style={styles.activityItem}>
              <div style={styles.activityIcon}>
                {activity.type === "teacher" && "👨‍🏫"}
                {activity.type === "parent" && "👨‍👩‍👧"}
                {activity.type === "student" && "🎓"}
                {activity.type === "announcement" && "📢"}
              </div>
              <div style={styles.activityContent}>
                <p style={styles.activityAction}>{activity.action}</p>
                <p style={styles.activityUser}>{activity.user}</p>
              </div>
              <span style={styles.activityDate}>{activity.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link to="/admin/users">
            <button style={styles.actionBtn}>👥 Manage Users</button>
          </Link>
          <Link to="/announcements">
            <button style={styles.actionBtn}>📢 Create Announcement</button>
          </Link>
          <Link to="/calendar">
            <button style={styles.actionBtn}>📅 Add Event</button>
          </Link>
          <Link to="/admin/stats">
            <button style={styles.actionBtn}>📊 View Reports</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
  },
  activityList: {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderBottom: "1px solid #f3f4f6",
  },
  activityIcon: {
    fontSize: "24px",
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
  },
  activityUser: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },
  activityDate: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  actionBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
};

export default AdminDashboard;
