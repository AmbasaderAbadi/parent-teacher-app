import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiEdit2, FiCalendar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { calendarAPI } from "../../../services/api";
import toast from "react-hot-toast";

const AdminCalendarPage = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "event",
    priority: "medium",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "11:00",
    location: "",
    targetGrades: [],
    targetSections: [],
    isPublic: true,
    color: "#4f46e5",
    icon: "📅",
  });

  const eventTypes = [
    t("event_type"),
    t("holiday_type"),
    t("exam_type"),
    t("meeting_type"),
    t("class_type"),
  ];
  const priorities = [
    t("priority_low"),
    t("priority_medium"),
    t("priority_high"),
    t("priority_urgent"),
  ];
  const grades = [t("grade_9"), t("grade_10"), t("grade_11"), t("grade_12")];
  const sections = ["A", "B", "C", "D"];
  const colorOptions = [
    "#4f46e5",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#FF0000",
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await calendarAPI.getAllEvents();
      const eventsData = response.data?.data || response.data || [];
      const eventsList = Array.isArray(eventsData) ? eventsData : [];
      const formatted = eventsList.map((ev) => ({
        id: ev.id || ev._id,
        title: ev.title,
        description: ev.description,
        startDate: ev.startDate,
        endDate: ev.endDate,
        type: ev.type || "event",
        priority: ev.priority,
        location: ev.location,
        targetGrades: ev.targetGrades || [],
        targetSections: ev.targetSections || [],
        color: ev.color || "#4f46e5",
        icon: ev.icon || "📅",
      }));
      setEvents(formatted);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error(t("failed_load_events"));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatToISO = (date, time) => {
    if (!date) return null;
    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split(":");
    return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
  };

  const handleAdd = async () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast.error(t("title_start_required"));
      return;
    }

    const startISO = formatToISO(newEvent.startDate, newEvent.startTime);
    const endISO = newEvent.endDate
      ? formatToISO(newEvent.endDate, newEvent.endTime)
      : startISO;

    const payload = {
      title: newEvent.title,
      description: newEvent.description || "",
      type: newEvent.type,
      priority: newEvent.priority,
      startDate: startISO,
      endDate: endISO,
      location: newEvent.location || "",
      targetGrades: newEvent.targetGrades,
      targetSections: newEvent.targetSections,
      isPublic: newEvent.isPublic,
      color: newEvent.color,
      icon: newEvent.icon,
    };

    try {
      const response = await calendarAPI.createEvent(payload);
      const newEv = response.data?.data || response.data;
      const formatted = {
        id: newEv.id || newEv._id,
        title: newEvent.title,
        description: newEvent.description,
        startDate: startISO,
        endDate: endISO,
        type: newEvent.type,
        priority: newEvent.priority,
        location: newEvent.location,
        targetGrades: newEvent.targetGrades,
        targetSections: newEvent.targetSections,
        color: newEvent.color,
        icon: newEvent.icon,
      };
      setEvents([formatted, ...events]);
      resetForm();
      toast.success(t("event_added_success"));
    } catch (error) {
      console.error(
        "Error creating event:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.message || t("event_add_failed"));
    }
  };

  const handleUpdate = async () => {
    if (!editingEvent || !newEvent.title || !newEvent.startDate) {
      toast.error(t("title_start_required"));
      return;
    }

    const startISO = formatToISO(newEvent.startDate, newEvent.startTime);
    const endISO = newEvent.endDate
      ? formatToISO(newEvent.endDate, newEvent.endTime)
      : startISO;

    const payload = {
      title: newEvent.title,
      description: newEvent.description || "",
      type: newEvent.type,
      priority: newEvent.priority,
      startDate: startISO,
      endDate: endISO,
      location: newEvent.location || "",
      targetGrades: newEvent.targetGrades,
      targetSections: newEvent.targetSections,
      isPublic: newEvent.isPublic,
      color: newEvent.color,
      icon: newEvent.icon,
    };

    try {
      await calendarAPI.updateEvent(editingEvent.id, payload);
      const updatedEvents = events.map((ev) =>
        ev.id === editingEvent.id ? { ...ev, ...payload } : ev,
      );
      setEvents(updatedEvents);
      resetForm();
      toast.success(t("event_updated_success"));
    } catch (error) {
      console.error(
        "Error updating event:",
        error.response?.data || error.message,
      );
      toast.error(error.response?.data?.message || t("event_update_failed"));
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm(t("confirm_delete_event"))) {
      try {
        await calendarAPI.deleteEvent(eventId);
        setEvents(events.filter((ev) => ev.id !== eventId));
        toast.success(t("event_deleted_success"));
      } catch (error) {
        toast.error(t("event_delete_failed"));
      }
    }
  };

  const handleEdit = (event) => {
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : start;
    const startDate = start.toISOString().split("T")[0];
    const startTime = start.toTimeString().slice(0, 5);
    const endDate = end.toISOString().split("T")[0];
    const endTime = end.toTimeString().slice(0, 5);

    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      type: event.type || "event",
      priority: event.priority || "medium",
      startDate,
      startTime,
      endDate,
      endTime,
      location: event.location || "",
      targetGrades: event.targetGrades || [],
      targetSections: event.targetSections || [],
      isPublic: event.isPublic ?? true,
      color: event.color || "#4f46e5",
      icon: event.icon || "📅",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setNewEvent({
      title: "",
      description: "",
      type: "event",
      priority: "medium",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "11:00",
      location: "",
      targetGrades: [],
      targetSections: [],
      isPublic: true,
      color: "#4f46e5",
      icon: "📅",
    });
  };

  const toggleGrade = (grade) => {
    setNewEvent((prev) => ({
      ...prev,
      targetGrades: prev.targetGrades.includes(grade)
        ? prev.targetGrades.filter((g) => g !== grade)
        : [...prev.targetGrades, grade],
    }));
  };

  const toggleSection = (section) => {
    setNewEvent((prev) => ({
      ...prev,
      targetSections: prev.targetSections.includes(section)
        ? prev.targetSections.filter((s) => s !== section)
        : [...prev.targetSections, section],
    }));
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case t("holiday_type"):
        return { bg: "#fef3c7", color: "#92400e" };
      case t("exam_type"):
        return { bg: "#fee2e2", color: "#991b1b" };
      case t("meeting_type"):
        return { bg: "#d1fae5", color: "#065f46" };
      case t("class_type"):
        return { bg: "#e0e7ff", color: "#3730a3" };
      default:
        return { bg: "#eef2ff", color: "#4f46e5" };
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner" />
        <p>{t("loading_events")}</p>
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
          <h1 style={styles.title}>{t("calendar")}</h1>
          <p style={styles.subtitle}>{t("manage_events")}</p>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
          <FiPlus size={16} /> {t("add_event")}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3>{editingEvent ? t("edit_event") : t("add_new_event")}</h3>

          <input
            type="text"
            placeholder={t("event_title_placeholder")}
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            style={styles.input}
          />
          <textarea
            placeholder={t("description_placeholder")}
            rows={3}
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            style={styles.textarea}
          />

          <div style={styles.formRow}>
            <div style={styles.dateTimeGroup}>
              <label style={styles.smallLabel}>{t("start_date")}</label>
              <input
                type="date"
                value={newEvent.startDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startDate: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.dateTimeGroup}>
              <label style={styles.smallLabel}>{t("start_time")}</label>
              <input
                type="time"
                value={newEvent.startTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startTime: e.target.value })
                }
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.dateTimeGroup}>
              <label style={styles.smallLabel}>{t("end_date")}</label>
              <input
                type="date"
                value={newEvent.endDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endDate: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.dateTimeGroup}>
              <label style={styles.smallLabel}>{t("end_time")}</label>
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endTime: e.target.value })
                }
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <select
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value })
              }
              style={styles.select}
            >
              {eventTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              value={newEvent.priority}
              onChange={(e) =>
                setNewEvent({ ...newEvent, priority: e.target.value })
              }
              style={styles.select}
            >
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder={t("location_placeholder")}
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
            style={styles.input}
          />

          <label style={styles.label}>{t("target_grades")}</label>
          <div style={styles.tagGroup}>
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => toggleGrade(grade)}
                style={{
                  ...styles.tagBtn,
                  ...(newEvent.targetGrades.includes(grade)
                    ? styles.tagBtnActive
                    : {}),
                }}
              >
                {grade}
              </button>
            ))}
          </div>

          <label style={styles.label}>{t("target_sections")}</label>
          <div style={styles.tagGroup}>
            {sections.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => toggleSection(section)}
                style={{
                  ...styles.tagBtn,
                  ...(newEvent.targetSections.includes(section)
                    ? styles.tagBtnActive
                    : {}),
                }}
              >
                {t("section")} {section}
              </button>
            ))}
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>{t("color")}</label>
            <div style={styles.colorGroup}>
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewEvent({ ...newEvent, color })}
                  style={{
                    ...styles.colorBtn,
                    backgroundColor: color,
                    border:
                      newEvent.color === color
                        ? "2px solid #1f2937"
                        : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={styles.formRow}>
            <input
              type="text"
              placeholder={t("icon_placeholder")}
              value={newEvent.icon}
              onChange={(e) =>
                setNewEvent({ ...newEvent, icon: e.target.value })
              }
              style={styles.input}
              maxLength={2}
            />
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newEvent.isPublic}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, isPublic: e.target.checked })
                }
              />
              {t("public_event")}
            </label>
          </div>

          <div style={styles.formActions}>
            <button onClick={resetForm} style={styles.cancelBtn}>
              {t("cancel")}
            </button>
            <button
              onClick={editingEvent ? handleUpdate : handleAdd}
              style={styles.submitBtn}
            >
              {editingEvent ? t("update_event") : t("add_event")}
            </button>
          </div>
        </motion.div>
      )}

      <div style={styles.eventsList}>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <FiCalendar size={48} />
            <p>{t("no_events")}</p>
          </div>
        ) : (
          events.map((event) => {
            const typeColor = getEventTypeColor(event.type);
            return (
              <div key={event.id} style={styles.eventCard}>
                <div style={styles.eventContent}>
                  <div style={styles.eventHeader}>
                    <span style={{ fontSize: "20px" }}>
                      {event.icon || "📅"}
                    </span>
                    <h3>{event.title}</h3>
                    <span
                      style={{
                        ...styles.eventTypeBadge,
                        backgroundColor: typeColor.bg,
                        color: typeColor.color,
                      }}
                    >
                      {event.type?.toUpperCase()}
                    </span>
                    {event.priority && (
                      <span style={styles.priorityBadge}>{event.priority}</span>
                    )}
                  </div>
                  {event.description && (
                    <p style={styles.eventDescription}>{event.description}</p>
                  )}
                  <p style={styles.eventDate}>
                    📅 {new Date(event.startDate).toLocaleString()}
                    {event.endDate &&
                      event.endDate !== event.startDate &&
                      ` – ${new Date(event.endDate).toLocaleString()}`}
                  </p>
                  {event.location && (
                    <p style={styles.eventLocation}>📍 {event.location}</p>
                  )}
                  {(event.targetGrades?.length > 0 ||
                    event.targetSections?.length > 0) && (
                    <p style={styles.eventTargets}>
                      🎯 {event.targetGrades?.join(", ")}{" "}
                      {event.targetSections
                        ?.map((s) => `${t("section")} ${s}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div style={styles.eventActions}>
                  <button
                    onClick={() => handleEdit(event)}
                    style={styles.editBtn}
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    style={styles.deleteBtn}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  // All styles remain unchanged (same as in your original file)
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
    marginBottom: "4px",
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
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    backgroundColor: "white",
    fontSize: "14px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
    alignItems: "center",
  },
  dateTimeGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  smallLabel: { fontSize: "12px", color: "#6b7280" },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
    marginTop: "8px",
    display: "block",
    color: "#374151",
  },
  tagGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },
  tagBtn: {
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
  },
  tagBtnActive: { backgroundColor: "#4f46e5", color: "white" },
  colorGroup: { display: "flex", gap: "8px", marginBottom: "12px" },
  colorBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    cursor: "pointer",
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
  emptyState: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  eventCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  eventContent: { flex: 1 },
  eventHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  eventTypeBadge: {
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "500",
  },
  priorityBadge: {
    padding: "2px 8px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
    fontSize: "10px",
    textTransform: "uppercase",
  },
  eventDescription: { fontSize: "13px", color: "#6b7280", marginBottom: "8px" },
  eventDate: { fontSize: "12px", color: "#6b7280", margin: "4px 0" },
  eventLocation: { fontSize: "12px", color: "#6b7280", margin: "2px 0" },
  eventTargets: { fontSize: "11px", color: "#9ca3af", marginTop: "4px" },
  eventActions: { display: "flex", gap: "8px" },
  editBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
  },
  deleteBtn: {
    padding: "6px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
  },
};

export default AdminCalendarPage;
