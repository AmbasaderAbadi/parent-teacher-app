import React, { useState, useEffect } from "react";
import { FiFile, FiDownload, FiEye } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { materialsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const StudentMaterialsPage = () => {
  const { t } = useTranslation();
  const { user: storeUser } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let userData = storeUser;
    if (storedUser && !userData) {
      try {
        userData = JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    if (userData) {
      setStudentInfo({
        grade: userData.grade,
        section: userData.className || userData.section,
        studentId: userData.studentId || userData.id,
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
      });
    }
  }, [storeUser]);

  useEffect(() => {
    if (studentInfo) {
      fetchMaterials();
    }
  }, [studentInfo]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await materialsAPI.getAllMaterials();
      let allMaterials = response.data?.data || response.data || [];
      if (!Array.isArray(allMaterials)) allMaterials = [];

      const filtered = allMaterials.filter((material) => {
        if (material.grade !== studentInfo.grade) return false;
        const materialSection = material.section || material.className;
        if (materialSection && materialSection !== studentInfo.section)
          return false;
        return true;
      });

      const formatted = filtered.map((material) => {
        let uploadedBy = t("unknown");
        if (material.uploadedBy) {
          if (typeof material.uploadedBy === "string") {
            uploadedBy = material.uploadedBy;
          } else if (material.uploadedBy.firstName) {
            uploadedBy =
              `${material.uploadedBy.firstName} ${material.uploadedBy.lastName || ""}`.trim();
          } else if (material.uploadedBy.name) {
            uploadedBy = material.uploadedBy.name;
          } else {
            uploadedBy = material.teacherName || t("unknown");
          }
        } else if (material.teacherName) {
          uploadedBy = material.teacherName;
        }

        return {
          id: material.id || material._id,
          title: material.title,
          subject: material.subject,
          grade: material.grade,
          section: material.section || material.className,
          uploadedBy,
          date: material.createdAt
            ? new Date(material.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          fileUrl: material.fileUrl,
          fileName: material.fileName,
          fileType: material.fileType,
          description: material.description,
        };
      });

      setMaterials(formatted);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error(t("material_upload_failed"));
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (material) => {
    if (material.fileUrl) {
      window.open(material.fileUrl, "_blank");
      toast.success(`${t("opening")} ${material.title}`);
    } else {
      toast.error(t("no_file_url"));
    }
  };

  const handleView = (material) => {
    if (material.fileUrl && material.fileUrl !== "#") {
      window.open(material.fileUrl, "_blank");
    } else {
      toast.info(t("preview_not_available"));
    }
  };

  if (loading) {
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
        <h1 style={styles.title}>{t("study_materials")}</h1>
        <p style={styles.subtitle}>{t("access_learning_resources")}</p>
      </div>

      {studentInfo && (
        <div style={styles.studentInfo}>
          <p>
            {t("welcome_student_materials", {
              name: studentInfo.name,
              grade: studentInfo.grade,
              section: studentInfo.section,
            })}
          </p>
        </div>
      )}

      <div style={styles.materialsList}>
        {materials.length === 0 ? (
          <div style={styles.emptyState}>
            <p>{t("no_materials_class")}</p>
            <p style={styles.emptyStateSubtext}>{t("check_back_later")}</p>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} style={styles.materialCard}>
              <div style={styles.materialIcon}>
                <FiFile size={24} />
              </div>
              <div style={styles.materialInfo}>
                <h3>{material.title}</h3>
                <p>{material.subject}</p>
                {material.description && (
                  <p style={styles.materialDescription}>
                    {material.description}
                  </p>
                )}
                <p style={styles.materialMeta}>
                  {t("uploaded_by")} {material.uploadedBy} • {material.date}
                </p>
                {material.grade && (
                  <p style={styles.materialClass}>
                    {t("class")}: {material.grade}{" "}
                    {material.section &&
                      `- ${t("section")} ${material.section}`}
                  </p>
                )}
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
  studentInfo: {
    marginBottom: "20px",
    padding: "12px 16px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
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
  materialDescription: { fontSize: "13px", color: "#6b7280", marginTop: "4px" },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  materialClass: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "2px",
    fontStyle: "italic",
  },
  buttonGroup: { display: "flex", gap: "8px", alignItems: "center" },
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
  emptyStateSubtext: { fontSize: "12px", marginTop: "8px", color: "#d1d5db" },
};

export default StudentMaterialsPage;
