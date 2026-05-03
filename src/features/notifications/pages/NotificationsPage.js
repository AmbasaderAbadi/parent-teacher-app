import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiTrash2,
  FiMail,
  FiCalendar,
  FiMessageSquare,
  FiAward,
  FiCheck,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../../../contexts/NotificationContext";

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [selectedFilter, setSelectedFilter] = useState("all");

  const getNotificationIcon = (type) => {
    switch (type) {
      case "grade":
        return <FiAward size={18} color="#10b981" />;
      case "message":
        return <FiMessageSquare size={18} color="#3b82f6" />;
      case "event":
        return <FiCalendar size={18} color="#8b5cf6" />;
      case "announcement":
        return <FiMail size={18} color="#f59e0b" />;
      default:
        return <FiBell size={18} color="#6b7280" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    const notifId = notification._id || notification.id;
    if (!notification.read) {
      await markAsRead(notifId);
    }
    if (notification.link) {
      navigate(notification.link);
    } else {
      switch (notification.type) {
        case "message":
          navigate("/messages");
          break;
        case "homework":
          navigate("/homework");
          break;
        case "material":
          navigate("/materials");
          break;
        case "announcement":
          navigate("/announcements");
          break;
        case "event":
          navigate("/calendar");
          break;
        case "grade":
          navigate("/student/grades");
          break;
        default:
          navigate("/notifications");
      }
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (selectedFilter === "unread") return !notif.read;
    if (selectedFilter === "read") return notif.read;
    return true;
  });

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return t("recently");
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>{t("loading_notifications")}</p>
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t("notifications")}</h1>
          <p style={styles.subtitle}>{t("notifications_subtitle")}</p>
        </div>
        {notifications.length > 0 && (
          <div style={styles.headerActions}>
            <button onClick={markAllAsRead} style={styles.markAllBtn}>
              <FiCheck size={16} /> {t("mark_all_read")}
            </button>
            <button onClick={deleteAllNotifications} style={styles.clearAllBtn}>
              <FiTrash2 size={16} /> {t("clear_all")}
            </button>
          </div>
        )}
      </div>

      <div style={styles.filters}>
        <button
          onClick={() => setSelectedFilter("all")}
          style={{
            ...styles.filterBtn,
            ...(selectedFilter === "all" ? styles.filterBtnActive : {}),
          }}
        >
          {t("all_notifications")} ({notifications.length})
        </button>
        <button
          onClick={() => setSelectedFilter("unread")}
          style={{
            ...styles.filterBtn,
            ...(selectedFilter === "unread" ? styles.filterBtnActive : {}),
          }}
        >
          {t("unread")} ({unreadCount})
        </button>
        <button
          onClick={() => setSelectedFilter("read")}
          style={{
            ...styles.filterBtn,
            ...(selectedFilter === "read" ? styles.filterBtnActive : {}),
          }}
        >
          {t("read")} ({notifications.length - unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div style={styles.empty}>
          <FiBell size={64} style={styles.emptyIcon} />
          <p>{t("no_notifications")}</p>
          <p style={styles.emptySubtext}>{t("all_caught_up")}</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredNotifications.map((notification, index) => {
            const notifId = notification._id || notification.id;
            return (
              <motion.div
                key={notifId}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  ...styles.notificationCard,
                  backgroundColor: notification.read ? "#ffffff" : "#f0f9ff",
                  cursor: "pointer",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={styles.notificationContent}>
                  <p style={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  <div style={styles.notificationMeta}>
                    <span style={styles.notificationTime}>
                      {formatTime(notification.createdAt)}
                    </span>
                    {!notification.read && (
                      <span style={styles.unreadBadge}>{t("new_badge")}</span>
                    )}
                  </div>
                </div>
                <div style={styles.notificationActions}>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notifId);
                      }}
                      style={styles.readBtn}
                      title={t("mark_as_read")}
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notifId);
                    }}
                    style={styles.deleteBtn}
                    title={t("delete")}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  markAllBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  clearAllBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  filterBtnActive: {
    backgroundColor: "#4f46e5",
    color: "white",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  empty: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptyIcon: {
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#d1d5db",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  notificationCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "16px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "all 0.2s ease",
  },
  notificationIcon: {
    flexShrink: 0,
    marginTop: "2px",
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: "14px",
    color: "#374151",
    margin: 0,
    lineHeight: "1.5",
  },
  notificationMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "6px",
  },
  notificationTime: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  unreadBadge: {
    padding: "2px 8px",
    backgroundColor: "#4f46e5",
    color: "white",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "500",
  },
  notificationActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  readBtn: {
    padding: "6px",
    backgroundColor: "#d1fae5",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#10b981",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    padding: "6px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
    transition: "all 0.2s ease",
  },
};

export default NotificationsPage;
