import React, { useState, useEffect } from "react";
import { FiFile, FiDownload } from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const ParentMaterialsPage = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo data - In real app, fetch from API
    setTimeout(() => {
      const demoMaterials = [
        {
          id: 1,
          title: "Algebra Worksheet",
          subject: "Mathematics",
          grade: "Grade 10",
          section: "A",
          uploadedBy: "Mr. Smith",
          date: "2024-04-01",
        },
        {
          id: 2,
          title: "Physics Lab Manual",
          subject: "Physics",
          grade: "Grade 11",
          section: "B",
          uploadedBy: "Dr. Wilson",
          date: "2024-04-02",
        },
      ];
      setMaterials(demoMaterials);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading materials...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📁 Learning Materials</h1>
        <p style={styles.subtitle}>Access study materials for your children</p>
      </div>

      <div style={styles.materialsList}>
        {materials.map((material) => (
          <div key={material.id} style={styles.materialCard}>
            <div style={styles.materialIcon}>
              <FiFile size={24} />
            </div>
            <div style={styles.materialInfo}>
              <h3>{material.title}</h3>
              <p>
                {material.subject} • {material.grade} - Section{" "}
                {material.section}
              </p>
              <p style={styles.materialMeta}>
                Uploaded by: {material.uploadedBy} • {material.date}
              </p>
            </div>
            <button style={styles.downloadBtn}>
              <FiDownload size={16} /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#1f2937" },
  subtitle: { fontSize: "14px", color: "#6b7280", marginTop: "4px" },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
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
  },
  materialIcon: {
    padding: "12px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
  },
  materialInfo: { flex: 1 },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default ParentMaterialsPage;
