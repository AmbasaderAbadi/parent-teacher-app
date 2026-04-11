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
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const TeacherHomeworkPage = () => {
  const { user } = useAuthStore();
  const [homeworks, setHomeworks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    subject: user?.subject || "",
    grade: "",
    section: "",
    dueDate: "",
    fileType: "",
    fileName: "",
  });

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    const demoHomeworks = [
      {
        id: 1,
        title: "Algebra Problems",
        subject: "Mathematics",
        grade: "Grade 10",
        section: "A",
        dueDate: "2024-04-15",
        postedBy: "Mr. Smith",
        postedDate: "2024-04-01",
        fileType: "pdf",
        fileName: "algebra_problems.pdf",
        fileUrl: "#",
      },
      {
        id: 2,
        title: "Geometry Assignment",
        subject: "Mathematics",
        grade: "Grade 10",
        section: "B",
        dueDate: "2024-04-20",
        postedBy: "Mr. Smith",
        postedDate: "2024-04-02",
        fileType: "image",
        fileName: "geometry_diagram.jpg",
        fileUrl: "#",
      },
    ];
    const filtered = demoHomeworks.filter((h) => h.subject === user?.subject);
    setHomeworks(filtered);
  }, [user?.subject]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handlePost = () => {
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

    const homework = {
      id: Date.now(),
      ...newHomework,
      subject: user?.subject,
      postedBy: user?.name,
      postedDate: new Date().toISOString().split("T")[0],
      fileUrl: previewUrl || "#",
      fileSize: selectedFile.size,
    };
    setHomeworks([homework, ...homeworks]);
    setShowForm(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setNewHomework({
      title: "",
      description: "",
      subject: user?.subject,
      grade: "",
      section: "",
      dueDate: "",
      fileType: "",
      fileName: "",
    });
    toast.success("Homework assigned with attachment!");
  };

  const getFileIcon = (fileType) => {
    if (fileType === "image") return <FiImage size={20} />;
    return <FiFile size={20} />;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📝 Homework Management</h1>
          <p style={styles.subtitle}>
            Assign homework with files for your subject: {user?.subject}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
          <FiPlus size={16} /> Assign Homework
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>Assign New Homework</h3>
          <input
            type="text"
            placeholder="Homework Title *"
            value={newHomework.title}
            onChange={(e) =>
              setNewHomework({ ...newHomework, title: e.target.value })
            }
            style={styles.input}
          />
          <textarea
            placeholder="Description / Instructions"
            rows={3}
            value={newHomework.description}
            onChange={(e) =>
              setNewHomework({ ...newHomework, description: e.target.value })
            }
            style={styles.textarea}
          />

          <div style={styles.row}>
            <select
              value={newHomework.grade}
              onChange={(e) =>
                setNewHomework({ ...newHomework, grade: e.target.value })
              }
              style={styles.select}
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
            >
              <option value="">Select Section *</option>
              {sections.map((s) => (
                <option key={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <input
            type="date"
            value={newHomework.dueDate}
            onChange={(e) =>
              setNewHomework({ ...newHomework, dueDate: e.target.value })
            }
            style={styles.input}
          />

          {/* File Upload Section */}
          <div style={styles.fileUploadSection}>
            <label style={styles.fileLabel}>Homework File *</label>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                id="homework-file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
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
            </div>
            <p style={styles.fileHint}>
              Supported formats: Images (JPG, PNG), PDF, DOC, DOCX, TXT
            </p>
          </div>

          {previewUrl && (
            <div style={styles.previewContainer}>
              <p>Preview:</p>
              <img src={previewUrl} alt="Preview" style={styles.previewImage} />
            </div>
          )}

          <div style={styles.formActions}>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>
              Cancel
            </button>
            <button onClick={handlePost} style={styles.submitBtn}>
              Assign Homework
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.homeworkList}>
        <h3>My Assigned Homework</h3>
        {homeworks.map((hw) => (
          <div key={hw.id} style={styles.homeworkCard}>
            <div style={styles.homeworkInfo}>
              <h3>{hw.title}</h3>
              <p>{hw.description}</p>
              <p style={styles.meta}>
                Due: {hw.dueDate} • {hw.grade} - Section {hw.section}
              </p>
              <div style={styles.attachmentInfo}>
                {getFileIcon(hw.fileType)}
                <span>{hw.fileName}</span>
                <button style={styles.downloadLink}>Download</button>
              </div>
            </div>
            <div style={styles.actions}>
              <button style={styles.viewBtn}>
                <FiEye size={16} />
              </button>
              <button style={styles.editBtn}>
                <FiEdit2 size={16} />
              </button>
              <button style={styles.deleteBtn}>
                <FiTrash2 size={16} />
              </button>
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
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#eef2ff",
    borderRadius: "8px",
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
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  homeworkList: { marginTop: "24px" },
  homeworkCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
  },
  homeworkInfo: { flex: 1 },
  meta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
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
  },
  actions: { display: "flex", gap: "8px" },
  viewBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
  },
  editBtn: {
    padding: "6px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
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

export default TeacherHomeworkPage;
