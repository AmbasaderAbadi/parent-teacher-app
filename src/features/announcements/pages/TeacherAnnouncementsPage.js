import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { announcementsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const TeacherAnnouncementsPage = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetGrade: "",
    targetSection: "",
    targetAllStudents: false,
  });

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsAPI.getAllAnnouncements();
      const allData = response.data?.data || response.data || [];
      const announcementsList = Array.isArray(allData) ? allData : [];

      // Show: admin global announcements + teacher's own announcements
      const filtered = announcementsList.filter((ann) => {
        // Admin global announcements (targetAudience = "all")
        if (ann.targetAudience === "all") return true;
        // Teacher's own announcements
        if (ann.postedById === user?.id) return true;
        return false;
      });

      const formatted = filtered.map((ann) => ({
        id: ann.id || ann._id,
        title: ann.title,
        content: ann.content,
        targetType: ann.targetType,
        targetGrade: ann.targetGrade,
        targetSection: ann.targetSection,
        targetAudience: ann.targetAudience,
        date: ann.createdAt
          ? new Date(ann.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        postedBy: ann.postedBy || "Admin",
        postedById: ann.postedById,
      }));

      setAnnouncements(formatted);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill title and content");
      return;
    }

    let payload = {
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      postedById: user?.id,
      postedBy: user?.name,
    };

    if (newAnnouncement.targetAllStudents) {
      // Send to all students (global announcement)
      payload.targetAudience = "students";
    } else if (newAnnouncement.targetGrade && newAnnouncement.targetSection) {
      // Send to a specific section
      payload.targetType = "section";
      payload.targetGrade = newAnnouncement.targetGrade;
      payload.targetSection = newAnnouncement.targetSection;
    } else if (newAnnouncement.targetGrade) {
      // Send to a whole grade
      payload.targetType = "grade";
      payload.targetGrade = newAnnouncement.targetGrade;
    } else {
      toast.error(
        "Please select a target (All Students, Grade, or Grade+Section)",
      );
      return;
    }

    try {
      const response = await announcementsAPI.createAnnouncement(payload);
      const newAnn = response.data?.data || response.data;

      const formattedAnn = {
        id: newAnn.id || newAnn._id,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        targetType: payload.targetType,
        targetGrade: payload.targetGrade,
        targetSection: payload.targetSection,
        targetAudience: payload.targetAudience,
        date: new Date().toISOString().split("T")[0],
        postedBy: user?.name,
        postedById: user?.id,
      };

      setAnnouncements([formattedAnn, ...announcements]);
      setShowForm(false);
      resetForm();
      toast.success("Announcement posted!");
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error(
        error.response?.data?.message || "Failed to post announcement",
      );
    }
  };

  const handleDelete = async (id) => {
    // Only allow deletion of own announcements
    const ann = announcements.find((a) => a.id === id);
    if (ann?.postedById !== user?.id) {
      toast.error("You can only delete your own announcements");
      return;
    }
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementsAPI.deleteAnnouncement(id);
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast.success("Announcement deleted!");
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  const resetForm = () => {
    setNewAnnouncement({
      title: "",
      content: "",
      targetGrade: "",
      targetSection: "",
      targetAllStudents: false,
    });
  };

  const getTargetText = (ann) => {
    if (ann.targetAudience === "all") return "📢 Global (Admin)";
    if (ann.targetAudience === "students") return "📢 All Students";
    if (ann.targetType === "grade") return `📚 Grade: ${ann.targetGrade}`;
    if (ann.targetType === "section")
      return `🏫 ${ann.targetGrade} - Section ${ann.targetSection}`;
    return "🎯 Specific students";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner" />
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
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📢 Teacher Announcements</h1>
          <p style={styles.subtitle}>Post updates for your classes</p>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
          <FiPlus size={16} /> New Announcement
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>Create Announcement</h3>
          <input
            type="text"
            placeholder="Title *"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            style={styles.input}
          />
          <textarea
            placeholder="Content *"
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

          <label style={styles.label}>Target Audience:</label>
          <div style={styles.audienceOptions}>
            <button
              onClick={() =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  targetAllStudents: true,
                  targetGrade: "",
                  targetSection: "",
                })
              }
              style={{
                ...styles.audienceBtn,
                ...(newAnnouncement.targetAllStudents
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiUsers size={16} /> All Students
            </button>
            <button
              onClick={() =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  targetAllStudents: false,
                })
              }
              style={{
                ...styles.audienceBtn,
                ...(!newAnnouncement.targetAllStudents &&
                (newAnnouncement.targetGrade || newAnnouncement.targetSection)
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              Specific Grade / Section
            </button>
          </div>

          {!newAnnouncement.targetAllStudents && (
            <div style={styles.row}>
              <select
                value={newAnnouncement.targetGrade}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    targetGrade: e.target.value,
                  })
                }
                style={styles.select}
              >
                <option value="">Select Grade (optional)</option>
                {grades.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <select
                value={newAnnouncement.targetSection}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    targetSection: e.target.value,
                  })
                }
                style={styles.select}
              >
                <option value="">Select Section (optional)</option>
                {sections.map((s) => (
                  <option key={s}>Section {s}</option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.formActions}>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button onClick={handlePost} style={styles.submitBtn}>
              Post Announcement
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.announcementsList}>
        {announcements.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No announcements yet.</p>
            <p style={styles.emptySubtext}>
              Click "New Announcement" to create one.
            </p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} style={styles.announcementCard}>
              <div style={styles.announcementHeader}>
                <div>
                  <h3>{ann.title}</h3>
                  <span style={styles.postedBy}>Posted by: {ann.postedBy}</span>
                </div>
                {ann.postedById === user?.id && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    style={styles.deleteBtn}
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
              <p style={styles.announcementContent}>{ann.content}</p>
              <div style={styles.announcementFooter}>
                <span style={styles.targetBadge}>{getTargetText(ann)}</span>
                <span>{ann.date}</span>
              </div>
            </div>
          ))
        )}
      </div>

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
    margin: "0 0 4px",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  formCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
    fontFamily: "inherit",
    fontSize: "14px",
    resize: "vertical",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    marginTop: "8px",
    display: "block",
    color: "#374151",
  },
  audienceOptions: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  audienceBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  audienceBtnActive: { backgroundColor: "#4f46e5", color: "white" },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    fontSize: "14px",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  announcementsList: { display: "flex", flexDirection: "column", gap: "16px" },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptySubtext: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#d1d5db",
  },
  announcementCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.2s ease",
  },
  announcementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "8px",
  },
  postedBy: {
    fontSize: "11px",
    color: "#9ca3af",
    display: "block",
    marginTop: "4px",
  },
  announcementContent: {
    color: "#4b5563",
    marginBottom: "12px",
    lineHeight: "1.6",
  },
  announcementFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    color: "#6b7280",
    flexWrap: "wrap",
    gap: "8px",
  },
  targetBadge: {
    padding: "4px 10px",
    backgroundColor: "#eef2ff",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
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

export default TeacherAnnouncementsPage;
