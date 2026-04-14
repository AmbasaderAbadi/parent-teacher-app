import React, { useState, useEffect } from "react";
import { FiFile, FiDownload, FiEye } from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { materialsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const StudentMaterialsPage = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  useEffect(() => {
    if (studentInfo) {
      fetchMaterials();
    }
  }, [studentInfo]);

  const fetchStudentInfo = async () => {
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setStudentInfo({
          grade: userData.grade,
          section: userData.className || userData.section,
          studentId: userData.studentId || userData.id,
          name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        });
      } else {
        // Fallback to demo info
        setStudentInfo({
          grade: "Grade 10",
          section: "A",
          studentId: "STU001",
          name: "Student",
        });
      }
    } catch (error) {
      console.error("Error fetching student info:", error);
      setStudentInfo({
        grade: "Grade 10",
        section: "A",
        studentId: "STU001",
        name: "Student",
      });
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Fetch materials by student's grade/class
      const response = await materialsAPI.getMaterialsByClass(
        studentInfo.grade,
      );
      let materialsData = response.data;

      // Filter by section if the API supports it
      if (studentInfo.section && materialsData.length > 0) {
        materialsData = materialsData.filter(
          (m) => !m.section || m.section === studentInfo.section,
        );
      }

      // Transform API data to match component structure
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
      toast.error("Failed to load materials. Using demo data.");

      // Fallback to demo data based on student's grade
      const demoMaterials = [
        {
          id: 1,
          title: "Algebra Worksheet",
          subject: "Mathematics",
          grade: studentInfo?.grade || "Grade 10",
          section: studentInfo?.section || "A",
          uploadedBy: "Mr. Smith",
          date: "2024-04-01",
          fileUrl: "#",
          fileName: "algebra_worksheet.pdf",
          description: "Practice problems for algebra chapter 1-5",
        },
        {
          id: 2,
          title: "Physics Lab Manual",
          subject: "Physics",
          grade: studentInfo?.grade || "Grade 10",
          section: studentInfo?.section || "A",
          uploadedBy: "Dr. Wilson",
          date: "2024-04-02",
          fileUrl: "#",
          fileName: "physics_lab.pdf",
          description: "Lab experiments for the semester",
        },
        {
          id: 3,
          title: "English Literature Guide",
          subject: "English",
          grade: studentInfo?.grade || "Grade 10",
          section: studentInfo?.section || "A",
          uploadedBy: "Ms. Davis",
          date: "2024-03-28",
          fileUrl: "#",
          fileName: "english_guide.pdf",
          description: "Study guide for upcoming exams",
        },
      ];
      setMaterials(demoMaterials);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      toast.loading(`Downloading ${material.title}...`, { id: "download" });

      // Call API to download material
      // const response = await materialsAPI.downloadMaterial(material.id);

      // For actual file download, you would do:
      // const blob = new Blob([response.data], { type: 'application/octet-stream' });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', material.fileName || `${material.title}.pdf`);
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

  if (loading) {
    return (
      <div style={styles.loading}>
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
        <h1 style={styles.title}>📁 Study Materials</h1>
        <p style={styles.subtitle}>Access your learning resources</p>
      </div>

      {/* Student Info Banner */}
      {studentInfo && (
        <div style={styles.studentInfo}>
          <p>
            Welcome, <strong>{studentInfo.name}</strong>! Here are materials for
            <strong> {studentInfo.grade}</strong> - Section{" "}
            <strong>{studentInfo.section}</strong>
          </p>
        </div>
      )}

      <div style={styles.materialsList}>
        {materials.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No materials available for your class yet.</p>
            <p style={styles.emptyStateSubtext}>
              Check back later for new learning resources.
            </p>
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
                  Uploaded by: {material.uploadedBy} • {material.date}
                </p>
                {material.grade && (
                  <p style={styles.materialClass}>
                    Class: {material.grade}{" "}
                    {material.section && `- Section ${material.section}`}
                  </p>
                )}
              </div>
              <div style={styles.buttonGroup}>
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
                >
                  <FiDownload size={16} /> Download
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
  materialDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
  },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  materialClass: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "2px",
    fontStyle: "italic",
  },
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
  emptyStateSubtext: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#d1d5db",
  },
};

export default StudentMaterialsPage;
