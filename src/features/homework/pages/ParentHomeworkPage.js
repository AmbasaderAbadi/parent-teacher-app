import React, { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";

const ParentHomeworkPage = () => {
  const [homeworks, setHomeworks] = useState([]);

  useEffect(() => {
    const demoHomeworks = [
      {
        id: 1,
        title: "Algebra Problems",
        subject: "Mathematics",
        description: "Solve problems 1-10",
        dueDate: "2024-04-15",
        child: "John Doe",
      },
      {
        id: 2,
        title: "Physics Assignment",
        subject: "Physics",
        description: "Complete lab report",
        dueDate: "2024-04-20",
        child: "Emma Doe",
      },
    ];
    setHomeworks(demoHomeworks);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📝 Homework</h1>
        <p style={styles.subtitle}>Track your children's assignments</p>
      </div>

      <div style={styles.homeworkList}>
        {homeworks.map((hw) => (
          <div key={hw.id} style={styles.homeworkCard}>
            <div>
              <h3>{hw.title}</h3>
              <p style={styles.child}>{hw.child}</p>
              <p>{hw.subject}</p>
              <p>{hw.description}</p>
              <p style={styles.meta}>
                <FiClock size={12} /> Due: {hw.dueDate}
              </p>
            </div>
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
  homeworkList: { display: "flex", flexDirection: "column", gap: "16px" },
  homeworkCard: {
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  child: { fontSize: "12px", color: "#4f46e5", marginTop: "4px" },
  meta: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default ParentHomeworkPage;
