import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBell,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiUserCheck,
  FiBookOpen,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const AdminAnnouncementsPage = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetType: "all", // all, role, grade, section
    targetRole: "",
    targetGrade: "",
    targetSection: "",
  });

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sections = ["A", "B", "C", "D"];
  const roles = ["parent", "teacher", "student"];

  useEffect(() => {
    // Demo announcements with target audience
    const demoAnnouncements = [
      {
        id: 1,
        title: "School Holiday",
        content: "School closed on Friday",
        targetType: "all",
        date: "2024-04-01",
        postedBy: "Admin",
      },
      {
        id: 2,
        title: "Grade 10 Exam Schedule",
        content: "Exams start next week",
        targetType: "grade",
        targetGrade: "Grade 10",
        date: "2024-04-02",
        postedBy: "Admin",
      },
      {
        id: 3,
        title: "Parent-Teacher Meeting",
        content: "Meeting for parents only",
        targetType: "role",
        targetRole: "parent",
        date: "2024-04-03",
        postedBy: "Admin",
      },
    ];
    setAnnouncements(demoAnnouncements);
  }, []);

  const handlePost = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill title and content");
      return;
    }
    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      date: new Date().toISOString().split("T")[0],
      postedBy: user?.name,
    };
    setAnnouncements([announcement, ...announcements]);
    setShowForm(false);
    setNewAnnouncement({
      title: "",
      content: "",
      targetType: "all",
      targetRole: "",
      targetGrade: "",
      targetSection: "",
    });
    toast.success("Announcement posted!");
  };

  const getTargetText = (announcement) => {
    if (announcement.targetType === "all") return "📢 Everyone";
    if (announcement.targetType === "role")
      return `👥 ${announcement.targetRole}s only`;
    if (announcement.targetType === "grade")
      return `📚 ${announcement.targetGrade} only`;
    if (announcement.targetType === "section")
      return `🏫 ${announcement.targetGrade} - Section ${announcement.targetSection} only`;
    return "Everyone";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📢 Announcements</h1>
        <p style={styles.subtitle}>
          Create announcements for specific audiences
        </p>
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
                  targetType: "all",
                  targetRole: "",
                  targetGrade: "",
                  targetSection: "",
                })
              }
              style={{
                ...styles.audienceBtn,
                ...(newAnnouncement.targetType === "all"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiUsers size={16} /> All Users
            </button>
            <button
              onClick={() =>
                setNewAnnouncement({ ...newAnnouncement, targetType: "role" })
              }
              style={{
                ...styles.audienceBtn,
                ...(newAnnouncement.targetType === "role"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiUserCheck size={16} /> By Role
            </button>
            <button
              onClick={() =>
                setNewAnnouncement({ ...newAnnouncement, targetType: "grade" })
              }
              style={{
                ...styles.audienceBtn,
                ...(newAnnouncement.targetType === "grade"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiBookOpen size={16} /> By Grade
            </button>
            <button
              onClick={() =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  targetType: "section",
                })
              }
              style={{
                ...styles.audienceBtn,
                ...(newAnnouncement.targetType === "section"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiBookOpen size={16} /> By Section
            </button>
          </div>

          {newAnnouncement.targetType === "role" && (
            <select
              value={newAnnouncement.targetRole}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  targetRole: e.target.value,
                })
              }
              style={styles.select}
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          )}

          {(newAnnouncement.targetType === "grade" ||
            newAnnouncement.targetType === "section") && (
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
              <option value="">Select Grade</option>
              {grades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          )}

          {newAnnouncement.targetType === "section" && (
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
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s}>Section {s}</option>
              ))}
            </select>
          )}

          <div style={styles.formActions}>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>
              Cancel
            </button>
            <button onClick={handlePost} style={styles.submitBtn}>
              Post Announcement
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.announcementsList}>
        {announcements.map((ann) => (
          <div key={ann.id} style={styles.announcementCard}>
            <div style={styles.announcementHeader}>
              <h3>{ann.title}</h3>
              <button style={styles.deleteBtn}>
                <FiTrash2 size={16} />
              </button>
            </div>
            <p style={styles.announcementContent}>{ann.content}</p>
            <div style={styles.announcementFooter}>
              <span style={styles.targetBadge}>{getTargetText(ann)}</span>
              <span>{ann.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: { fontSize: "28px", fontWeight: "700", color: "#1f2937" },
  subtitle: { fontSize: "14px", color: "#6b7280", marginTop: "4px" },
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
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    fontFamily: "inherit",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    display: "block",
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
  },
  audienceBtnActive: { backgroundColor: "#4f46e5", color: "white" },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    backgroundColor: "white",
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
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  announcementsList: { display: "flex", flexDirection: "column", gap: "16px" },
  announcementCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  announcementHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  announcementContent: { color: "#4b5563", marginBottom: "12px" },
  announcementFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    color: "#6b7280",
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
  },
};

export default AdminAnnouncementsPage;
