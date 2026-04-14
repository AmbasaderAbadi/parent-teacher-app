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
import { homeworkAPI } from "../../../services/api";

const HomeworkPage = ({ user: propUser }) => {
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    } else if (propUser) {
      setUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    if (user) {
      fetchHomeworks();
    }
  }, [user]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      let response;

      if (user?.role === "teacher") {
        // Teacher sees all homework they created
        response = await homeworkAPI.getMyHomework();
      } else if (user?.role === "student") {
        // Student sees homework for their class
        response = await homeworkAPI.getMyHomework();
      } else if (user?.role === "parent") {
        // Parent sees homework for their children
        response = await homeworkAPI.getMyHomework();
      } else {
        response = { data: [] };
      }

      const homeworkData = response.data;

      // Transform API data to match component structure
      const formattedHomeworks = homeworkData.map((hw) => ({
        id: hw.id || hw._id,
        title: hw.title,
        description: hw.description,
        subject: hw.subject,
        dueDate: hw.dueDate?.split("T")[0] || hw.dueDate,
        dueTime: hw.dueTime || "23:59",
        postedBy: hw.postedBy || hw.teacherName,
        postedDate: hw.createdAt
          ? new Date(hw.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        attachments: hw.attachments || [],
        class: hw.className || hw.grade,
      }));

      setHomeworks(formattedHomeworks);

      // Fetch submissions for each homework (for teachers)
      if (user?.role === "teacher") {
        await fetchAllSubmissions(formattedHomeworks);
      } else {
        // For students/parents, fetch their submissions
        await fetchMySubmissions(formattedHomeworks);
      }
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      toast.error("Failed to load homework. Using demo data.");

      // Fallback to demo data
      const demoHomeworks = [
        {
          id: 1,
          title: "Mathematics Assignment - Algebra",
          description:
            "Solve problems from Chapter 5 (Algebraic Expressions). Complete exercises 5.1 to 5.3.",
          subject: "Mathematics",
          dueDate: "2024-04-10",
          dueTime: "23:59",
          postedBy: "Mr. Smith",
          postedDate: "2024-04-01",
          attachments: ["worksheet.pdf"],
          class: "Grade 10A",
        },
        {
          id: 2,
          title: "Science Project - Solar System",
          description: "Create a 3D model of the solar system.",
          subject: "Science",
          dueDate: "2024-04-15",
          dueTime: "23:59",
          postedBy: "Mrs. Johnson",
          postedDate: "2024-04-02",
          attachments: [],
          class: "Grade 10A",
        },
      ];
      setHomeworks(demoHomeworks);

      // Demo submissions
      const demoSubmissions = {
        1: { status: "pending", submittedDate: null, marks: null },
        2: { status: "submitted", submittedDate: "2024-04-05", marks: null },
      };
      setSubmissions(demoSubmissions);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubmissions = async (homeworksList) => {
    const submissionsMap = {};
    for (const hw of homeworksList) {
      try {
        const response = await homeworkAPI.getSubmissions(hw.id);
        submissionsMap[hw.id] = {
          submissions: response.data,
          status: "submitted",
        };
      } catch (error) {
        console.log(`No submissions for homework ${hw.id}`);
      }
    }
    // For demo, set pending status
    homeworksList.forEach((hw) => {
      if (!submissionsMap[hw.id]) {
        submissionsMap[hw.id] = {
          status: "pending",
          submittedDate: null,
          marks: null,
        };
      }
    });
    setSubmissions(submissionsMap);
  };

  const fetchMySubmissions = async (homeworksList) => {
    const submissionsMap = {};
    for (const hw of homeworksList) {
      try {
        const response = await homeworkAPI.getMySubmission(hw.id);
        const submission = response.data;
        submissionsMap[hw.id] = {
          status: submission.status || "submitted",
          submittedDate: submission.submittedDate,
          marks: submission.marks,
          feedback: submission.feedback,
        };
      } catch (error) {
        submissionsMap[hw.id] = {
          status: "pending",
          submittedDate: null,
          marks: null,
        };
      }
    }
    setSubmissions(submissionsMap);
  };

  const handleAddHomework = async () => {
    if (
      !newHomework.title ||
      !newHomework.description ||
      !newHomework.subject
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const homeworkData = {
        title: newHomework.title,
        description: newHomework.description,
        subject: newHomework.subject,
        dueDate: newHomework.dueDate,
        dueTime: newHomework.dueTime,
        className: newHomework.class,
        attachments: newHomework.attachments,
      };

      const response = await homeworkAPI.createHomework(homeworkData);
      const newHomeworkItem = response.data;

      const formattedHomework = {
        id: newHomeworkItem.id || newHomeworkItem._id,
        title: newHomework.title,
        description: newHomework.description,
        subject: newHomework.subject,
        dueDate: newHomework.dueDate,
        dueTime: newHomework.dueTime,
        postedBy: user?.name,
        postedDate: format(new Date(), "yyyy-MM-dd"),
        attachments: [],
        class: newHomework.class,
      };

      setHomeworks([formattedHomework, ...homeworks]);
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
    } catch (error) {
      console.error("Error creating homework:", error);
      toast.error(error.response?.data?.message || "Failed to assign homework");
    }
  };

  const handleSubmitHomework = async (homeworkId) => {
    setSubmitting(true);
    try {
      // You can add file upload here
      const submissionData = {
        homeworkId: homeworkId,
        content: "Homework submitted", // Add actual submission content
        submittedAt: new Date().toISOString(),
      };

      const response = await homeworkAPI.submitHomework(
        homeworkId,
        submissionData,
      );

      setSubmissions({
        ...submissions,
        [homeworkId]: {
          status: "submitted",
          submittedDate: format(new Date(), "yyyy-MM-dd"),
          marks: null,
        },
      });
      toast.success("Homework submitted successfully!");
    } catch (error) {
      console.error("Error submitting homework:", error);
      toast.error(error.response?.data?.message || "Failed to submit homework");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeHomework = async (homeworkId, marks) => {
    try {
      // Get the submission ID first
      const submissionResponse = await homeworkAPI.getMySubmission(homeworkId);
      const submissionId = submissionResponse.data.id;

      await homeworkAPI.gradeSubmission(submissionId, {
        marks: parseInt(marks),
      });

      setSubmissions({
        ...submissions,
        [homeworkId]: {
          ...submissions[homeworkId],
          status: "graded",
          marks: parseInt(marks),
        },
      });
      toast.success("Grade added successfully!");
    } catch (error) {
      console.error("Error grading homework:", error);
      toast.error(error.response?.data?.message || "Failed to add grade");
    }
  };

  const handleDeleteHomework = async (homeworkId) => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      try {
        await homeworkAPI.deleteHomework(homeworkId);
        setHomeworks(homeworks.filter((h) => h.id !== homeworkId));
        toast.success("Homework deleted successfully!");
      } catch (error) {
        console.error("Error deleting homework:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete homework",
        );
      }
    }
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading homework...</p>
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
      {subjects.length > 1 && (
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
      )}

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
                <option>Grade 11A</option>
                <option>Grade 11B</option>
                <option>Grade 12A</option>
                <option>Grade 12B</option>
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
        {filteredHomeworks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No homework assignments found.</p>
            {isTeacher && (
              <p style={styles.emptyStateSubtext}>
                Click "Assign Homework" to create one.
              </p>
            )}
          </div>
        ) : (
          filteredHomeworks.map((homework, index) => {
            const submission = submissions[homework.id] || {
              status: "pending",
            };
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
                      <span style={styles.subjectBadge}>
                        {homework.subject}
                      </span>
                      {isOverdue && (
                        <span style={styles.overdueBadge}>Overdue!</span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                    }}
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
                    {homework.attachments &&
                      homework.attachments.map((att, i) => (
                        <button key={i} style={styles.attachmentBtn}>
                          <FiPaperclip size={12} /> {att}
                        </button>
                      ))}
                  </div>

                  <div style={styles.actionButtons}>
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteHomework(homework.id)}
                        style={styles.deleteBtn}
                        title="Delete Homework"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}

                    {!isTeacher && submission.status === "pending" && (
                      <button
                        onClick={() => handleSubmitHomework(homework.id)}
                        style={styles.submitHomeworkBtn}
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit Homework"}
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
                            if (marks && marks >= 0 && marks <= 100) {
                              handleGradeHomework(homework.id, marks);
                            } else if (marks) {
                              toast.error(
                                "Please enter marks between 0 and 100",
                              );
                            }
                          }}
                          style={styles.gradeBtn}
                        >
                          Add Grade
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
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
    transition: "all 0.2s ease",
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
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    fontFamily: "inherit",
    resize: "vertical",
    fontSize: "14px",
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
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
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
    flexWrap: "wrap",
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
  actionButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  deleteBtn: {
    padding: "8px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
    transition: "all 0.2s ease",
  },
  submitHomeworkBtn: {
    padding: "8px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptyStateSubtext: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#d1d5db",
  },
};

export default HomeworkPage;
