import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiEdit2,
  FiCalendar,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { calendarAPI } from "../../../services/api";
import toast from "react-hot-toast";

const AdminCalendarPage = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    type: "event",
    targetType: "all",
    targetRole: "",
    targetGrade: "",
    targetSection: "",
  });

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sections = ["A", "B", "C", "D"];
  const roles = ["parent", "teacher", "student"];
  const eventTypes = ["event", "holiday", "exam", "meeting"];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await calendarAPI.getAllEvents();
      const eventsData = response.data;

      // Transform API data to match component structure
      const formattedEvents = eventsData.map((event) => ({
        id: event.id || event._id,
        title: event.title,
        description: event.description,
        date: event.date?.split("T")[0] || event.date,
        type: event.type || "event",
        targetType: event.targetType || "all",
        targetRole: event.targetRole,
        targetGrade: event.targetGrade,
        targetSection: event.targetSection,
        createdAt: event.createdAt,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Using demo data.");

      // Fallback to demo data
      const demoEvents = [
        {
          id: 1,
          title: "Parent-Teacher Meeting",
          description: "Annual parent-teacher conference",
          date: "2024-04-20",
          type: "meeting",
          targetType: "all",
        },
        {
          id: 2,
          title: "Science Fair",
          description: "Annual science exhibition",
          date: "2024-05-10",
          type: "event",
          targetType: "grade",
          targetGrade: "Grade 10",
        },
        {
          id: 3,
          title: "Final Exams Begin",
          description: "End of term examinations",
          date: "2024-06-01",
          type: "exam",
          targetType: "all",
        },
      ];
      setEvents(demoEvents);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Please fill title and date");
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        type: newEvent.type,
        targetType: newEvent.targetType,
        targetRole: newEvent.targetRole,
        targetGrade: newEvent.targetGrade,
        targetSection: newEvent.targetSection,
      };

      const response = await calendarAPI.createEvent(eventData);
      const newEventItem = response.data;

      const formattedEvent = {
        id: newEventItem.id || newEventItem._id,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        type: newEvent.type,
        targetType: newEvent.targetType,
        targetRole: newEvent.targetRole,
        targetGrade: newEvent.targetGrade,
        targetSection: newEvent.targetSection,
      };

      setEvents([formattedEvent, ...events]);
      resetForm();
      toast.success("Event added successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Failed to add event");
    }
  };

  const handleUpdate = async () => {
    if (!editingEvent || !newEvent.title || !newEvent.date) {
      toast.error("Please fill title and date");
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        type: newEvent.type,
        targetType: newEvent.targetType,
        targetRole: newEvent.targetRole,
        targetGrade: newEvent.targetGrade,
        targetSection: newEvent.targetSection,
      };

      await calendarAPI.updateEvent(editingEvent.id, eventData);

      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? { ...event, ...eventData } : event,
      );

      setEvents(updatedEvents);
      resetForm();
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.response?.data?.message || "Failed to update event");
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await calendarAPI.deleteEvent(eventId);
        setEvents(events.filter((event) => event.id !== eventId));
        toast.success("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error(error.response?.data?.message || "Failed to delete event");
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      date: event.date,
      type: event.type,
      targetType: event.targetType,
      targetRole: event.targetRole || "",
      targetGrade: event.targetGrade || "",
      targetSection: event.targetSection || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      type: "event",
      targetType: "all",
      targetRole: "",
      targetGrade: "",
      targetSection: "",
    });
  };

  const getTargetText = (event) => {
    if (event.targetType === "all") return "📢 Everyone";
    if (event.targetType === "role") return `👥 ${event.targetRole}s only`;
    if (event.targetType === "grade") return `📚 ${event.targetGrade} only`;
    if (event.targetType === "section")
      return `🏫 ${event.targetGrade} - Section ${event.targetSection} only`;
    return "Everyone";
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "holiday":
        return { bg: "#fef3c7", color: "#92400e" };
      case "exam":
        return { bg: "#fee2e2", color: "#991b1b" };
      case "meeting":
        return { bg: "#d1fae5", color: "#065f46" };
      default:
        return { bg: "#eef2ff", color: "#4f46e5" };
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
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
          <h1 style={styles.title}>📅 Calendar</h1>
          <p style={styles.subtitle}>Manage events for specific audiences</p>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
          <FiPlus size={16} /> Add Event
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>{editingEvent ? "Edit Event" : "Add New Event"}</h3>
          <input
            type="text"
            placeholder="Event Title *"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            style={styles.input}
          />
          <textarea
            placeholder="Description (Optional)"
            rows={3}
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            style={styles.textarea}
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Event Type:</label>
          <div style={styles.typeOptions}>
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setNewEvent({ ...newEvent, type })}
                style={{
                  ...styles.typeBtn,
                  ...(newEvent.type === type ? styles.typeBtnActive : {}),
                }}
              >
                {type === "event" && "📅 Event"}
                {type === "holiday" && "🎉 Holiday"}
                {type === "exam" && "📝 Exam"}
                {type === "meeting" && "👥 Meeting"}
              </button>
            ))}
          </div>

          <label style={styles.label}>Target Audience:</label>
          <div style={styles.audienceOptions}>
            <button
              onClick={() =>
                setNewEvent({
                  ...newEvent,
                  targetType: "all",
                  targetRole: "",
                  targetGrade: "",
                  targetSection: "",
                })
              }
              style={{
                ...styles.audienceBtn,
                ...(newEvent.targetType === "all"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiUsers size={16} /> All Users
            </button>
            <button
              onClick={() => setNewEvent({ ...newEvent, targetType: "role" })}
              style={{
                ...styles.audienceBtn,
                ...(newEvent.targetType === "role"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiUserCheck size={16} /> By Role
            </button>
            <button
              onClick={() => setNewEvent({ ...newEvent, targetType: "grade" })}
              style={{
                ...styles.audienceBtn,
                ...(newEvent.targetType === "grade"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiBookOpen size={16} /> By Grade
            </button>
            <button
              onClick={() =>
                setNewEvent({ ...newEvent, targetType: "section" })
              }
              style={{
                ...styles.audienceBtn,
                ...(newEvent.targetType === "section"
                  ? styles.audienceBtnActive
                  : {}),
              }}
            >
              <FiBookOpen size={16} /> By Section
            </button>
          </div>

          {newEvent.targetType === "role" && (
            <select
              value={newEvent.targetRole}
              onChange={(e) =>
                setNewEvent({ ...newEvent, targetRole: e.target.value })
              }
              style={styles.select}
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          )}

          {(newEvent.targetType === "grade" ||
            newEvent.targetType === "section") && (
            <select
              value={newEvent.targetGrade}
              onChange={(e) =>
                setNewEvent({ ...newEvent, targetGrade: e.target.value })
              }
              style={styles.select}
            >
              <option value="">Select Grade</option>
              {grades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          )}

          {newEvent.targetType === "section" && (
            <select
              value={newEvent.targetSection}
              onChange={(e) =>
                setNewEvent({ ...newEvent, targetSection: e.target.value })
              }
              style={styles.select}
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s}>Section {s}</option>
              ))}
            </select>
          )}

          <div style={styles.formActions}>
            <button onClick={resetForm} style={styles.cancelBtn}>
              Cancel
            </button>
            <button
              onClick={editingEvent ? handleUpdate : handleAdd}
              style={styles.submitBtn}
            >
              {editingEvent ? "Update Event" : "Add Event"}
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.eventsList}>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <FiCalendar size={48} style={styles.emptyIcon} />
            <p>No events added yet.</p>
            <p style={styles.emptySubtext}>Click "Add Event" to create one.</p>
          </div>
        ) : (
          events.map((event) => {
            const typeColor = getEventTypeColor(event.type);
            return (
              <div key={event.id} style={styles.eventCard}>
                <div style={styles.eventContent}>
                  <div style={styles.eventHeader}>
                    <h3 style={styles.eventTitle}>{event.title}</h3>
                    <span
                      style={{
                        ...styles.eventTypeBadge,
                        backgroundColor: typeColor.bg,
                        color: typeColor.color,
                      }}
                    >
                      {event.type === "event" && "📅"}
                      {event.type === "holiday" && "🎉"}
                      {event.type === "exam" && "📝"}
                      {event.type === "meeting" && "👥"}
                      {" " +
                        event.type.charAt(0).toUpperCase() +
                        event.type.slice(1)}
                    </span>
                  </div>
                  {event.description && (
                    <p style={styles.eventDescription}>{event.description}</p>
                  )}
                  <p style={styles.eventDate}>📅 {event.date}</p>
                  <span style={styles.targetBadge}>{getTargetText(event)}</span>
                </div>
                <div style={styles.eventActions}>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(event)}
                    title="Edit Event"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(event.id)}
                    title="Delete Event"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
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
  subtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },
  addBtn: {
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
    resize: "vertical",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    marginTop: "8px",
    display: "block",
    color: "#374151",
  },
  typeOptions: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  typeBtn: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  typeBtnActive: { backgroundColor: "#4f46e5", color: "white" },
  audienceOptions: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  audienceBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  audienceBtnActive: { backgroundColor: "#4f46e5", color: "white" },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    backgroundColor: "white",
    fontSize: "14px",
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
  eventsList: { display: "flex", flexDirection: "column", gap: "16px" },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptyIcon: {
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#d1d5db",
  },
  eventCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.2s ease",
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  eventTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
  },
  eventTypeBadge: {
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "500",
  },
  eventDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  eventDate: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "4px 0",
  },
  targetBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    fontSize: "10px",
    marginTop: "8px",
  },
  eventActions: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
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

export default AdminCalendarPage;
