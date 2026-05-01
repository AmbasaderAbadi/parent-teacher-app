import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiFile,
  FiTrash2,
  FiDownload,
  FiEye,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { materialsAPI, apiClient } from "../../../services/api";
import toast from "react-hot-toast";

const TeacherMaterialsPage = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    subject: user?.subject || "",
    grade: "",
    className: "",
    tags: [],
    accessLevel: "students",
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState("");

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const classNames = ["A", "B", "C", "D"];
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
  ];
  const accessLevels = ["students", "teachers", "parents", "all"];

  useEffect(() => {
    fetchMaterials();
  }, [user?.subject]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await materialsAPI.getMyMaterials();
      let materialsData = [];
      if (Array.isArray(response.data)) materialsData = response.data;
      else if (response.data?.data && Array.isArray(response.data.data))
        materialsData = response.data.data;
      else if (
        response.data?.materials &&
        Array.isArray(response.data.materials)
      )
        materialsData = response.data.materials;

      if (user?.subject) {
        materialsData = materialsData.filter((m) => m.subject === user.subject);
      }

      const formattedMaterials = materialsData.map((material) => ({
        id: material.id || material._id,
        title: material.title,
        description: material.description || "",
        subject: material.subject,
        grade: material.grade,
        className: material.className,
        tags: material.tags || [],
        accessLevel: material.accessLevel || "students",
        isFeatured: material.isFeatured || false,
        fileUrl: material.fileUrl,
        uploadedBy: material.uploadedBy || user?.name,
        date: material.createdAt
          ? new Date(material.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newMaterial.tags.includes(tagInput.trim())) {
      setNewMaterial({
        ...newMaterial,
        tags: [...newMaterial.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewMaterial({
      ...newMaterial,
      tags: newMaterial.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleUpload = async () => {
    if (
      !newMaterial.title ||
      !newMaterial.subject ||
      !newMaterial.grade ||
      !newMaterial.className
    ) {
      toast.error(
        "Please fill all required fields: Title, Subject, Grade, Class",
      );
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", newMaterial.title);
    formData.append("description", newMaterial.description || "");
    formData.append("subject", newMaterial.subject);
    formData.append("grade", newMaterial.grade);
    formData.append("className", newMaterial.className);
    formData.append("tags", JSON.stringify(newMaterial.tags));
    formData.append("accessLevel", newMaterial.accessLevel);
    formData.append("isFeatured", newMaterial.isFeatured ? "true" : "false");

    try {
      const response = await apiClient.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percent);
        },
      });
      const uploadedMaterial = response.data?.data || response.data;

      const material = {
        id: uploadedMaterial.id || uploadedMaterial._id,
        title: newMaterial.title,
        description: newMaterial.description,
        subject: newMaterial.subject,
        grade: newMaterial.grade,
        className: newMaterial.className,
        tags: newMaterial.tags,
        accessLevel: newMaterial.accessLevel,
        isFeatured: newMaterial.isFeatured,
        fileUrl: uploadedMaterial.fileUrl,
        uploadedBy: user?.name,
        date: new Date().toISOString().split("T")[0],
      };

      setMaterials([material, ...materials]);
      setShowUploadForm(false);
      resetForm();
      toast.success("Material uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to upload material");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (materialId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await materialsAPI.deleteMaterial(materialId);
        setMaterials(materials.filter((m) => m.id !== materialId));
        toast.success("Material deleted successfully!");
      } catch (error) {
        console.error("Error deleting material:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete material",
        );
      }
    }
  };

  const handleDownload = (material) => {
    if (material.fileUrl) {
      window.open(material.fileUrl, "_blank");
      toast.success(`Opening ${material.title}`);
      materialsAPI.trackDownload(material.id).catch(() => {});
    } else {
      toast.error("No file URL available");
    }
  };

  const handleView = (material) => {
    if (material.fileUrl) {
      window.open(material.fileUrl, "_blank");
      materialsAPI.trackView(material.id).catch(() => {});
    } else {
      toast.info("No preview available");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setNewMaterial({
      title: "",
      description: "",
      subject: user?.subject || "",
      grade: "",
      className: "",
      tags: [],
      accessLevel: "students",
      isFeatured: false,
    });
    setTagInput("");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading materials...</p>
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
          <h1 style={styles.title}>📁 Teaching Materials</h1>
          <p style={styles.subtitle}>
            Upload learning resources for your classes
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
            disabled={uploading}
          />
          <textarea
            placeholder="Description (optional)"
            rows={3}
            value={newMaterial.description}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, description: e.target.value })
            }
            style={styles.textarea}
            disabled={uploading}
          />

          <div style={styles.row}>
            <select
              value={newMaterial.subject}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, subject: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">Select Subject *</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={newMaterial.grade}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, grade: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">Select Grade *</option>
              {grades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <select
              value={newMaterial.className}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, className: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              <option value="">Select Class *</option>
              {classNames.map((c) => (
                <option key={c} value={c}>
                  Section {c}
                </option>
              ))}
            </select>
            <select
              value={newMaterial.accessLevel}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, accessLevel: e.target.value })
              }
              style={styles.select}
              disabled={uploading}
            >
              {accessLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.tagsSection}>
            <label style={styles.label}>Tags (optional)</label>
            <div style={styles.tagInputGroup}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag (e.g., algebra)"
                style={styles.tagInput}
                disabled={uploading}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={styles.addTagBtn}
              >
                <FiPlus size={14} /> Add
              </button>
            </div>
            <div style={styles.tagsList}>
              {newMaterial.tags.map((tag) => (
                <span key={tag} style={styles.tag}>
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={styles.removeTagBtn}
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newMaterial.isFeatured}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    isFeatured: e.target.checked,
                  })
                }
                disabled={uploading}
              />
              Feature this material (show on homepage)
            </label>
          </div>

          <div style={styles.fileUploadSection}>
            <label style={styles.fileLabel}>File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.ppt,.pptx,.doc,.docx,.txt"
              style={styles.fileInput}
            />
            {selectedFile && (
              <div style={styles.fileInfo}>
                <FiFile size={14} />
                <span>{selectedFile.name}</span>
                <span style={styles.fileSize}>
                  {" "}
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
          </div>

          {uploading && uploadProgress > 0 && (
            <div style={styles.progressBar}>
              <div
                style={{ ...styles.progressFill, width: `${uploadProgress}%` }}
              ></div>
              <span style={styles.progressText}>{uploadProgress}%</span>
            </div>
          )}

          <div style={styles.formActions}>
            <button
              onClick={() => {
                setShowUploadForm(false);
                resetForm();
              }}
              style={styles.cancelBtn}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              style={styles.submitBtn}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.materialsList}>
        <h3>My Materials ({materials.length})</h3>
        {materials.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No materials uploaded yet.</p>
            <p style={styles.emptyStateSubtext}>
              Click "Upload Material" to share a file.
            </p>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} style={styles.materialCard}>
              <div style={styles.materialIcon}>
                <FiFile size={20} />
              </div>
              <div style={styles.materialInfo}>
                <h3>{material.title}</h3>
                {material.description && <p>{material.description}</p>}
                <p style={styles.materialMeta}>
                  {material.subject} • {material.grade} • {material.className}
                  {material.tags.length > 0 &&
                    ` • Tags: ${material.tags.join(", ")}`}
                  {material.isFeatured && (
                    <span style={styles.featuredBadge}> ⭐ Featured</span>
                  )}
                </p>
                <div style={styles.fileInfoDisplay}>{material.fileUrl}</div>
              </div>
              <div style={styles.materialActions}>
                <button
                  onClick={() => handleView(material)}
                  style={styles.viewBtn}
                  title="Open"
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(material)}
                  style={styles.downloadBtn}
                  title="Download"
                >
                  <FiDownload size={16} />
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  style={styles.deleteBtn}
                  title="Delete"
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
  tagsSection: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#374151",
  },
  tagInputGroup: { display: "flex", gap: "8px", marginBottom: "8px" },
  tagInput: {
    flex: 1,
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  addTagBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 12px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tagsList: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    backgroundColor: "#eef2ff",
    borderRadius: "16px",
    fontSize: "12px",
  },
  removeTagBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    padding: "0 2px",
  },
  checkboxGroup: { marginBottom: "16px" },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  fileUploadSection: { marginBottom: "16px" },
  fileLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  fileInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
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
  progressBar: {
    position: "relative",
    height: "24px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "12px",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4f46e5",
    transition: "width 0.3s ease",
  },
  progressText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#1f2937",
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
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptyStateSubtext: { fontSize: "12px", marginTop: "8px", color: "#d1d5db" },
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
    color: "#4f46e5",
  },
  materialInfo: { flex: 1 },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  featuredBadge: { color: "#f59e0b", fontWeight: "bold" },
  fileInfoDisplay: {
    marginTop: "8px",
    fontSize: "11px",
    color: "#9ca3af",
    wordBreak: "break-all",
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
  downloadBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#10b981",
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
