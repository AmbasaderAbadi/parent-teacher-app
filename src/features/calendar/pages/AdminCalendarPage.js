import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiUsers,
  FiUserCheck,
  FiBookOpen,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const AdminCalendarPage = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
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

  const handleAdd = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Please fill title and date");
      return;
    }
    setEvents([...events, { id: Date.now(), ...newEvent }]);
    setShowForm(false);
    setNewEvent({
      title: "",
      date: "",
      type: "event",
      targetType: "all",
      targetRole: "",
      targetGrade: "",
      targetSection: "",
    });
    toast.success("Event added!");
  };

  const getTargetText = (event) => {
    if (event.targetType === "all") return "📢 Everyone";
    if (event.targetType === "role") return `👥 ${event.targetRole}s only`;
    if (event.targetType === "grade") return `📚 ${event.targetGrade} only`;
    if (event.targetType === "section")
      return `🏫 ${event.targetGrade} - Section ${event.targetSection} only`;
    return "Everyone";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Calendar</h1>
        <p style={styles.subtitle}>Manage events for specific audiences</p>
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
          <h3>Add New Event</h3>
          <input
            type="text"
            placeholder="Event Title *"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            style={styles.input}
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
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>
              Cancel
            </button>
            <button onClick={handleAdd} style={styles.submitBtn}>
              Add Event
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.eventsList}>
        {events.map((event) => (
          <div key={event.id} style={styles.eventCard}>
            <div>
              <h3>{event.title}</h3>
              <p style={styles.eventDate}>
                {event.date} • {event.type}
              </p>
              <span style={styles.targetBadge}>{getTargetText(event)}</span>
            </div>
            <button
              style={styles.deleteBtn}
              onClick={() => setEvents(events.filter((e) => e.id !== event.id))}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {events.length === 0 && (
        <p style={styles.empty}>
          No events added yet. Click "Add Event" to create one.
        </p>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: { fontSize: "28px", fontWeight: "700", color: "#1f2937" },
  subtitle: { fontSize: "14px", color: "#6b7280", marginTop: "4px" },
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
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    display: "block",
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
  },
  audienceBtnActive: { backgroundColor: "#4f46e5", color: "white" },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    backgroundColor: "white",
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
  },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  eventsList: { display: "flex", flexDirection: "column", gap: "16px" },
  eventCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  eventDate: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  targetBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    fontSize: "10px",
    marginTop: "8px",
  },
  deleteBtn: {
    padding: "6px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
  },
  empty: { textAlign: "center", padding: "40px", color: "#9ca3af" },
};

export default AdminCalendarPage;
