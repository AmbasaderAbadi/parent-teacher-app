import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import toast from "react-hot-toast";

const SchoolCalendarPage = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00 AM",
    location: "",
    description: "",
    type: "academic",
  });

  useEffect(() => {
    // Demo events
    const demoEvents = [
      {
        id: 1,
        title: "Parent-Teacher Meeting",
        date: "2024-04-15",
        time: "2:00 PM - 5:00 PM",
        location: "School Auditorium",
        description:
          "Annual parent-teacher meeting to discuss student progress",
        type: "meeting",
        attendees: "All parents and teachers",
      },
      {
        id: 2,
        title: "Spring Holiday",
        date: "2024-04-10",
        time: "All Day",
        location: "",
        description: "School closed for spring break",
        type: "holiday",
        attendees: "All students",
      },
      {
        id: 3,
        title: "Science Exhibition",
        date: "2024-04-20",
        time: "9:00 AM - 3:00 PM",
        location: "Science Lab",
        description: "Annual science exhibition showcasing student projects",
        type: "event",
        attendees: "All students and parents",
      },
      {
        id: 4,
        title: "Term 2 Exams",
        date: "2024-04-25",
        time: "8:00 AM - 12:00 PM",
        location: "Various Classrooms",
        description: "Term 2 final examinations",
        type: "exam",
        attendees: "All students",
      },
      {
        id: 5,
        title: "Sports Day",
        date: "2024-05-05",
        time: "8:00 AM - 4:00 PM",
        location: "School Ground",
        description: "Annual sports day celebration",
        type: "event",
        attendees: "All students",
      },
    ];
    setEvents(demoEvents);
  }, []);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.date === dateStr);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return {
          bg: "#dbeafe",
          color: "#2563eb",
          border: "#bfdbfe",
          label: "Meeting",
        };
      case "holiday":
        return {
          bg: "#fed7aa",
          color: "#c2410c",
          border: "#fed7aa",
          label: "Holiday",
        };
      case "exam":
        return {
          bg: "#fee2e2",
          color: "#dc2626",
          border: "#fecaca",
          label: "Exam",
        };
      default:
        return {
          bg: "#d1fae5",
          color: "#065f46",
          border: "#a7f3d0",
          label: "Event",
        };
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast.error("Please enter event title");
      return;
    }

    const event = {
      id: Date.now(),
      ...newEvent,
      attendees: "All students and parents",
    };

    setEvents([...events, event]);
    setShowEventForm(false);
    setNewEvent({
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "10:00 AM",
      location: "",
      description: "",
      type: "academic",
    });
    toast.success("Event added to calendar!");
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
    setSelectedEvent(null);
    toast.success("Event deleted");
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const days = getDaysInMonth();
  const isTeacher = user?.role === "teacher";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 School Calendar</h1>
          <p style={styles.subtitle}>
            Upcoming events, holidays, and important dates
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            style={styles.addBtn}
          >
            <FiPlus size={18} /> Add Event
          </button>
        )}
      </div>

      {/* Event Form */}
      {showEventForm && isTeacher && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <h3 style={styles.formTitle}>Add New Event</h3>
          <input
            type="text"
            placeholder="Event Title *"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            style={styles.input}
          />
          <div style={styles.formRow}>
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Time"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent({ ...newEvent, time: e.target.value })
              }
              style={styles.input}
            />
          </div>
          <input
            type="text"
            placeholder="Location"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
            style={styles.input}
          />
          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
            style={styles.select}
          >
            <option value="academic">Academic Event</option>
            <option value="meeting">Meeting</option>
            <option value="holiday">Holiday</option>
            <option value="exam">Exam</option>
          </select>
          <textarea
            placeholder="Description"
            rows={3}
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            style={styles.textarea}
          />
          <div style={styles.formActions}>
            <button
              onClick={() => setShowEventForm(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button onClick={handleAddEvent} style={styles.submitBtn}>
              Add Event
            </button>
          </div>
        </motion.div>
      )}

      {/* Calendar Navigation */}
      <div style={styles.calendarNav}>
        <button onClick={handlePrevMonth} style={styles.navBtn}>
          <FiChevronLeft size={20} />
        </button>
        <h2 style={styles.monthTitle}>{format(currentDate, "MMMM yyyy")}</h2>
        <button onClick={handleNextMonth} style={styles.navBtn}>
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendarGrid}>
        {/* Weekday Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} style={styles.weekdayHeader}>
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={index}
              style={{
                ...styles.calendarDay,
                ...(!isCurrentMonth ? styles.otherMonthDay : {}),
                ...(isToday(day) ? styles.today : {}),
              }}
            >
              <div style={styles.dayNumber}>{format(day, "d")}</div>
              <div style={styles.dayEvents}>
                {dayEvents.slice(0, 2).map((event) => {
                  const typeStyle = getEventTypeColor(event.type);
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        ...styles.eventBadge,
                        backgroundColor: typeStyle.bg,
                        color: typeStyle.color,
                        borderLeftColor: typeStyle.color,
                      }}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div style={styles.moreEvents}>
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.modalOverlay}
          onClick={() => setSelectedEvent(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>{selectedEvent.title}</h3>
              {isTeacher && (
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  style={styles.deleteEventBtn}
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
            <div style={styles.modalBody}>
              <p>
                <FiCalendar size={14} /> {selectedEvent.date}
              </p>
              <p>
                <FiClock size={14} /> {selectedEvent.time}
              </p>
              {selectedEvent.location && (
                <p>
                  <FiMapPin size={14} /> {selectedEvent.location}
                </p>
              )}
              {selectedEvent.attendees && (
                <p>
                  <FiUsers size={14} /> {selectedEvent.attendees}
                </p>
              )}
              <p>
                <FiBookOpen size={14} /> Type:{" "}
                {selectedEvent.type.toUpperCase()}
              </p>
              <p style={styles.modalDescription}>{selectedEvent.description}</p>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              style={styles.closeModalBtn}
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
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
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
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
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
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
  calendarNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  navBtn: {
    padding: "8px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  monthTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  weekdayHeader: {
    textAlign: "center",
    padding: "12px",
    fontWeight: "600",
    color: "#6b7280",
    fontSize: "14px",
  },
  calendarDay: {
    minHeight: "100px",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  otherMonthDay: {
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
  },
  today: {
    border: "2px solid #4f46e5",
    backgroundColor: "#eef2ff",
  },
  dayNumber: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  dayEvents: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  eventBadge: {
    fontSize: "10px",
    padding: "4px 6px",
    borderRadius: "4px",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    borderLeft: "3px solid",
  },
  moreEvents: {
    fontSize: "10px",
    color: "#6b7280",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    width: "90%",
    maxWidth: "500px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  deleteEventBtn: {
    padding: "6px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  modalDescription: {
    marginTop: "8px",
    color: "#4b5563",
    lineHeight: "1.5",
  },
  closeModalBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default SchoolCalendarPage;
