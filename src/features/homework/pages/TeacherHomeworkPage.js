import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiPaperclip } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { homeworkAPI } from "../../../services/api";
import toast from "react-hot-toast";

const TeacherHomeworkPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [homeworks, setHomeworks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    subject: user?.subject || "",
    grade: "",
    className: "",
    dueDate: "",
  });

  const grades = [t("grade_9"), t("grade_10"), t("grade_11"), t("grade_12")];
  const classNames = ["A", "B", "C", "D"];
  const subjects = [
    t("mathematics"),
    t("physics"),
    t("chemistry"),
    t("biology"),
    t("english"),
    t("history"),
    t("geography"),
  ];

  useEffect(() => {
    fetchHomeworks();
  }, [user?.subject]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const response = await homeworkAPI.getAllHomework();
      const homeworkData = response.data?.data || response.data || [];
      const homeworkList = Array.isArray(homeworkData) ? homeworkData : [];

      let filteredData = homeworkList;
      if (user?.subject) {
        filteredData = homeworkList.filter((h) => h.subject === user.subject);
      }

      const formattedHomeworks = filteredData.map((hw) => ({
        id: hw.id || hw._id,
        title: hw.title,
        description: hw.description,
        subject: hw.subject,
        grade: hw.grade,
        className: hw.className,
        dueDate: hw.dueDate?.split("T")[0] || hw.dueDate,
        postedBy: hw.postedBy || user?.name,
        postedDate: hw.createdAt
          ? new Date(hw.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        submissionsCount: hw.submissionsCount || 0,
        attachments: hw.attachments || [],
      }));

      setHomeworks(formattedHomeworks);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      toast.error(t("failed_load_homework"));
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(t("file_too_large"));
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePost = async () => {
    if (
      !newHomework.title ||
      !newHomework.subject ||
      !newHomework.grade ||
      !newHomework.className ||
      !newHomework.dueDate
    ) {
      toast.error(t("required_fields_homework"));
      return;
    }

    setUploading(true);
    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("files", selectedFile);
        formData.append("title", newHomework.title);
        formData.append("description", newHomework.description || "");
        formData.append("subject", newHomework.subject);
        formData.append("grade", newHomework.grade);
        formData.append("className", newHomework.className);
        formData.append("dueDate", newHomework.dueDate);

        response = await homeworkAPI.createHomeworkWithFiles(formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            console.log(`Upload progress: ${percent}%`);
          },
        });
      } else {
        const payload = {
          title: newHomework.title,
          description: newHomework.description,
          subject: newHomework.subject,
          grade: newHomework.grade,
          className: newHomework.className,
          dueDate: newHomework.dueDate,
        };
        response = await homeworkAPI.createHomework(payload);
      }

      const newHomeworkItem = response.data?.data || response.data;

      const homework = {
        id: newHomeworkItem.id || newHomeworkItem._id,
        title: newHomework.title,
        description: newHomework.description,
        subject: newHomework.subject,
        grade: newHomework.grade,
        className: newHomework.className,
        dueDate: newHomework.dueDate,
        postedBy: user?.name,
        postedDate: new Date().toISOString().split("T")[0],
        submissionsCount: 0,
        attachments: selectedFile ? [selectedFile.name] : [],
      };

      setHomeworks([homework, ...homeworks]);
      setShowForm(false);
      resetForm();
      toast.success(t("homework_assigned_success"));
    } catch (error) {
      console.error("Error creating homework:", error);
      toast.error(error.response?.data?.message || t("homework_assign_failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingHomework) return;

    setUploading(true);
    try {
      const updateData = {
        title: newHomework.title,
        description: newHomework.description,
        subject: newHomework.subject,
        grade: newHomework.grade,
        className: newHomework.className,
        dueDate: newHomework.dueDate,
      };

      await homeworkAPI.updateHomework(editingHomework.id, updateData);
      await fetchHomeworks();

      setShowForm(false);
      setEditingHomework(null);
      resetForm();
      toast.success(t("homework_updated_success"));
    } catch (error) {
      console.error("Error updating homework:", error);
      toast.error(error.response?.data?.message || t("homework_update_failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (homeworkId) => {
    if (window.confirm(t("confirm_delete_homework"))) {
      try {
        await homeworkAPI.deleteHomework(homeworkId);
        setHomeworks(homeworks.filter((h) => h.id !== homeworkId));
        toast.success(t("homework_deleted_success"));
      } catch (error) {
        console.error("Error deleting homework:", error);
        toast.error(
          error.response?.data?.message || t("homework_delete_failed"),
        );
      }
    }
  };

  const handleEdit = (homework) => {
    setEditingHomework(homework);
    setNewHomework({
      title: homework.title,
      description: homework.description || "",
      subject: homework.subject,
      grade: homework.grade,
      className: homework.className,
      dueDate: homework.dueDate,
    });
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleViewSubmissions = async (homeworkId) => {
    try {
      const response = await homeworkAPI.getSubmissions(homeworkId);
      const submissions = response.data?.data || response.data || [];
      toast.success(t("submissions_received", { count: submissions.length }));
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error(t("failed_load_submissions"));
    }
  };

  const resetForm = () => {
    setNewHomework({
      title: "",
      description: "",
      subject: user?.subject || "",
      grade: "",
      className: "",
      dueDate: "",
    });
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner" />
        <p>{t("loading_homework")}</p>
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
          <h1 style={styles.title}>{t("homework_management")}</h1>
          <p style={styles.subtitle}>{t("assign_homework")}</p>
        </div>
        <button
          onClick={() => {
            setEditingHomework(null);
            resetForm();
            setShowForm(true);
          }}
          style={styles.addBtn}
        >
          <FiPlus size={16} /> {t("assign_homework")}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>
            {editingHomework ? t("edit_homework") : t("assign_new_homework")}
          </h3>
          <input
            type="text"
            placeholder={t("homework_title_required")}
            value={newHomework.title}
            onChange={(e) =>
              setNewHomework({ ...newHomework, title: e.target.value })
            }
            style={styles.input}
            disabled={uploading}
          />
          <textarea
            placeholder={t("description_instructions")}
            rows={3}
            value={newHomework.description}
            onChange={(e) =>
              setNewHomework({ ...newHomework, description: e.target.value })
            }
            style={styles.textarea}
            disabled={uploading}
          />

          <div style={styles.row}>
            <select
              value={newHomework.subject}
              onChange={(e) =>
                setNewHomework({ ...newHomework, subject: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">{t("select_subject")}</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={newHomework.grade}
              onChange={(e) =>
                setNewHomework({ ...newHomework, grade: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">{t("select_grade")}</option>
              {grades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <select
              value={newHomework.className}
              onChange={(e) =>
                setNewHomework({ ...newHomework, className: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">{t("select_class")}</option>
              {classNames.map((c) => (
                <option key={c}>
                  {t("section")} {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newHomework.dueDate}
              onChange={(e) =>
                setNewHomework({ ...newHomework, dueDate: e.target.value })
              }
              style={styles.input}
              disabled={uploading}
              required
            />
          </div>

          {!editingHomework && (
            <div style={styles.fileSection}>
              <label style={styles.fileLabel}>
                <FiPaperclip size={14} /> {t("attachment_optional")}
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                style={styles.fileInput}
              />
              {selectedFile && (
                <div style={styles.fileInfo}>
                  <span>{selectedFile.name}</span>
                  <span style={styles.fileSize}>
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
              <p style={styles.fileHint}>{t("file_hint")}</p>
            </div>
          )}

          <div style={styles.formActions}>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingHomework(null);
                resetForm();
              }}
              style={styles.cancelBtn}
              disabled={uploading}
            >
              {t("cancel")}
            </button>
            <button
              onClick={editingHomework ? handleUpdate : handlePost}
              style={styles.submitBtn}
              disabled={uploading}
            >
              {uploading
                ? t("processing")
                : editingHomework
                  ? t("update_homework")
                  : t("assign_homework_btn")}
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.homeworkList}>
        <h3>{t("my_assigned_homework", { count: homeworks.length })}</h3>
        {homeworks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>{t("no_homework_assigned")}</p>
            <p style={styles.emptyStateSubtext}>{t("click_assign_homework")}</p>
          </div>
        ) : (
          homeworks.map((hw) => (
            <div key={hw.id} style={styles.homeworkCard}>
              <div style={styles.homeworkInfo}>
                <div style={styles.homeworkHeader}>
                  <h3 style={styles.homeworkTitle}>{hw.title}</h3>
                  <span style={styles.submissionsCount}>
                    {hw.submissionsCount} {t("submission")}
                    {hw.submissionsCount !== 1 ? t("s") : ""}
                  </span>
                </div>
                {hw.description && (
                  <p style={styles.homeworkDesc}>{hw.description}</p>
                )}
                {hw.attachments && hw.attachments.length > 0 && (
                  <div style={styles.attachments}>
                    <FiPaperclip size={12} />
                    <span>{hw.attachments[0]}</span>
                  </div>
                )}
                <p style={styles.meta}>
                  {t("subject_short")}: {hw.subject} • {t("due")}: {hw.dueDate}{" "}
                  • {hw.grade} - {hw.className}
                </p>
              </div>
              <div style={styles.actions}>
                <button
                  onClick={() => handleViewSubmissions(hw.id)}
                  style={styles.viewBtn}
                  title={t("view_submissions")}
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(hw)}
                  style={styles.editBtn}
                  title={t("edit_homework")}
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(hw.id)}
                  style={styles.deleteBtn}
                  title={t("delete_homework")}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
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
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  select: {
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
  homeworkList: { marginTop: "24px" },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptyStateSubtext: { fontSize: "12px", marginTop: "8px", color: "#d1d5db" },
  homeworkCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
    transition: "box-shadow 0.2s ease",
  },
  homeworkInfo: { flex: 1 },
  homeworkHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "8px",
  },
  homeworkTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
  },
  submissionsCount: {
    fontSize: "11px",
    padding: "2px 8px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "12px",
  },
  homeworkDesc: { fontSize: "13px", color: "#6b7280", marginBottom: "8px" },
  meta: { fontSize: "12px", color: "#6b7280", margin: "4px 0" },
  actions: { display: "flex", gap: "8px" },
  viewBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
    transition: "all 0.2s ease",
  },
  editBtn: {
    padding: "6px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
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
  fileSection: { marginBottom: "16px" },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  fileInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
  },
  fileInfo: {
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#4b5563",
  },
  fileSize: { fontSize: "11px", color: "#6b7280" },
  fileHint: { fontSize: "11px", color: "#9ca3af", marginTop: "6px" },
  attachments: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "6px",
  },
};

export default TeacherHomeworkPage;
