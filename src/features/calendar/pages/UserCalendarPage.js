import React, { useState, useEffect } from "react";
import { FiCalendar } from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";

const UserCalendarPage = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo events with target audience
    const allEvents = [
      {
        id: 1,
        title: "School Holiday",
        date: "2024-04-10",
        type: "holiday",
        targetType: "all",
      },
      {
        id: 2,
        title: "Teacher Training",
        date: "2024-04-12",
        type: "event",
        targetType: "role",
        targetRole: "teacher",
      },
      {
        id: 3,
        title: "Parent-Teacher Meeting",
        date: "2024-04-15",
        type: "meeting",
        targetType: "role",
        targetRole: "parent",
      },
      {
        id: 4,
        title: "Grade 10 Science Exam",
        date: "2024-04-18",
        type: "exam",
        targetType: "grade",
        targetGrade: "Grade 10",
      },
      {
        id: 5,
        title: "Section A Field Trip",
        date: "2024-04-20",
        type: "event",
        targetType: "section",
        targetGrade: "Grade 10",
        targetSection: "A",
      },
    ];

    // Filter events based on user's role and class
    const filtered = allEvents.filter((event) => {
      if (event.targetType === "all") return true;
      if (event.targetType === "role" && event.targetRole === user?.role)
        return true;
      if (event.targetType === "grade" && event.targetGrade === user?.grade)
        return true;
      if (
        event.targetType === "section" &&
        event.targetGrade === user?.grade &&
        event.targetSection === user?.class
      )
        return true;
      return false;
    });

    setEvents(filtered);
    setLoading(false);
  }, [user]);

  const getTypeColor = (type) => {
    switch (type) {
      case "holiday":
        return { bg: "#fed7aa", color: "#c2410c", label: "🎉 Holiday" };
      case "exam":
        return { bg: "#fee2e2", color: "#dc2626", label: "📝 Exam" };
      case "meeting":
        return { bg: "#dbeafe", color: "#2563eb", label: "👥 Meeting" };
      default:
        return { bg: "#d1fae5", color: "#065f46", label: "📅 Event" };
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading calendar...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Calendar</h1>
        <p style={styles.subtitle}>Upcoming events and important dates</p>
      </div>

      {events.length === 0 ? (
        <div style={styles.empty}>
          <FiCalendar size={48} />
          <p>No events for you at this time</p>
        </div>
      ) : (
        <div style={styles.eventsList}>
          {events.map((event) => {
            const typeStyle = getTypeColor(event.type);
            return (
              <div key={event.id} style={styles.eventCard}>
                <div style={styles.eventIcon}>
                  <FiCalendar size={24} />
                </div>
                <div style={styles.eventInfo}>
                  <h3>{event.title}</h3>
                  <p style={styles.eventDate}>{event.date}</p>
                </div>
                <span
                  style={{
                    ...styles.typeBadge,
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.color,
                  }}
                >
                  {typeStyle.label}
                </span>
              </div>
            );
          })}
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
  eventsList: { display: "flex", flexDirection: "column", gap: "16px" },
  eventCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  eventIcon: {
    padding: "12px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
  },
  eventInfo: { flex: 1 },
  eventDate: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  typeBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
};

export default UserCalendarPage;
