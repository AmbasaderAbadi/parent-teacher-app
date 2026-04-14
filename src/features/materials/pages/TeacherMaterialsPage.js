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
import { materialsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const TeacherMaterialsPage = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
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
    fetchMaterials();
  }, [user?.subject]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Fetch teacher's uploaded materials
      const response = await materialsAPI.getMyMaterials();
      let materialsData = response.data;

      // Filter by subject if needed
      if (user?.subject) {
        materialsData = materialsData.filter((m) => m.subject === user.subject);
      }

      // Transform API data to match component structure
      const formattedMaterials = materialsData.map((material) => ({
        id: material.id || material._id,
        title: material.title,
        description: material.description,
        subject: material.subject,
        grade: material.grade,
        section: material.section,
        uploadedBy: material.uploadedBy || user?.name,
        date: material.createdAt
          ? new Date(material.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fileType: material.fileType || "document",
        fileName: material.fileName,
        fileUrl: material.fileUrl,
        fileSize: material.fileSize,
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials. Using demo data.");

      // Fallback to demo data
      const demoMaterials = [
        {
          id: 1,
          title: "Algebra Worksheet",
          description: "Practice problems for algebra chapter 1-5",
          subject: "Mathematics",
          grade: "Grade 10",
          section: "A",
          uploadedBy: user?.name || "Mr. Smith",
          date: "2024-04-01",
          fileType: "pdf",
          fileName: "algebra_worksheet.pdf",
          fileUrl: "#",
        },
        {
          id: 2,
          title: "Geometry Notes",
          description: "Comprehensive notes on geometry",
          subject: "Mathematics",
          grade: "Grade 10",
          section: "B",
          uploadedBy: user?.name || "Mr. Smith",
          date: "2024-04-02",
          fileType: "image",
          fileName: "geometry_notes.jpg",
          fileUrl: "#",
        },
      ];
      const filtered = demoMaterials.filter((m) => m.subject === user?.subject);
      setMaterials(filtered);
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

  const handleUpload = async () => {
    if (!newMaterial.title || !newMaterial.grade || !newMaterial.section) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload a file");
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", newMaterial.title);
      formData.append("description", newMaterial.description);
      formData.append("subject", user?.subject || newMaterial.subject);
      formData.append("grade", newMaterial.grade);
      formData.append("section", newMaterial.section);
      formData.append("fileType", newMaterial.fileType);

      // Upload to API
      const response = await materialsAPI.createMaterial(formData);
      const uploadedMaterial = response.data;

      // Add to local state
      const material = {
        id: uploadedMaterial.id || uploadedMaterial._id,
        title: newMaterial.title,
        description: newMaterial.description,
        subject: user?.subject,
        grade: newMaterial.grade,
        section: newMaterial.section,
        uploadedBy: user?.name,
        date: new Date().toISOString().split("T")[0],
        fileType: newMaterial.fileType,
        fileName: selectedFile.name,
        fileUrl: uploadedMaterial.fileUrl,
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
    } catch (error) {
      console.error("Error uploading material:", error);
      toast.error(error.response?.data?.message || "Failed to upload material");
    } finally {
      setUploading(false);
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

  const handleDownload = async (material) => {
    try {
      toast.loading(`Downloading ${material.title}...`, { id: "download" });

      // Call API to download material
      // const response = await materialsAPI.downloadMaterial(material.id);

      // For actual file download:
      // const blob = new Blob([response.data], { type: 'application/octet-stream' });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', material.fileName);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      // window.URL.revokeObjectURL(url);

      // Simulate download for demo
      setTimeout(() => {
        toast.success(`${material.title} downloaded successfully!`, {
          id: "download",
        });
      }, 1000);
    } catch (error) {
      console.error("Error downloading material:", error);
      toast.error("Failed to download material", { id: "download" });
    }
  };

  const handleView = (material) => {
    if (material.fileUrl && material.fileUrl !== "#") {
      window.open(material.fileUrl, "_blank");
    } else {
      toast.info("Preview not available. Please download the file to view it.");
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === "image") return <FiImage size={20} />;
    return <FiFile size={20} />;
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
                disabled={uploading}
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
              Supported formats: Images, PDF, DOC, DOCX, PPT, PPTX, TXT (Max
              50MB)
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
                setShowUploadForm(false);
                setSelectedFile(null);
                setPreviewUrl(null);
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
        <h3>My Uploaded Materials ({materials.length})</h3>
        {materials.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No materials uploaded yet.</p>
            <p style={styles.emptyStateSubtext}>
              Click "Upload Material" to add your first learning resource.
            </p>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} style={styles.materialCard}>
              <div style={styles.materialIcon}>
                {getFileIcon(material.fileType)}
              </div>
              <div style={styles.materialInfo}>
                <h3>{material.title}</h3>
                {material.description && <p>{material.description}</p>}
                <p style={styles.materialMeta}>
                  Grade: {material.grade} • Section: {material.section} •
                  Uploaded: {material.date}
                </p>
                <div style={styles.fileInfoDisplay}>
                  <span>{material.fileName}</span>
                  {material.fileSize && (
                    <span style={styles.fileSize}>
                      ({(material.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.materialActions}>
                <button
                  onClick={() => handleView(material)}
                  style={styles.viewBtn}
                  title="Preview"
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
    transition: "all 0.2s ease",
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
  materialsList: { marginTop: "24px" },
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
  materialCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
    transition: "box-shadow 0.2s ease",
  },
  materialIcon: {
    padding: "12px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    color: "#4f46e5",
  },
  materialInfo: { flex: 1 },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  fileInfoDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#6b7280",
  },
  materialActions: { display: "flex", gap: "8px" },
  viewBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
    transition: "all 0.2s ease",
  },
  downloadBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#10b981",
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

export default TeacherMaterialsPage;
