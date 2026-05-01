import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiCalendar,
  FiUser,
  FiPaperclip,
  FiSend,
  FiTrash2,
  FiEdit2,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEye,
  FiMessageSquare,
} from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { announcementsAPI } from "../../../services/api";

const AnnouncementsPage = ({ user: propUser }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "normal",
    category: "general",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    } else if (propUser) {
      setUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsAPI.getAllAnnouncements();
      const announcementsData = response.data;

      const formattedAnnouncements = announcementsData.map((ann) => ({
        id: ann.id || ann._id,
        title: ann.title,
        content: ann.content,
        priority: ann.priority || "normal",
        category: ann.category || "general",
        date: ann.createdAt
          ? new Date(ann.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        postedBy: ann.postedBy || user?.name || "Admin",
        postedById: ann.postedById || user?.id,
        readBy: ann.readBy || [],
        attachments: ann.attachments || [],
      }));

      setAnnouncements(formattedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill in title and content");
      return;
    }

    try {
      const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        priority: newAnnouncement.priority,
        category: newAnnouncement.category,
      };

      const response =
        await announcementsAPI.createAnnouncement(announcementData);
      const newAnn = response.data;

      const formattedAnnouncement = {
        id: newAnn.id || newAnn._id,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        priority: newAnnouncement.priority,
        category: newAnnouncement.category,
        date: format(new Date(), "yyyy-MM-dd"),
        postedBy: user?.name || "Admin",
        postedById: user?.id,
        readBy: [],
        attachments: [],
      };

      setAnnouncements([formattedAnnouncement, ...announcements]);
      resetForm();
      toast.success("Announcement posted successfully!");

      // Create notification
      const newNotification = {
        id: Date.now(),
        message: `New announcement: ${newAnnouncement.title}`,
        read: false,
        date: format(new Date(), "yyyy-MM-dd"),
      };
      setNotifications([newNotification, ...notifications]);
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error(
        error.response?.data?.message || "Failed to post announcement",
      );
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementsAPI.deleteAnnouncement(id);
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast.success("Announcement deleted");
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete announcement",
        );
      }
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const resetForm = () => {
    setNewAnnouncement({
      title: "",
      content: "",
      priority: "normal",
      category: "general",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return { bg: "#fee2e2", color: "#ef4444", border: "#fecaca" };
      case "medium":
        return { bg: "#fed7aa", color: "#f59e0b", border: "#fed7aa" };
      default:
        return { bg: "#d1fae5", color: "#10b981", border: "#a7f3d0" };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "event":
        return "🎉";
      case "holiday":
        return "🏖️";
      case "academic":
        return "📚";
      default:
        return "📢";
    }
  };

  const filteredAnnouncements =
    selectedCategory === "all"
      ? announcements
      : announcements.filter((a) => a.category === selectedCategory);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading announcements...</p>
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
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📢 Announcements</h1>
          <p style={styles.subtitle}>
            Stay updated with important news and events
          </p>
        </div>
        <div style={styles.headerActions}>
          {/* Notification Bell */}
          <div style={styles.notificationWrapper}>
            <button style={styles.notificationBtn}>
              <FiBell size={22} />
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>{unreadCount}</span>
              )}
            </button>
            {unreadCount > 0 && (
              <div style={styles.notificationDropdown}>
                {notifications
                  .filter((n) => !n.read)
                  .map((notif) => (
                    <div key={notif.id} style={styles.notificationItem}>
                      <p>{notif.message}</p>
                      <button onClick={() => handleMarkAsRead(notif.id)}>
                        Mark as read
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {user?.role === "teacher" && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={styles.addBtn}
            >
              + New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div style={styles.filters}>
        {["all", "event", "holiday", "academic", "general"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              ...styles.filterBtn,
              ...(selectedCategory === cat ? styles.filterBtnActive : {}),
            }}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Announcement Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.formCard}
          >
            <h3 style={styles.formTitle}>Create New Announcement</h3>
            <input
              type="text"
              placeholder="Announcement Title"
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  title: e.target.value,
                })
              }
              style={styles.input}
            />
            <textarea
              placeholder="Announcement Content"
              rows={4}
              value={newAnnouncement.content}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  content: e.target.value,
                })
              }
              style={styles.textarea}
            />
            <div style={styles.formRow}>
              <select
                value={newAnnouncement.priority}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    priority: e.target.value,
                  })
                }
                style={styles.select}
              >
                <option value="normal">Normal Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <select
                value={newAnnouncement.category}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    category: e.target.value,
                  })
                }
                style={styles.select}
              >
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="holiday">Holiday</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            <div style={styles.formActions}>
              <button onClick={() => resetForm()} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleAddAnnouncement} style={styles.submitBtn}>
                <FiSend size={16} /> Post Announcement
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div style={styles.emptyState}>
          <FiBell size={48} style={styles.emptyIcon} />
          <p>No announcements yet.</p>
          {user?.role === "teacher" && (
            <p style={styles.emptySubtext}>
              Click "New Announcement" to create one.
            </p>
          )}
        </div>
      ) : (
        <div style={styles.announcementsList}>
          {filteredAnnouncements.map((announcement, index) => {
            const priorityStyle = getPriorityColor(announcement.priority);
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.announcementCard}
              >
                <div style={styles.announcementHeader}>
                  <div style={styles.announcementTitle}>
                    <span style={{ fontSize: "24px", marginRight: "12px" }}>
                      {getCategoryIcon(announcement.category)}
                    </span>
                    <div>
                      <h3 style={styles.announcementHeading}>
                        {announcement.title}
                      </h3>
                      <div style={styles.metaInfo}>
                        <span>
                          <FiUser size={12} /> {announcement.postedBy}
                        </span>
                        <span>
                          <FiCalendar size={12} /> {announcement.date}
                        </span>
                        <span
                          style={{
                            ...styles.priorityBadge,
                            backgroundColor: priorityStyle.bg,
                            color: priorityStyle.color,
                          }}
                        >
                          {announcement.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user?.role === "teacher" && (
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() =>
                          handleDeleteAnnouncement(announcement.id)
                        }
                        style={styles.deleteBtn}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p style={styles.announcementContent}>{announcement.content}</p>
                <div style={styles.announcementFooter}>
                  <button style={styles.readMoreBtn}>Read More →</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
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
    alignItems: "center",
    gap: "16px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  notificationWrapper: {
    position: "relative",
  },
  notificationBtn: {
    position: "relative",
    padding: "10px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "10px",
  },
  notificationDropdown: {
    position: "absolute",
    top: "40px",
    right: "0",
    width: "280px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 100,
    padding: "8px",
  },
  notificationItem: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
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
    padding: "8px 16px",
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
  formCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1f2937",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  select: {
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  announcementsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "12px",
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
  announcementCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
  },
  announcementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  announcementTitle: {
    display: "flex",
    alignItems: "flex-start",
  },
  announcementHeading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  metaInfo: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    fontSize: "12px",
    color: "#6b7280",
    flexWrap: "wrap",
  },
  priorityBadge: {
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  },
  announcementContent: {
    color: "#4b5563",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  announcementFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  readMoreBtn: {
    color: "#4f46e5",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  deleteBtn: {
    padding: "6px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
  },
};

export default AnnouncementsPage;
