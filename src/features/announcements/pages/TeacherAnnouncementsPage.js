import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { announcementsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const TeacherAnnouncementsPage = () => {
  const { t } = useTranslation();
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

  const grades = [t("grade_9"), t("grade_10"), t("grade_11"), t("grade_12")];
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
        if (ann.targetAudience === "all") return true;
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

    let payload = {
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      postedById: user?.id,
      postedBy: user?.name,
    };

    if (newAnnouncement.targetAllStudents) {
      payload.targetAudience = "students";
    } else if (newAnnouncement.targetGrade && newAnnouncement.targetSection) {
      payload.targetType = "section";
      payload.targetGrade = newAnnouncement.targetGrade;
      payload.targetSection = newAnnouncement.targetSection;
    } else if (newAnnouncement.targetGrade) {
      payload.targetType = "grade";
      payload.targetGrade = newAnnouncement.targetGrade;
    } else {
      toast.error(t("select_target_announcement"));
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
      toast.success(t("announcement_posted_success"));
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error(
        error.response?.data?.message || t("announcement_create_failed"),
      );
    }
  };

  const handleDelete = async (id) => {
    const ann = announcements.find((a) => a.id === id);
    if (ann?.postedById !== user?.id) {
      toast.error(t("cannot_delete_others"));
      return;
    }
    if (window.confirm(t("confirm_delete_announcement"))) {
      try {
        await announcementsAPI.deleteAnnouncement(id);
        setAnnouncements(announcements.filter((a) => a.id !== id));
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
      targetGrade: "",
      targetSection: "",
      targetAllStudents: false,
    });
  };

  const getTargetText = (ann) => {
    if (ann.targetAudience === "all") return t("global_admin");
    if (ann.targetAudience === "students") return t("all_students");
    if (ann.targetType === "grade")
      return t("grade_target", { grade: ann.targetGrade });
    if (ann.targetType === "section")
      return t("section_target", {
        grade: ann.targetGrade,
        section: ann.targetSection,
      });
    return t("specific_students");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner" />
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t("teacher_announcements")}</h1>
          <p style={styles.subtitle}>{t("post_class_updates")}</p>
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
              <FiUsers size={16} /> {t("all_students")}
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
              {t("specific_grade_section")}
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
                <option value="">{t("select_grade_optional")}</option>
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
                <option value="">{t("select_section_optional")}</option>
                {sections.map((s) => (
                  <option key={s}>
                    {t("section")} {s}
                  </option>
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
                {ann.postedById === user?.id && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    style={styles.deleteBtn}
                    title={t("delete")}
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
