import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiUserCheck,
  FiBell,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "../../../assets/styles/dashboard.css";
import { adminAPI } from "../../../services/api";

const AdminDashboard = () => {
  const { t } = useTranslation();
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
      const storedUser = localStorage.getItem("user");
      if (storedUser) setAdminUser(JSON.parse(storedUser));

      const statsResponse = await adminAPI.getStats();
      const statsData = statsResponse.data?.data || statsResponse.data || {};

      const usersResponse = await adminAPI.getAllUsers();
      const usersData = usersResponse.data?.data || usersResponse.data || [];
      const usersList = Array.isArray(usersData) ? usersData : [];

      const roleCounts = { parent: 0, teacher: 0, student: 0 };
      usersList.forEach((user) => {
        if (user.role === "parent") roleCounts.parent++;
        else if (user.role === "teacher") roleCounts.teacher++;
        else if (user.role === "student") roleCounts.student++;
      });

      setStats({
        totalUsers: statsData.totalUsers ?? usersList.length,
        totalParents: statsData.totalParents ?? roleCounts.parent,
        totalTeachers: statsData.totalTeachers ?? roleCounts.teacher,
        totalStudents: statsData.totalStudents ?? roleCounts.student,
        totalAnnouncements: statsData.totalAnnouncements ?? 0,
        totalEvents: statsData.totalEvents ?? 0,
        totalMessages: statsData.totalMessages ?? 0,
      });

      const recentUsers = usersList.slice(0, 5);
      const activities = recentUsers.map((user, idx) => ({
        id: idx + 1,
        action: t("new_user_registered", { role: user.role || "user" }),
        user:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email ||
          user.phoneNumber,
        date: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        type: user.role || "user",
      }));
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: t("total_users"),
      value: stats.totalUsers,
      icon: FiUsers,
      color: "#3b82f6",
      link: "/admin/users",
    },
    {
      title: t("parents"),
      value: stats.totalParents,
      icon: FiUserCheck,
      color: "#10b981",
      link: "/admin/users",
    },
    {
      title: t("teachers"),
      value: stats.totalTeachers,
      icon: FiUserCheck,
      color: "#f59e0b",
      link: "/admin/users",
    },
    {
      title: t("students"),
      value: stats.totalStudents,
      icon: FiUserCheck,
      color: "#8b5cf6",
      link: "/admin/users",
    },
    {
      title: t("announcements"),
      value: stats.totalAnnouncements,
      icon: FiBell,
      color: "#ef4444",
      link: "/announcements",
    },
    {
      title: t("events"),
      value: stats.totalEvents,
      icon: FiCalendar,
      color: "#06b6d4",
      link: "/calendar",
    },
    {
      title: t("messages"),
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
        <p>{t("loading_dashboard")}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t("admin_dashboard")}</h1>
          <p className="dashboard-subtitle">
            {t("welcome_back")}{" "}
            {adminUser?.firstName || adminUser?.name || "Admin"}! 👑
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
        <h2 className="section-title">📋 {t("recent_activities")}</h2>
        <div className="activity-list">
          {recentActivities.length === 0 ? (
            <div className="empty-activities">
              <p>{t("no_recent_activities")}</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === "teacher" && "👨‍🏫"}
                  {activity.type === "parent" && "👨‍👩‍👧"}
                  {activity.type === "student" && "🎓"}
                </div>
                <div className="activity-content">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-user">{activity.user}</p>
                </div>
                <span className="activity-date">{activity.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">⚡ {t("quick_actions")}</h2>
        <div className="actions-grid">
          <Link to="/admin/users">
            <button className="action-btn">{t("manage_users")}</button>
          </Link>
          <Link to="/announcements">
            <button className="action-btn">{t("create_announcement")}</button>
          </Link>
          <Link to="/calendar">
            <button className="action-btn">{t("add_event")}</button>
          </Link>
          <Link to="/admin/stats">
            <button className="action-btn">{t("view_reports")}</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
