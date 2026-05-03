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
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { announcementsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const AdminAnnouncementsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetAudience: "all", // all, teachers, parents, students, specific
  });

  // For UI we keep the old role/grade/section but map them to targetAudience string
  const [targetRole, setTargetRole] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [targetSection, setTargetSection] = useState("");

  const grades = [t("grade_9"), t("grade_10"), t("grade_11"), t("grade_12")];
  const sections = ["A", "B", "C", "D"];
  const roles = ["parent", "teacher", "student"];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsAPI.getAllAnnouncements();
      const announcementsData = response.data?.data || response.data || [];
      const announcementsList = Array.isArray(announcementsData)
        ? announcementsData
        : [];

      let filteredData = announcementsList;
      if (currentUser?.role === "teacher") {
        filteredData = announcementsList.filter(
          (ann) => ann.postedById === currentUser.id,
        );
      }

      const formattedAnnouncements = filteredData.map((ann) => ({
        id: ann.id || ann._id,
        title: ann.title,
        content: ann.content,
        targetAudience: ann.targetAudience || "all",
        date: ann.createdAt
          ? new Date(ann.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        postedBy: ann.postedBy || currentUser?.name || "Admin",
        postedById: ann.postedById || currentUser?.id,
      }));

      setAnnouncements(formattedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error(t("failed_load_announcements"));
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error(t("fill_title_content"));
      return;
    }

    const payload = {
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      targetAudience: newAnnouncement.targetAudience,
    };

    try {
      const response = await announcementsAPI.createAnnouncement(payload);
      const newAnn = response.data?.data || response.data;

      const formattedAnnouncement = {
        id: newAnn.id || newAnn._id,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        targetAudience: newAnnouncement.targetAudience,
        date: new Date().toISOString().split("T")[0],
        postedBy: currentUser?.name || "Admin",
        postedById: currentUser?.id,
      };

      setAnnouncements([formattedAnnouncement, ...announcements]);
      setShowForm(false);
      resetForm();
      toast.success(t("announcement_posted_success"));
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error(
        error.response?.data?.message || t("announcement_create_failed"),
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("confirm_delete_announcement"))) {
      try {
        await announcementsAPI.deleteAnnouncement(id);
        setAnnouncements(announcements.filter((ann) => ann.id !== id));
        toast.success(t("announcement_deleted_success"));
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error(
          error.response?.data?.message || t("announcement_delete_failed"),
        );
      }
    }
  };

  const resetForm = () => {
    setNewAnnouncement({
      title: "",
      content: "",
      targetAudience: "all",
    });
    setTargetRole("");
    setTargetGrade("");
    setTargetSection("");
  };

  const getTargetText = (announcement) => {
    switch (announcement.targetAudience) {
      case "all":
        return `${t("everyone")}`;
      case "teachers":
        return `${t("teachers_only")}`;
      case "parents":
        return `${t("parents_only")}`;
      case "students":
        return `${t("students_only")}`;
      case "specific":
        return `${t("specific_audience")}`;
      default:
        return `${t("everyone")}`;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>{t("loading_announcements")}</p>
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

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t("announcements")}</h1>
          <p style={styles.subtitle}>
            {isAdmin
              ? t("create_audience_announcements")
              : isTeacher
                ? t("send_announcements_to_students")
                : t("manage_announcements")}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
          <FiPlus size={16} /> {t("new_announcement")}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>{t("create_announcement")}</h3>
          <input
            type="text"
            placeholder={t("title_required")}
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            style={styles.input}
          />
          <textarea
            placeholder={t("content_required")}
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

          <label style={styles.label}>{t("target_audience")}</label>
          <div style={styles.audienceOptions}>
            <button
              onClick={() =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  targetAudience: "all",
                })
              }
              style={{
                ...styles.audienceBtn,
                ...(newAnnouncement.targetAudience === "all"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiUsers size={16} /> {t("all_users")}
            </button>
            {isAdmin && (
              <button
                onClick={() =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    targetAudience: "teachers",
                  })
                }
                style={{
                  ...styles.audienceBtn,
                  ...(newAnnouncement.targetAudience === "teachers"
                    ? styles.audienceBtnActive
                    : {}),
                }}
              >
                <FiUserCheck size={16} /> {t("teachers")}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    targetAudience: "parents",
                  })
                }
                style={{
                  ...styles.audienceBtn,
                  ...(newAnnouncement.targetAudience === "parents"
                    ? styles.audienceBtnActive
                    : {}),
                }}
              >
                <FiUserCheck size={16} /> {t("parents")}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    targetAudience: "students",
                  })
                }
                style={{
                  ...styles.audienceBtn,
                  ...(newAnnouncement.targetAudience === "students"
                    ? styles.audienceBtnActive
                    : {}),
                }}
              >
                <FiUserCheck size={16} /> {t("students")}
              </button>
            )}
          </div>

          <div style={styles.formActions}>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              style={styles.cancelBtn}
            >
              {t("cancel")}
            </button>
            <button onClick={handlePost} style={styles.submitBtn}>
              {t("post_announcement")}
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.announcementsList}>
        {announcements.length === 0 ? (
          <div style={styles.emptyState}>
            <FiBell size={48} style={styles.emptyIcon} />
            <p>{t("no_announcements")}</p>
            <p style={styles.emptySubtext}>{t("click_new_announcement")}</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} style={styles.announcementCard}>
              <div style={styles.announcementHeader}>
                <div>
                  <h3>{ann.title}</h3>
                  <span style={styles.postedBy}>
                    {t("posted_by")} {ann.postedBy}
                  </span>
                </div>
                <div style={styles.announcementActions}>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    style={styles.deleteBtn}
                    title={t("delete_announcement")}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
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
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
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
  announcementActions: {
    display: "flex",
    gap: "8px",
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

export default AdminAnnouncementsPage;
