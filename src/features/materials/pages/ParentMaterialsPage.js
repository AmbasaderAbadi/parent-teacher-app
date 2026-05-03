import React, { useState, useEffect } from "react";
import { FiFile, FiDownload, FiEye } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { materialsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const ParentMaterialsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchMaterials(selectedChild.grade, selectedChild.section);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      // TODO: Replace with actual API endpoint when available
      // const response = await parentAPI.getChildren();
      // setChildren(response.data);

      // Return empty array until endpoint is ready
      setChildren([]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error(t("failed_load_children_data"));
      setLoading(false);
    }
  };

  const fetchMaterials = async (grade, section) => {
    setLoading(true);
    try {
      const response = await materialsAPI.getMaterialsByClass(grade);
      let materialsData = response.data;

      if (section) {
        materialsData = materialsData.filter((m) => m.section === section);
      }

      const formattedMaterials = materialsData.map((material) => ({
        id: material.id || material._id,
        title: material.title,
        subject: material.subject,
        grade: material.grade,
        section: material.section,
        uploadedBy: material.uploadedBy || material.teacherName,
        date: material.createdAt
          ? new Date(material.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fileUrl: material.fileUrl,
        fileName: material.fileName,
        fileType: material.fileType,
        description: material.description,
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error(t("failed_load_materials"));
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      toast.loading(t("downloading", { title: material.title }), {
        id: "download",
      });
      // TODO: Implement actual download endpoint
      toast.success(t("download_success", { title: material.title }), {
        id: "download",
      });
    } catch (error) {
      console.error("Error downloading material:", error);
      toast.error(t("download_failed"), { id: "download" });
    }
  };

  const handleView = (material) => {
    if (material.fileUrl && material.fileUrl !== "#") {
      window.open(material.fileUrl, "_blank");
    } else {
      toast.info(t("preview_not_available"));
    }
  };

  if (loading && !materials.length) {
    return (
      <div style={styles.loading}>
        <div className="loading-spinner"></div>
        <p>{t("loading_materials")}</p>
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
        <h1 style={styles.title}>{t("learning_materials")}</h1>
        <p style={styles.subtitle}>{t("access_child_materials")}</p>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div style={styles.childSelector}>
          <label style={styles.childLabel}>{t("select_child")}:</label>
          <select
            value={selectedChild?.id}
            onChange={(e) => {
              const child = children.find(
                (c) => c.id === parseInt(e.target.value),
              );
              setSelectedChild(child);
            }}
            style={styles.childSelect}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name} - {child.grade} {t("section")} {child.section}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedChild && (
        <div style={styles.childInfo}>
          <p>
            {t("showing_materials_for")} <strong>{selectedChild.name}</strong> (
            {selectedChild.grade} - {t("section")} {selectedChild.section})
          </p>
        </div>
      )}

      <div style={styles.materialsList}>
        {materials.length === 0 ? (
          <div style={styles.emptyState}>
            <p>{t("no_materials_class")}</p>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} style={styles.materialCard}>
              <div style={styles.materialIcon}>
                <FiFile size={24} />
              </div>
              <div style={styles.materialInfo}>
                <h3>{material.title}</h3>
                <p>
                  {material.subject} • {material.grade} - {t("section")}{" "}
                  {material.section}
                </p>
                {material.description && (
                  <p style={styles.materialDescription}>
                    {material.description}
                  </p>
                )}
                <p style={styles.materialMeta}>
                  {t("uploaded_by")} {material.uploadedBy} • {material.date}
                </p>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => handleView(material)}
                  style={styles.viewBtn}
                  title={t("preview")}
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(material)}
                  style={styles.downloadBtn}
                >
                  <FiDownload size={16} /> {t("download")}
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
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 4px",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },
  loading: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  childSelector: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  childLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  childSelect: {
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  childInfo: {
    marginBottom: "20px",
    padding: "8px 12px",
    backgroundColor: "#eef2ff",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#4f46e5",
  },
  materialsList: { display: "flex", flexDirection: "column", gap: "16px" },
  materialCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.2s ease",
  },
  materialIcon: {
    padding: "12px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    color: "#4f46e5",
  },
  materialInfo: { flex: 1 },
  materialDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
  },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#4f46e5",
    transition: "all 0.2s ease",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
};

export default ParentMaterialsPage;
