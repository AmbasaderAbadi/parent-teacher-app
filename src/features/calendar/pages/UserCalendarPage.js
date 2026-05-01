import React, { useState, useEffect } from "react";
import { FiCalendar } from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { calendarAPI } from "../../../services/api";
import toast from "react-hot-toast";

const UserCalendarPage = () => {
  const { user: storeUser } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Get user from localStorage if store is empty
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    } else if (storeUser) {
      setCurrentUser(storeUser);
    }
  }, [storeUser]);

  useEffect(() => {
    if (currentUser) {
      fetchEvents();
    }
  }, [currentUser]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await calendarAPI.getAllEvents();
      let allEvents = response.data;

      // Robust extraction
      if (allEvents?.data && Array.isArray(allEvents.data)) {
        allEvents = allEvents.data;
      } else if (allEvents?.events && Array.isArray(allEvents.events)) {
        allEvents = allEvents.events;
      } else if (!Array.isArray(allEvents)) {
        allEvents = [];
      }

      const filteredEvents = filterEventsByUser(allEvents, currentUser);

      const formattedEvents = filteredEvents.map((event) => ({
        id: event.id || event._id,
        title: event.title,
        description: event.description,
        date: event.date?.split("T")[0] || event.date,
        type: event.type || "event",
        targetType: event.targetType || event.targetAudience || "all",
        targetRole: event.targetRole,
        targetGrade: event.targetGrade,
        targetSection: event.targetSection,
        time: event.time,
        location: event.location,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load calendar events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByUser = (allEvents, userData) => {
    if (!userData || !Array.isArray(allEvents)) return [];

    return allEvents.filter((event) => {
      const target = event.targetType || event.targetAudience || "all";

      // Global events
      if (target === "all") return true;

      // Role‑specific
      if (target === "teachers" && userData.role === "teacher") return true;
      if (target === "parents" && userData.role === "parent") return true;
      if (target === "students" && userData.role === "student") return true;

      // Grade‑specific for students
      if (userData.role === "student" && event.targetGrade) {
        if (event.targetGrade === userData.grade) {
          if (event.targetSection) {
            return (
              event.targetSection === (userData.className || userData.section)
            );
          }
          return true;
        }
      }

      // Parents – match any child's grade/section
      if (
        userData.role === "parent" &&
        userData.children &&
        Array.isArray(userData.children)
      ) {
        return userData.children.some((child) => {
          if (event.targetGrade && event.targetGrade === child.grade) {
            if (event.targetSection) {
              return event.targetSection === child.section;
            }
            return true;
          }
          return false;
        });
      }

      return false;
    });
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const sortEventsByDate = (eventsList) => {
    return [...eventsList].sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading calendar events...</p>
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

  const sortedEvents = sortEventsByDate(events);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Calendar</h1>
        <p style={styles.subtitle}>Upcoming events and important dates</p>
      </div>

      {currentUser && (
        <div style={styles.userInfo}>
          <p>
            Showing events for:{" "}
            <strong>{currentUser.role?.toUpperCase()}</strong>
            {currentUser.grade && ` • ${currentUser.grade}`}
            {(currentUser.className || currentUser.section) &&
              ` • Section ${currentUser.className || currentUser.section}`}
            {currentUser.role === "parent" &&
              currentUser.children &&
              ` • Children: ${currentUser.children.map((c) => c.name).join(", ")}`}
          </p>
        </div>
      )}

      {sortedEvents.length === 0 ? (
        <div style={styles.empty}>
          <FiCalendar size={48} style={styles.emptyIcon} />
          <p>No events for you at this time</p>
          <p style={styles.emptySubtext}>Check back later for updates</p>
        </div>
      ) : (
        <div style={styles.eventsList}>
          {sortedEvents.map((event) => {
            const typeStyle = getTypeColor(event.type);
            return (
              <div key={event.id} style={styles.eventCard}>
                <div style={styles.eventDateBox}>
                  <div style={styles.eventDay}>
                    {new Date(event.date).getDate()}
                  </div>
                  <div style={styles.eventMonth}>
                    {new Date(event.date).toLocaleString("default", {
                      month: "short",
                    })}
                  </div>
                </div>
                <div style={styles.eventInfo}>
                  <h3 style={styles.eventTitle}>{event.title}</h3>
                  <p style={styles.eventDate}>
                    {formatDate(event.date)}
                    {event.time && ` at ${event.time}`}
                  </p>
                  {event.description && (
                    <p style={styles.eventDescription}>{event.description}</p>
                  )}
                  {event.location && (
                    <p style={styles.eventLocation}>📍 {event.location}</p>
                  )}
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
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  userInfo: {
    marginBottom: "20px",
    padding: "10px 16px",
    backgroundColor: "#eef2ff",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
  },
  empty: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptyIcon: { marginBottom: "16px", opacity: 0.5 },
  emptySubtext: { fontSize: "12px", marginTop: "8px", color: "#d1d5db" },
  eventsList: { display: "flex", flexDirection: "column", gap: "16px" },
  eventCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.2s ease",
  },
  eventDateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "60px",
    padding: "8px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
  },
  eventDay: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#4f46e5",
    lineHeight: 1,
  },
  eventMonth: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "4px",
    textTransform: "uppercase",
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  eventDate: { fontSize: "12px", color: "#6b7280", margin: "4px 0" },
  eventDescription: { fontSize: "13px", color: "#6b7280", marginTop: "4px" },
  eventLocation: { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  typeBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
};

export default UserCalendarPage;
