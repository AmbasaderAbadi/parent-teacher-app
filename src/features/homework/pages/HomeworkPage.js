import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiPaperclip,
  FiDownload,
  FiCheckCircle,
  FiClock as FiClockIcon,
  FiAlertCircle,
  FiTrash2,
  FiEdit2,
  FiEye,
  FiSend,
} from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";

const HomeworkPage = ({ user }) => {
  const [homeworks, setHomeworks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd"),
    dueTime: "23:59",
    attachments: [],
    class: "Grade 10A",
  });
  const [submissions, setSubmissions] = useState({});
  const [selectedSubject, setSelectedSubject] = useState("all");

  useEffect(() => {
    // Demo homework data
    const demoHomeworks = [
      {
        id: 1,
        title: "Mathematics Assignment - Algebra",
        description:
          "Solve problems from Chapter 5 (Algebraic Expressions). Complete exercises 5.1 to 5.3. Submit in notebook.",
        subject: "Mathematics",
        dueDate: "2024-04-10",
        dueTime: "23:59",
        postedBy: "Mr. Smith",
        postedDate: "2024-04-01",
        attachments: ["worksheet.pdf"],
        submissions: [],
      },
      {
        id: 2,
        title: "Science Project - Solar System",
        description:
          "Create a 3D model of the solar system. Include all planets and their relative sizes.",
        subject: "Science",
        dueDate: "2024-04-15",
        dueTime: "23:59",
        postedBy: "Mrs. Johnson",
        postedDate: "2024-04-02",
        attachments: [],
        submissions: [],
      },
      {
        id: 3,
        title: "English Essay - My Favorite Book",
        description:
          "Write a 500-word essay about your favorite book and explain why you like it.",
        subject: "English",
        dueDate: "2024-04-08",
        dueTime: "23:59",
        postedBy: "Ms. Davis",
        postedDate: "2024-04-01",
        attachments: [],
        submissions: [],
      },
    ];
    setHomeworks(demoHomeworks);

    // Demo submissions
    const demoSubmissions = {
      1: { status: "pending", submittedDate: null, marks: null },
      2: { status: "submitted", submittedDate: "2024-04-05", marks: null },
      3: { status: "graded", submittedDate: "2024-04-03", marks: 85 },
    };
    setSubmissions(demoSubmissions);
  }, []);

  const handleAddHomework = () => {
    if (
      !newHomework.title ||
      !newHomework.description ||
      !newHomework.subject
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const homework = {
      id: Date.now(),
      ...newHomework,
      postedBy: user?.name || "Teacher",
      postedDate: format(new Date(), "yyyy-MM-dd"),
      submissions: [],
    };

    setHomeworks([homework, ...homeworks]);
    setNewHomework({
      title: "",
      description: "",
      subject: "",
      dueDate: format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd"),
      dueTime: "23:59",
      attachments: [],
      class: "Grade 10A",
    });
    setShowForm(false);
    toast.success("Homework assigned successfully!");
  };

  const handleSubmitHomework = (homeworkId) => {
    setSubmissions({
      ...submissions,
      [homeworkId]: {
        status: "submitted",
        submittedDate: format(new Date(), "yyyy-MM-dd"),
        marks: null,
      },
    });
    toast.success("Homework submitted successfully!");
  };

  const handleGradeHomework = (homeworkId, marks) => {
    setSubmissions({
      ...submissions,
      [homeworkId]: {
        ...submissions[homeworkId],
        status: "graded",
        marks: marks,
      },
    });
    toast.success("Grade added successfully!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "submitted":
        return {
          bg: "#dbeafe",
          color: "#2563eb",
          text: "Submitted",
          icon: <FiClockIcon size={12} />,
        };
      case "graded":
        return {
          bg: "#d1fae5",
          color: "#065f46",
          text: "Graded",
          icon: <FiCheckCircle size={12} />,
        };
      default:
        return {
          bg: "#fed7aa",
          color: "#92400e",
          text: "Pending",
          icon: <FiAlertCircle size={12} />,
        };
    }
  };

  const subjects = ["all", ...new Set(homeworks.map((h) => h.subject))];
  const filteredHomeworks =
    selectedSubject === "all"
      ? homeworks
      : homeworks.filter((h) => h.subject === selectedSubject);

  const isTeacher = user?.role === "teacher";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📝 Homework & Assignments</h1>
          <p style={styles.subtitle}>Track and submit assignments</p>
        </div>
        {isTeacher && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            <FiPlus size={18} /> Assign Homework
          </button>
        )}
      </div>

      {/* Subject Filters */}
      <div style={styles.filters}>
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            style={{
              ...styles.filterBtn,
              ...(selectedSubject === subject ? styles.filterBtnActive : {}),
            }}
          >
            {subject === "all" ? "All Subjects" : subject}
          </button>
        ))}
      </div>

      {/* Add Homework Form */}
      <AnimatePresence>
        {showForm && isTeacher && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.formCard}
          >
            <h3 style={styles.formTitle}>Assign New Homework</h3>
            <input
              type="text"
              placeholder="Homework Title *"
              value={newHomework.title}
              onChange={(e) =>
                setNewHomework({ ...newHomework, title: e.target.value })
              }
              style={styles.input}
            />
            <textarea
              placeholder="Description / Instructions *"
              rows={4}
              value={newHomework.description}
              onChange={(e) =>
                setNewHomework({ ...newHomework, description: e.target.value })
              }
              style={styles.textarea}
            />
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="Subject *"
                value={newHomework.subject}
                onChange={(e) =>
                  setNewHomework({ ...newHomework, subject: e.target.value })
                }
                style={styles.input}
              />
              <select
                value={newHomework.class}
                onChange={(e) =>
                  setNewHomework({ ...newHomework, class: e.target.value })
                }
                style={styles.select}
              >
                <option>Grade 9A</option>
                <option>Grade 9B</option>
                <option>Grade 10A</option>
                <option>Grade 10B</option>
              </select>
            </div>
            <div style={styles.formRow}>
              <input
                type="date"
                value={newHomework.dueDate}
                onChange={(e) =>
                  setNewHomework({ ...newHomework, dueDate: e.target.value })
                }
                style={styles.input}
              />
              <input
                type="time"
                value={newHomework.dueTime}
                onChange={(e) =>
                  setNewHomework({ ...newHomework, dueTime: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button
                onClick={() => setShowForm(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleAddHomework} style={styles.submitBtn}>
                <FiSend size={16} /> Assign Homework
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Homework List */}
      <div style={styles.homeworkList}>
        {filteredHomeworks.map((homework, index) => {
          const submission = submissions[homework.id] || { status: "pending" };
          const statusBadge = getStatusBadge(submission.status);
          const isOverdue =
            new Date(homework.dueDate) < new Date() &&
            submission.status === "pending";

          return (
            <motion.div
              key={homework.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={styles.homeworkCard}
            >
              <div style={styles.homeworkHeader}>
                <div>
                  <h3 style={styles.homeworkTitle}>{homework.title}</h3>
                  <div style={styles.homeworkMeta}>
                    <span>
                      <FiCalendar size={12} /> Due: {homework.dueDate} by{" "}
                      {homework.dueTime}
                    </span>
                    <span>
                      <FiClock size={12} /> Posted: {homework.postedDate}
                    </span>
                    <span style={styles.subjectBadge}>{homework.subject}</span>
                    {isOverdue && (
                      <span style={styles.overdueBadge}>Overdue!</span>
                    )}
                  </div>
                </div>
                <div
                  style={styles.statusBadge}
                  className={`status-${submission.status}`}
                >
                  {statusBadge.icon}
                  <span>{statusBadge.text}</span>
                  {submission.marks && (
                    <span style={styles.marksBadge}>
                      Score: {submission.marks}%
                    </span>
                  )}
                </div>
              </div>

              <p style={styles.homeworkDescription}>{homework.description}</p>

              <div style={styles.homeworkFooter}>
                <div style={styles.attachments}>
                  {homework.attachments.map((att, i) => (
                    <button key={i} style={styles.attachmentBtn}>
                      <FiPaperclip size={12} /> {att}
                    </button>
                  ))}
                </div>

                {!isTeacher && submission.status === "pending" && (
                  <button
                    onClick={() => handleSubmitHomework(homework.id)}
                    style={styles.submitHomeworkBtn}
                  >
                    Submit Homework
                  </button>
                )}

                {isTeacher && submission.status === "submitted" && (
                  <div style={styles.gradeSection}>
                    <input
                      type="number"
                      placeholder="Marks %"
                      style={styles.gradeInput}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleGradeHomework(homework.id, e.target.value);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const marks = prompt("Enter marks (0-100)");
                        if (marks) handleGradeHomework(homework.id, marks);
                      }}
                      style={styles.gradeBtn}
                    >
                      Add Grade
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
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
    fontWeight: "500",
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
  },
  filterBtnActive: {
    backgroundColor: "#4f46e5",
    color: "white",
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
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
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
  homeworkList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  homeworkCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  homeworkHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  homeworkTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  homeworkMeta: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    fontSize: "12px",
    color: "#6b7280",
    flexWrap: "wrap",
  },
  subjectBadge: {
    padding: "2px 8px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "12px",
    fontSize: "11px",
  },
  overdueBadge: {
    padding: "2px 8px",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    borderRadius: "12px",
    fontSize: "11px",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  marksBadge: {
    marginLeft: "8px",
    padding: "2px 6px",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: "10px",
  },
  homeworkDescription: {
    color: "#4b5563",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  homeworkFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  attachments: {
    display: "flex",
    gap: "8px",
  },
  attachmentBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  submitHomeworkBtn: {
    padding: "8px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  gradeSection: {
    display: "flex",
    gap: "8px",
  },
  gradeInput: {
    padding: "6px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    width: "80px",
  },
  gradeBtn: {
    padding: "6px 12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default HomeworkPage;
