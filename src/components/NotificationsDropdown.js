import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiCheckCircle,
  FiTrash2,
  FiMail,
  FiCalendar,
  FiMessageSquare,
  FiAward,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const getNotificationIcon = (type) => {
  switch (type) {
    case "grade":
      return <FiAward size={16} color="#10b981" />;
    case "message":
      return <FiMessageSquare size={16} color="#3b82f6" />;
    case "event":
      return <FiCalendar size={16} color="#8b5cf6" />;
    case "announcement":
      return <FiMail size={16} color="#f59e0b" />;
    default:
      return <FiBell size={16} color="#6b7280" />;
  }
};

const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    showDropdown,
    setShowDropdown,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const dropdownRef = useRef(null);

  useEffect(() => {
    const isAuthenticated = () => {
      const token = localStorage.getItem("accessToken");
      return !!token;
    };

    // If not authenticated, don't show the bell
    if (!isAuthenticated()) {
      return null;
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Navigate based on notification type or link
    if (notification.link) {
      navigate(notification.link);
    }
    setShowDropdown(false);
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  // Ensure notifications is always an array
  const notificationsList = Array.isArray(notifications) ? notifications : [];
  const hasNotifications = notificationsList.length > 0;

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.bellButton}
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={styles.dropdown}
          >
            <div style={styles.header}>
              <h3 style={styles.title}>Notifications</h3>
              {hasNotifications && (
                <div style={styles.headerActions}>
                  <button onClick={markAllAsRead} style={styles.markAllBtn}>
                    Mark all read
                  </button>
                  <button
                    onClick={deleteAllNotifications}
                    style={styles.clearAllBtn}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div style={styles.list}>
              {loading ? (
                <div style={styles.loading}>
                  <div style={styles.spinner} />
                  <p>Loading...</p>
                </div>
              ) : !hasNotifications ? (
                <div style={styles.empty}>
                  <FiBell size={32} style={styles.emptyIcon} />
                  <p>No notifications</p>
                </div>
              ) : (
                notificationsList.map((notification) => (
                  <div
                    key={notification.id || notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      ...styles.notificationItem,
                      backgroundColor: notification.read
                        ? "#ffffff"
                        : "#f0f9ff",
                    }}
                  >
                    <div style={styles.iconWrapper}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={styles.content}>
                      <p style={styles.message}>
                        {notification.message || notification.title}
                      </p>
                      <div style={styles.meta}>
                        <span style={styles.time}>
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <span style={styles.unreadDot} />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id || notification._id);
                      }}
                      style={styles.deleteBtn}
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {hasNotifications && (
              <div style={styles.footer}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/notifications");
                  }}
                  style={styles.viewAllBtn}
                >
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
  },
  bellButton: {
    position: "relative",
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#6b7280",
    transition: "all 0.2s ease",
  },
  badge: {
    position: "absolute",
    top: "4px",
    right: "4px",
    minWidth: "16px",
    height: "16px",
    borderRadius: "8px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: "360px",
    maxWidth: "calc(100vw - 32px)",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: "1px solid #e5e7eb",
    zIndex: 1000,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
    gap: "8px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  markAllBtn: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    fontSize: "12px",
    cursor: "pointer",
  },
  clearAllBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: "12px",
    cursor: "pointer",
  },
  list: {
    maxHeight: "400px",
    overflowY: "auto",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    color: "#9ca3af",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "8px",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    color: "#9ca3af",
  },
  emptyIcon: {
    marginBottom: "12px",
    opacity: 0.5,
  },
  notificationItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  iconWrapper: {
    flexShrink: 0,
    marginTop: "2px",
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: "13px",
    color: "#374151",
    margin: 0,
    lineHeight: "1.4",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
  },
  time: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  unreadDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#4f46e5",
  },
  deleteBtn: {
    flexShrink: 0,
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
  },
  footer: {
    padding: "8px 16px 12px",
    borderTop: "1px solid #e5e7eb",
  },
  viewAllBtn: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    color: "#4f46e5",
    transition: "all 0.2s ease",
  },
};

export default NotificationsDropdown;
