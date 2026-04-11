import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiTrendingUp,
  FiAward,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiBell,
  FiClock,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaChartLine } from "react-icons/fa";
import { format } from "date-fns";

const TeacherDashboard = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeData, setGradeData] = useState({
    subject: "",
    score: "",
    term: "Term 1",
  });
  const [attendanceData, setAttendanceData] = useState({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] =
    useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [attendanceRemarks, setAttendanceRemarks] = useState("");
  const [loading, setLoading] = useState(true);

  // Today's date - fixed, cannot be changed
  const todayDate = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    // Demo data
    setTimeout(() => {
      const demoStudents = [
        {
          id: 1,
          name: "John Doe",
          grade: "10th",
          class: "Section A",
          email: "john@student.com",
          attendance: 92,
          averageGrade: 85,
          parentName: "Jane Doe",
          parentId: "parent123",
        },
        {
          id: 2,
          name: "Emma Smith",
          grade: "10th",
          class: "Section A",
          email: "emma@student.com",
          attendance: 88,
          averageGrade: 78,
          parentName: "John Smith",
          parentId: "parent456",
        },
        {
          id: 3,
          name: "Mike Johnson",
          grade: "10th",
          class: "Section A",
          email: "mike@student.com",
          attendance: 95,
          averageGrade: 92,
          parentName: "Sarah Johnson",
          parentId: "parent789",
        },
        {
          id: 4,
          name: "Sarah Williams",
          grade: "10th",
          class: "Section A",
          email: "sarah@student.com",
          attendance: 85,
          averageGrade: 81,
          parentName: "Robert Williams",
          parentId: "parent101",
        },
        {
          id: 5,
          name: "David Brown",
          grade: "10th",
          class: "Section A",
          email: "david@student.com",
          attendance: 90,
          averageGrade: 87,
          parentName: "Lisa Brown",
          parentId: "parent102",
        },
      ];
      setStudents(demoStudents);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddGrade = () => {
    if (!selectedStudent || !gradeData.subject || !gradeData.score) {
      alert("Please select a student and fill all grade fields");
      return;
    }

    alert(
      `Grade added for ${selectedStudent.name}: ${gradeData.subject} - ${gradeData.score}%`,
    );
    setGradeData({ subject: "", score: "", term: "Term 1" });
    setSelectedStudent(null);
  };

  const openAttendanceModal = (student) => {
    setSelectedStudentForAttendance(student);
    setAttendanceStatus("present");
    setAttendanceRemarks("");
    setShowAttendanceModal(true);
  };

  const handleMarkAttendance = () => {
    if (!selectedStudentForAttendance) return;

    const attendanceRecord = {
      studentId: selectedStudentForAttendance.id,
      studentName: selectedStudentForAttendance.name,
      date: todayDate,
      status: attendanceStatus,
      remarks: attendanceRemarks,
      markedBy: user?.name || "Teacher",
      timestamp: new Date().toISOString(),
    };

    // Store in attendanceData state
    const key = `${selectedStudentForAttendance.id}_${todayDate}`;
    setAttendanceData({
      ...attendanceData,
      [key]: attendanceRecord,
    });

    alert(
      `Attendance marked as ${attendanceStatus.toUpperCase()} for ${selectedStudentForAttendance.name} on ${todayDate}`,
    );

    setShowAttendanceModal(false);
    setSelectedStudentForAttendance(null);
  };

  const getAttendanceStatusForToday = (studentId) => {
    const key = `${studentId}_${todayDate}`;
    const record = attendanceData[key];
    if (record) {
      return record.status;
    }
    return null;
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case "present":
        return "#10b981";
      case "absent":
        return "#ef4444";
      case "late":
        return "#f59e0b";
      case "excused":
        return "#8b5cf6";
      default:
        return "#9ca3af";
    }
  };

  const handleChatWithParent = (parentName, parentId, studentName) => {
    const chatData = {
      teacherName: parentName,
      teacherId: parentId,
      subject: `Parent of ${studentName}`,
      childName: studentName,
    };
    localStorage.setItem("directChat", JSON.stringify(chatData));
    window.location.href = "/messages";
  };

  const stats = [
    {
      icon: <FiUsers />,
      label: "Total Students",
      value: students.length,
      color: "#3b82f6",
      link: "/students",
    },
    {
      icon: <FiBookOpen />,
      label: "Average Class Grade",
      value: "85%",
      color: "#10b981",
      link: null,
    },
    {
      icon: <FiCalendar />,
      label: "Today's Attendance",
      value: "92%",
      color: "#8b5cf6",
      link: null,
    },
    {
      icon: <FiMessageSquare />,
      label: "Pending Messages",
      value: "5",
      color: "#f59e0b",
      link: "/messages",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.name || "Teacher"}! 👨‍🏫
          </p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.dateDisplay}>
            <FiCalendar
              size={18}
              style={{ marginRight: "8px", color: "#6b7280" }}
            />
            <span style={styles.dateText}>Today: {todayDate}</span>
          </div>
          <button style={styles.notificationBtn}>
            <FiBell size={20} />
            <span style={styles.notificationBadge}>5</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => {
          const StatCard = (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={styles.statCard}
            >
              <div
                style={{
                  ...styles.statIcon,
                  backgroundColor: `${stat.color}15`,
                }}
              >
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            </motion.div>
          );

          if (stat.link) {
            return (
              <Link
                key={index}
                to={stat.link}
                style={{ textDecoration: "none" }}
              >
                {StatCard}
              </Link>
            );
          }
          return StatCard;
        })}
      </div>

      {/* Students List */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 My Students</h2>
        <div style={styles.studentsTable}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>Grade/Class</th>
                <th style={styles.th}>Parent</th>
                <th style={styles.th}>Attendance</th>
                <th style={styles.th}>Average Grade</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const todayStatus = getAttendanceStatusForToday(student.id);
                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={styles.tableRow}
                  >
                    <td style={styles.td}>
                      <div>
                        <strong>{student.name}</strong>
                        <p style={styles.studentEmail}>{student.email}</p>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {student.grade} • {student.class}
                    </td>
                    <td style={styles.td}>
                      <div>
                        <strong>{student.parentName}</strong>
                        <button
                          onClick={() =>
                            handleChatWithParent(
                              student.parentName,
                              student.parentId,
                              student.name,
                            )
                          }
                          style={styles.chatParentBtn}
                          title="Chat with Parent"
                        >
                          <FiMessageSquare size={14} /> Message
                        </button>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <span style={styles.attendanceBadge}>
                          Overall: {student.attendance}%
                        </span>
                        {todayStatus ? (
                          <div style={{ marginTop: "8px" }}>
                            <span
                              style={{
                                ...styles.todayBadge,
                                backgroundColor:
                                  getAttendanceStatusColor(todayStatus) + "20",
                                color: getAttendanceStatusColor(todayStatus),
                              }}
                            >
                              Today: {todayStatus.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div style={{ marginTop: "8px" }}>
                            <span style={styles.notMarkedBadge}>
                              Not marked yet
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.gradeBadge}>
                        {student.averageGrade}%
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          style={styles.actionBtn}
                          title="Add Grade"
                        >
                          <FiPlus size={16} />
                        </button>
                        <button
                          onClick={() => openAttendanceModal(student)}
                          style={{ ...styles.actionBtn, color: "#8b5cf6" }}
                          title="Mark Attendance for Today"
                        >
                          <FiCalendar size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal - No date picker, only today's date */}
      {showAttendanceModal && selectedStudentForAttendance && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.modal}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Mark Attendance for {selectedStudentForAttendance.name}</h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date (Today only)</label>
              <div style={styles.dateDisplayBox}>
                <FiCalendar size={18} />
                <span>{todayDate}</span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Attendance Status</label>
              <div style={styles.statusButtons}>
                <button
                  onClick={() => setAttendanceStatus("present")}
                  style={{
                    ...styles.statusBtn,
                    ...(attendanceStatus === "present"
                      ? styles.statusBtnActive
                      : {}),
                    backgroundColor:
                      attendanceStatus === "present" ? "#10b981" : "#f3f4f6",
                    color: attendanceStatus === "present" ? "white" : "#374151",
                  }}
                >
                  ✅ Present
                </button>
                <button
                  onClick={() => setAttendanceStatus("absent")}
                  style={{
                    ...styles.statusBtn,
                    ...(attendanceStatus === "absent"
                      ? styles.statusBtnActive
                      : {}),
                    backgroundColor:
                      attendanceStatus === "absent" ? "#ef4444" : "#f3f4f6",
                    color: attendanceStatus === "absent" ? "white" : "#374151",
                  }}
                >
                  ❌ Absent
                </button>
                <button
                  onClick={() => setAttendanceStatus("late")}
                  style={{
                    ...styles.statusBtn,
                    ...(attendanceStatus === "late"
                      ? styles.statusBtnActive
                      : {}),
                    backgroundColor:
                      attendanceStatus === "late" ? "#f59e0b" : "#f3f4f6",
                    color: attendanceStatus === "late" ? "white" : "#374151",
                  }}
                >
                  ⏰ Late
                </button>
                <button
                  onClick={() => setAttendanceStatus("excused")}
                  style={{
                    ...styles.statusBtn,
                    ...(attendanceStatus === "excused"
                      ? styles.statusBtnActive
                      : {}),
                    backgroundColor:
                      attendanceStatus === "excused" ? "#8b5cf6" : "#f3f4f6",
                    color: attendanceStatus === "excused" ? "white" : "#374151",
                  }}
                >
                  📝 Excused
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Remarks (Optional)</label>
              <textarea
                value={attendanceRemarks}
                onChange={(e) => setAttendanceRemarks(e.target.value)}
                placeholder="Add any remarks..."
                style={styles.textarea}
                rows={3}
              />
            </div>

            <button onClick={handleMarkAttendance} style={styles.submitBtn}>
              Save Attendance for {todayDate}
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Grade Modal */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.modal}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Add Grade for {selectedStudent.name}</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject</label>
              <input
                type="text"
                value={gradeData.subject}
                onChange={(e) =>
                  setGradeData({ ...gradeData, subject: e.target.value })
                }
                placeholder="Enter subject"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Score (%)</label>
              <input
                type="number"
                value={gradeData.score}
                onChange={(e) =>
                  setGradeData({ ...gradeData, score: e.target.value })
                }
                placeholder="Enter score"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Term</label>
              <select
                value={gradeData.term}
                onChange={(e) =>
                  setGradeData({ ...gradeData, term: e.target.value })
                }
                style={styles.select}
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>
            <button onClick={handleAddGrade} style={styles.submitBtn}>
              Add Grade
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
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  dateDisplay: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: "8px 12px",
    borderRadius: "8px",
  },
  dateText: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  dateDisplayBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#374151",
  },
  notificationBtn: {
    position: "relative",
    padding: "10px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
  },
  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "10px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "4px",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "20px",
  },
  studentsTable: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
  },
  studentEmail: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "2px",
  },
  chatParentBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "6px",
    padding: "4px 10px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  attendanceBadge: {
    display: "inline-block",
    padding: "4px 8px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
  },
  todayBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "500",
  },
  notMarkedBadge: {
    display: "inline-block",
    padding: "4px 8px",
    backgroundColor: "#fef3c7",
    color: "#d97706",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "500",
  },
  gradeBadge: {
    display: "inline-block",
    padding: "4px 8px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  actionBtn: {
    padding: "6px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  modal: {
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
  modalContent: {
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
    marginBottom: "20px",
  },
  closeBtn: {
    fontSize: "24px",
    cursor: "pointer",
    background: "none",
    border: "none",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  statusButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  statusBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  statusBtnActive: {
    transform: "scale(1.02)",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px",
  },
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .chat-parent-btn:hover {
    background-color: #4f46e5;
    color: white;
    transform: translateY(-1px);
  }
  .action-btn:hover {
    transform: scale(1.05);
    background-color: #e5e7eb;
  }
  .status-btn:hover {
    transform: scale(1.02);
  }
`;
document.head.appendChild(styleSheet);

export default TeacherDashboard;
