import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiFile,
  FiTrash2,
  FiDownload,
  FiPlus,
  FiEye,
  FiImage,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const TeacherMaterialsPage = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    subject: user?.subject || "",
    grade: "",
    section: "",
    fileType: "",
    fileName: "",
  });

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    const demoMaterials = [
      {
        id: 1,
        title: "Algebra Worksheet",
        subject: "Mathematics",
        grade: "Grade 10",
        section: "A",
        uploadedBy: "Mr. Smith",
        date: "2024-04-01",
        fileType: "pdf",
        fileName: "algebra_worksheet.pdf",
      },
      {
        id: 2,
        title: "Geometry Notes",
        subject: "Mathematics",
        grade: "Grade 10",
        section: "B",
        uploadedBy: "Mr. Smith",
        date: "2024-04-02",
        fileType: "image",
        fileName: "geometry_notes.jpg",
      },
    ];
    const filtered = demoMaterials.filter((m) => m.subject === user?.subject);
    setMaterials(filtered);
  }, [user?.subject]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewMaterial({
        ...newMaterial,
        fileType: file.type.startsWith("image/") ? "image" : "document",
        fileName: file.name,
      });

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

  const handleUpload = () => {
    if (!newMaterial.title || !newMaterial.grade || !newMaterial.section) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload a file");
      return;
    }

    const material = {
      id: Date.now(),
      ...newMaterial,
      subject: user?.subject,
      uploadedBy: user?.name,
      date: new Date().toISOString().split("T")[0],
      fileUrl: previewUrl || "#",
      fileSize: selectedFile.size,
    };
    setMaterials([material, ...materials]);
    setShowUploadForm(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setNewMaterial({
      title: "",
      description: "",
      subject: user?.subject,
      grade: "",
      section: "",
      fileType: "",
      fileName: "",
    });
    toast.success("Material uploaded successfully!");
  };

  const getFileIcon = (fileType) => {
    if (fileType === "image") return <FiImage size={20} />;
    return <FiFile size={20} />;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📁 Teaching Materials</h1>
          <p style={styles.subtitle}>
            Upload learning materials for your subject: {user?.subject}
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          style={styles.uploadBtn}
        >
          <FiUpload size={16} /> Upload Material
        </button>
      </div>

      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>Upload New Material</h3>
          <input
            type="text"
            placeholder="Title *"
            value={newMaterial.title}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, title: e.target.value })
            }
            style={styles.input}
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={newMaterial.description}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, description: e.target.value })
            }
            style={styles.textarea}
          />

          <div style={styles.row}>
            <select
              value={newMaterial.grade}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, grade: e.target.value })
              }
              style={styles.select}
            >
              <option value="">Select Grade *</option>
              {grades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <select
              value={newMaterial.section}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, section: e.target.value })
              }
              style={styles.select}
            >
              <option value="">Select Section *</option>
              {sections.map((s) => (
                <option key={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div style={styles.fileUploadSection}>
            <label style={styles.fileLabel}>Material File *</label>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                id="material-file"
                accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="material-file" style={styles.fileUploadBtn}>
                <FiUpload size={20} /> Choose File
              </label>
              {selectedFile && (
                <div style={styles.fileInfo}>
                  {getFileIcon(newMaterial.fileType)}
                  <span>{selectedFile.name}</span>
                  <span style={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}
            </div>
            <p style={styles.fileHint}>
              Supported formats: Images, PDF, DOC, DOCX, PPT, PPTX, TXT
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
              onClick={() => setShowUploadForm(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button onClick={handleUpload} style={styles.submitBtn}>
              Upload
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.materialsList}>
        <h3>My Uploaded Materials</h3>
        {materials.map((material) => (
          <div key={material.id} style={styles.materialCard}>
            <div style={styles.materialIcon}>
              {getFileIcon(material.fileType)}
            </div>
            <div style={styles.materialInfo}>
              <h3>{material.title}</h3>
              <p>{material.description}</p>
              <p style={styles.materialMeta}>
                Grade: {material.grade} • Section: {material.section} •
                Uploaded: {material.date}
              </p>
              <div style={styles.fileInfo}>
                <span>{material.fileName}</span>
                <button style={styles.downloadLink}>Download</button>
              </div>
            </div>
            <div style={styles.materialActions}>
              <button style={styles.viewBtn}>
                <FiEye size={16} />
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
  uploadBtn: {
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
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    backgroundColor: "#eef2ff",
    borderRadius: "8px",
    fontSize: "12px",
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
  materialsList: { marginTop: "24px" },
  materialCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
  },
  materialIcon: {
    padding: "12px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
  },
  materialInfo: { flex: 1 },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  downloadLink: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "8px",
  },
  materialActions: { display: "flex", gap: "8px" },
  viewBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
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

export default TeacherMaterialsPage;
