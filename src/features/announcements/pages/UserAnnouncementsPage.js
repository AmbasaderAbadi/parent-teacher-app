import React, { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";

const UserAnnouncementsPage = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo announcements with target audience
    const allAnnouncements = [
      {
        id: 1,
        title: "School Holiday",
        content: "School closed on Friday",
        targetType: "all",
        date: "2024-04-01",
        postedBy: "Admin",
      },
      {
        id: 2,
        title: "Teacher Meeting",
        content: "All teachers attend meeting",
        targetType: "role",
        targetRole: "teacher",
        date: "2024-04-02",
        postedBy: "Admin",
      },
      {
        id: 3,
        title: "Parent-Teacher Meeting",
        content: "Meeting for parents only",
        targetType: "role",
        targetRole: "parent",
        date: "2024-04-03",
        postedBy: "Admin",
      },
      {
        id: 4,
        title: "Grade 10 Exam",
        content: "Exams start next week",
        targetType: "grade",
        targetGrade: "Grade 10",
        date: "2024-04-04",
        postedBy: "Admin",
      },
      {
        id: 5,
        title: "Section A Field Trip",
        content: "Field trip for Section A",
        targetType: "section",
        targetGrade: "Grade 10",
        targetSection: "A",
        date: "2024-04-05",
        postedBy: "Admin",
      },
    ];

    // Filter announcements based on user's role and class
    const filtered = allAnnouncements.filter((ann) => {
      if (ann.targetType === "all") return true;
      if (ann.targetType === "role" && ann.targetRole === user?.role)
        return true;
      if (ann.targetType === "grade" && ann.targetGrade === user?.grade)
        return true;
      if (
        ann.targetType === "section" &&
        ann.targetGrade === user?.grade &&
        ann.targetSection === user?.class
      )
        return true;
      return false;
    });

    setAnnouncements(filtered);
    setLoading(false);
  }, [user]);

  if (loading) {
    return <div style={styles.loading}>Loading announcements...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📢 Announcements</h1>
        <p style={styles.subtitle}>Stay updated with important news</p>
      </div>

      {announcements.length === 0 ? (
        <div style={styles.empty}>
          <FiBell size={48} />
          <p>No announcements for you at this time</p>
        </div>
      ) : (
        <div style={styles.announcementsList}>
          {announcements.map((ann) => (
            <div key={ann.id} style={styles.announcementCard}>
              <div style={styles.announcementHeader}>
                <FiBell size={20} style={{ color: "#4f46e5" }} />
                <h3>{ann.title}</h3>
              </div>
              <p style={styles.announcementContent}>{ann.content}</p>
              <p style={styles.meta}>
                {ann.postedBy} • {ann.date}
              </p>
            </div>
          ))}
        </div>
      )}
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
  empty: { textAlign: "center", padding: "60px", color: "#9ca3af" },
  announcementsList: { display: "flex", flexDirection: "column", gap: "16px" },
  announcementCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  announcementHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  announcementContent: {
    color: "#4b5563",
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  meta: { fontSize: "12px", color: "#6b7280" },
};

export default UserAnnouncementsPage;
