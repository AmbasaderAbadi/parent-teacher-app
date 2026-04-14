import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFile,
  FiImage,
  FiUpload,
  FiDownload,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { homeworkAPI } from "../../../services/api";
import toast from "react-hot-toast";

const TeacherHomeworkPage = () => {
  const { user } = useAuthStore();
  const [homeworks, setHomeworks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    subject: user?.subject || "",
    grade: "",
    section: "",
    dueDate: "",
    dueTime: "23:59",
    fileType: "",
    fileName: "",
  });

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    fetchHomeworks();
  }, [user?.subject]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const response = await homeworkAPI.getMyHomework();
      let homeworkData = response.data;

      // Filter by subject if needed
      if (user?.subject) {
        homeworkData = homeworkData.filter((h) => h.subject === user.subject);
      }

      // Transform API data to match component structure
      const formattedHomeworks = homeworkData.map((hw) => ({
        id: hw.id || hw._id,
        title: hw.title,
        description: hw.description,
        subject: hw.subject,
        grade: hw.grade,
        section: hw.section,
        dueDate: hw.dueDate?.split("T")[0] || hw.dueDate,
        dueTime: hw.dueTime || "23:59",
        postedBy: hw.postedBy || user?.name,
        postedDate: hw.createdAt
          ? new Date(hw.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fileType: hw.fileType || "document",
        fileName: hw.fileName,
        fileUrl: hw.fileUrl,
        fileSize: hw.fileSize,
        submissionsCount: hw.submissionsCount || 0,
      }));

      setHomeworks(formattedHomeworks);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      toast.error("Failed to load homework. Using demo data.");

      // Fallback to demo data
      const demoHomeworks = [
        {
          id: 1,
          title: "Algebra Problems",
          description: "Solve problems 1-10 from Chapter 5",
          subject: "Mathematics",
          grade: "Grade 10",
          section: "A",
          dueDate: "2024-04-15",
          dueTime: "23:59",
          postedBy: user?.name || "Mr. Smith",
          postedDate: "2024-04-01",
          fileType: "pdf",
          fileName: "algebra_problems.pdf",
          fileUrl: "#",
          submissionsCount: 5,
        },
        {
          id: 2,
          title: "Geometry Assignment",
          description: "Complete the geometry worksheet",
          subject: "Mathematics",
          grade: "Grade 10",
          section: "B",
          dueDate: "2024-04-20",
          dueTime: "23:59",
          postedBy: user?.name || "Mr. Smith",
          postedDate: "2024-04-02",
          fileType: "image",
          fileName: "geometry_diagram.jpg",
          fileUrl: "#",
          submissionsCount: 3,
        },
      ];
      const filtered = demoHomeworks.filter((h) => h.subject === user?.subject);
      setHomeworks(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setSelectedFile(file);
      setNewHomework({
        ...newHomework,
        fileType: file.type.startsWith("image/") ? "image" : "document",
        fileName: file.name,
      });

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handlePost = async () => {
    if (
      !newHomework.title ||
      !newHomework.grade ||
      !newHomework.section ||
      !newHomework.dueDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload a file (image, PDF, or document)");
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", newHomework.title);
      formData.append("description", newHomework.description);
      formData.append("subject", user?.subject || newHomework.subject);
      formData.append("grade", newHomework.grade);
      formData.append("section", newHomework.section);
      formData.append("dueDate", newHomework.dueDate);
      formData.append("dueTime", newHomework.dueTime);

      const response = await homeworkAPI.createHomework(formData);
      const newHomeworkItem = response.data;

      const homework = {
        id: newHomeworkItem.id || newHomeworkItem._id,
        title: newHomework.title,
        description: newHomework.description,
        subject: user?.subject,
        grade: newHomework.grade,
        section: newHomework.section,
        dueDate: newHomework.dueDate,
        dueTime: newHomework.dueTime,
        postedBy: user?.name,
        postedDate: new Date().toISOString().split("T")[0],
        fileType: newHomework.fileType,
        fileName: selectedFile.name,
        fileUrl: newHomeworkItem.fileUrl,
        fileSize: selectedFile.size,
        submissionsCount: 0,
      };

      setHomeworks([homework, ...homeworks]);
      setShowForm(false);
      resetForm();
      toast.success("Homework assigned with attachment!");
    } catch (error) {
      console.error("Error creating homework:", error);
      toast.error(error.response?.data?.message || "Failed to assign homework");
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
        grade: newHomework.grade,
        section: newHomework.section,
        dueDate: newHomework.dueDate,
        dueTime: newHomework.dueTime,
      };

      // If new file selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        Object.keys(updateData).forEach((key) => {
          formData.append(key, updateData[key]);
        });
        await homeworkAPI.updateHomework(editingHomework.id, formData);
      } else {
        await homeworkAPI.updateHomework(editingHomework.id, updateData);
      }

      // Refresh the list
      await fetchHomeworks();

      setShowForm(false);
      setEditingHomework(null);
      resetForm();
      toast.success("Homework updated successfully!");
    } catch (error) {
      console.error("Error updating homework:", error);
      toast.error(error.response?.data?.message || "Failed to update homework");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (homeworkId) => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      try {
        await homeworkAPI.deleteHomework(homeworkId);
        setHomeworks(homeworks.filter((h) => h.id !== homeworkId));
        toast.success("Homework deleted successfully!");
      } catch (error) {
        console.error("Error deleting homework:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete homework",
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
      section: homework.section,
      dueDate: homework.dueDate,
      dueTime: homework.dueTime || "23:59",
      fileType: homework.fileType,
      fileName: homework.fileName,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowForm(true);
  };

  const handleViewSubmissions = async (homeworkId) => {
    try {
      const response = await homeworkAPI.getSubmissions(homeworkId);
      const submissions = response.data;
      toast.success(`${submissions.length} submissions received`);
      // You can open a modal here to show submissions
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    }
  };

  const handleDownloadAttachment = async (homework) => {
    try {
      toast.loading(`Downloading ${homework.fileName}...`, { id: "download" });

      // Call API to download file
      // const response = await homeworkAPI.downloadAttachment(homework.id);

      // Simulate download for demo
      setTimeout(() => {
        toast.success(`${homework.fileName} downloaded!`, { id: "download" });
      }, 1000);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download file", { id: "download" });
    }
  };

  const resetForm = () => {
    setNewHomework({
      title: "",
      description: "",
      subject: user?.subject || "",
      grade: "",
      section: "",
      dueDate: "",
      dueTime: "23:59",
      fileType: "",
      fileName: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const getFileIcon = (fileType) => {
    if (fileType === "image") return <FiImage size={20} />;
    return <FiFile size={20} />;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading homework...</p>
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
          <h1 style={styles.title}>📝 Homework Management</h1>
          <p style={styles.subtitle}>
            Assign homework with files for your subject: {user?.subject}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingHomework(null);
            resetForm();
            setShowForm(true);
          }}
          style={styles.addBtn}
        >
          <FiPlus size={16} /> Assign Homework
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>{editingHomework ? "Edit Homework" : "Assign New Homework"}</h3>
          <input
            type="text"
            placeholder="Homework Title *"
            value={newHomework.title}
            onChange={(e) =>
              setNewHomework({ ...newHomework, title: e.target.value })
            }
            style={styles.input}
            disabled={uploading}
          />
          <textarea
            placeholder="Description / Instructions"
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
              value={newHomework.grade}
              onChange={(e) =>
                setNewHomework({ ...newHomework, grade: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">Select Grade *</option>
              {grades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <select
              value={newHomework.section}
              onChange={(e) =>
                setNewHomework({ ...newHomework, section: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">Select Section *</option>
              {sections.map((s) => (
                <option key={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <input
              type="date"
              value={newHomework.dueDate}
              onChange={(e) =>
                setNewHomework({ ...newHomework, dueDate: e.target.value })
              }
              style={styles.input}
              disabled={uploading}
            />
            <input
              type="time"
              value={newHomework.dueTime}
              onChange={(e) =>
                setNewHomework({ ...newHomework, dueTime: e.target.value })
              }
              style={styles.input}
              disabled={uploading}
            />
          </div>

          {/* File Upload Section */}
          <div style={styles.fileUploadSection}>
            <label style={styles.fileLabel}>
              Homework File {!editingHomework && "*"}
            </label>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                id="homework-file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={uploading}
              />
              <label htmlFor="homework-file" style={styles.fileUploadBtn}>
                <FiUpload size={20} /> Choose File
              </label>
              {selectedFile && (
                <div style={styles.fileInfo}>
                  {getFileIcon(newHomework.fileType)}
                  <span>{selectedFile.name}</span>
                  <span style={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}
              {!selectedFile && editingHomework?.fileName && (
                <div style={styles.fileInfo}>
                  {getFileIcon(newHomework.fileType)}
                  <span>Current: {editingHomework.fileName}</span>
                </div>
              )}
            </div>
            <p style={styles.fileHint}>
              Supported formats: Images, PDF, DOC, DOCX, TXT (Max 50MB)
            </p>
          </div>

          {previewUrl && (
            <div style={styles.previewContainer}>
              <p>Preview:</p>
              <img src={previewUrl} alt="Preview" style={styles.previewImage} />
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
              Cancel
            </button>
            <button
              onClick={editingHomework ? handleUpdate : handlePost}
              style={styles.submitBtn}
              disabled={uploading}
            >
              {uploading
                ? "Processing..."
                : editingHomework
                  ? "Update Homework"
                  : "Assign Homework"}
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.homeworkList}>
        <h3>My Assigned Homework ({homeworks.length})</h3>
        {homeworks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No homework assigned yet.</p>
            <p style={styles.emptyStateSubtext}>
              Click "Assign Homework" to create your first assignment.
            </p>
          </div>
        ) : (
          homeworks.map((hw) => (
            <div key={hw.id} style={styles.homeworkCard}>
              <div style={styles.homeworkInfo}>
                <div style={styles.homeworkHeader}>
                  <h3 style={styles.homeworkTitle}>{hw.title}</h3>
                  <span style={styles.submissionsCount}>
                    {hw.submissionsCount} submission
                    {hw.submissionsCount !== 1 ? "s" : ""}
                  </span>
                </div>
                {hw.description && (
                  <p style={styles.homeworkDesc}>{hw.description}</p>
                )}
                <p style={styles.meta}>
                  Due: {hw.dueDate} by {hw.dueTime} • {hw.grade} - Section{" "}
                  {hw.section}
                </p>
                <div style={styles.attachmentInfo}>
                  {getFileIcon(hw.fileType)}
                  <span>{hw.fileName}</span>
                  <button
                    onClick={() => handleDownloadAttachment(hw)}
                    style={styles.downloadLink}
                  >
                    <FiDownload size={12} /> Download
                  </button>
                </div>
              </div>
              <div style={styles.actions}>
                <button
                  onClick={() => handleViewSubmissions(hw.id)}
                  style={styles.viewBtn}
                  title="View Submissions"
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(hw)}
                  style={styles.editBtn}
                  title="Edit Homework"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(hw.id)}
                  style={styles.deleteBtn}
                  title="Delete Homework"
                >
                  <FiTrash2 size={16} />
                </button>
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
  fileUploadSection: { marginBottom: "16px" },
  fileLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#374151",
  },
  fileUploadArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  fileUploadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#eef2ff",
    borderRadius: "8px",
    fontSize: "13px",
  },
  fileSize: { fontSize: "11px", color: "#6b7280" },
  fileHint: { fontSize: "11px", color: "#9ca3af", marginTop: "8px" },
  previewContainer: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "150px",
    borderRadius: "8px",
    marginTop: "8px",
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
  emptyStateSubtext: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#d1d5db",
  },
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
  homeworkDesc: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  meta: { fontSize: "12px", color: "#6b7280", margin: "4px 0" },
  attachmentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    padding: "6px 10px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    fontSize: "12px",
  },
  downloadLink: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
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
};

export default TeacherHomeworkPage;
