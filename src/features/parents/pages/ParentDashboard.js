import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiStar,
  FiDownload,
  FiMail,
  FiBell,
  FiMessageCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaChild, FaChartLine, FaChalkboardTeacher } from "react-icons/fa";
import { format, subDays, addDays } from "date-fns";
import toast from "react-hot-toast";

const ParentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [loading, setLoading] = useState(true);

  // Demo data for parent
  useEffect(() => {
    setTimeout(() => {
      const demoChildren = [
        {
          id: 1,
          name: "John Doe",
          grade: "10th Grade",
          class: "Section A",
          teacher: "Mrs. Smith",
          attendance: 92,
          averageGrade: 85,
        },
        {
          id: 2,
          name: "Emma Doe",
          grade: "8th Grade",
          class: "Section B",
          teacher: "Mr. Johnson",
          attendance: 88,
          averageGrade: 78,
        },
      ];

      setChildren(demoChildren);
      setLoading(false);
    }, 500);
  }, []);

  // Generate attendance records for the selected date
  useEffect(() => {
    if (selectedChild) {
      // Generate random attendance for demo purposes
      // In real app, this would come from API based on selected date
      const getAttendanceForDate = (date) => {
        const dayOfWeek = new Date(date).getDay();
        // Weekend - no school
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return [];
        }

        // Generate attendance records for the selected month
        const records = [];
        const year = parseInt(date.split("-")[0]);
        const month = parseInt(date.split("-")[1]) - 1;

        for (let i = 1; i <= 15; i++) {
          const recordDate = new Date(year, month, i);
          if (recordDate <= new Date()) {
            const statuses = [
              "present",
              "present",
              "present",
              "present",
              "absent",
              "late",
            ];
            const randomStatus =
              statuses[Math.floor(Math.random() * statuses.length)];
            records.push({
              date: format(recordDate, "yyyy-MM-dd"),
              status: randomStatus,
              checkIn:
                randomStatus === "present"
                  ? "8:30 AM"
                  : randomStatus === "late"
                    ? "9:15 AM"
                    : "-",
              checkOut:
                randomStatus === "present" || randomStatus === "late"
                  ? "3:30 PM"
                  : "-",
            });
          }
        }
        return records;
      };

      setAttendance(getAttendanceForDate(selectedDate));
    }
  }, [selectedChild, selectedDate]);

  // Fetch grades when child is selected
  useEffect(() => {
    if (selectedChild) {
      const demoGrades = [
        {
          id: 1,
          subject: "Mathematics",
          score: 85,
          grade: "A",
          term: "Term 1",
          teacher: "Mr. Smith",
          teacherId: "teacher123",
          teacherAvatar: "MS",
        },
        {
          id: 2,
          subject: "Science",
          score: 78,
          grade: "B+",
          term: "Term 1",
          teacher: "Mrs. Johnson",
          teacherId: "teacher456",
          teacherAvatar: "MJ",
        },
        {
          id: 3,
          subject: "English",
          score: 92,
          grade: "A+",
          term: "Term 1",
          teacher: "Ms. Davis",
          teacherId: "teacher789",
          teacherAvatar: "MD",
        },
        {
          id: 4,
          subject: "History",
          score: 88,
          grade: "A-",
          term: "Term 1",
          teacher: "Mr. Brown",
          teacherId: "teacher101",
          teacherAvatar: "MB",
        },
        {
          id: 5,
          subject: "Physics",
          score: 82,
          grade: "B+",
          term: "Term 1",
          teacher: "Dr. Wilson",
          teacherId: "teacher102",
          teacherAvatar: "DW",
        },
      ];
      setGrades(demoGrades);
    }
  }, [selectedChild]);

  const handleChatWithTeacher = (teacherName, teacherId, subject) => {
    const chatData = {
      teacherName: teacherName,
      teacherId: teacherId,
      subject: subject,
      childName: selectedChild?.name,
    };
    localStorage.setItem("directChat", JSON.stringify(chatData));
    navigate("/messages");
    toast.success(`Opening chat with ${teacherName} about ${subject}`);
  };

  const handlePreviousDay = () => {
    setSelectedDate(format(subDays(new Date(selectedDate), 1), "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const tomorrow = addDays(new Date(selectedDate), 1);
    if (tomorrow <= new Date()) {
      setSelectedDate(format(tomorrow, "yyyy-MM-dd"));
    } else {
      toast.error("Cannot view future dates");
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return "#10b981";
    if (grade >= 80) return "#3b82f6";
    if (grade >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getAttendanceForSelectedDate = () => {
    return attendance.find((record) => record.date === selectedDate);
  };

  const selectedDayAttendance = getAttendanceForSelectedDate();

  const stats = [
    {
      icon: <FiUsers />,
      label: "Total Children",
      value: children.length,
      color: "#3b82f6",
      link: null,
    },
    {
      icon: <FiBookOpen />,
      label: "Average Grade",
      value: selectedChild ? `${selectedChild.averageGrade}%` : "--",
      color: "#10b981",
      link: null,
    },
    {
      icon: <FiCalendar />,
      label: "Overall Attendance",
      value: selectedChild ? `${selectedChild.attendance}%` : "--",
      color: "#8b5cf6",
      link: null,
    },
    {
      icon: <FiMessageSquare />,
      label: "Messages",
      value: "3",
      color: "#f59e0b",
      link: "/messages",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Parent Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.name || "Parent"}! 👋
          </p>
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

      {/* Child Selection */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Children</h2>
        <div style={styles.childSelector}>
          {children.map((child) => (
            <motion.button
              key={child.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedChild(child)}
              style={{
                ...styles.childCard,
                ...(selectedChild?.id === child.id
                  ? styles.childCardActive
                  : {}),
              }}
            >
              <FaChild
                size={32}
                style={{
                  color: selectedChild?.id === child.id ? "#4f46e5" : "#6b7280",
                }}
              />
              <div>
                <h3 style={styles.childName}>{child.name}</h3>
                <p style={styles.childInfo}>
                  {child.grade} • {child.class}
                </p>
                <p style={styles.childTeacher}>Teacher: {child.teacher}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedChild && (
        <>
          {/* Grades Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.section}
          >
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                📚 {selectedChild.name}'s Grades
              </h2>
              <button style={styles.exportBtn}>
                <FiDownload size={16} /> Export Report
              </button>
            </div>

            <div style={styles.gradesGrid}>
              {grades.map((grade, index) => (
                <motion.div
                  key={grade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={styles.gradeCard}
                >
                  <div style={styles.gradeInfo}>
                    <div>
                      <h3 style={styles.gradeSubject}>{grade.subject}</h3>
                      <p style={styles.gradeTeacher}>{grade.teacher}</p>
                      <p style={styles.gradeTerm}>{grade.term}</p>
                    </div>
                    <div style={styles.gradeScore}>
                      <span
                        style={{
                          ...styles.gradeValue,
                          color: getGradeColor(grade.score),
                        }}
                      >
                        {grade.score}%
                      </span>
                      <span style={styles.gradeLetter}>{grade.grade}</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleChatWithTeacher(
                        grade.teacher,
                        grade.teacherId,
                        grade.subject,
                      )
                    }
                    style={styles.chatButton}
                  >
                    <FiMessageCircle size={16} />
                    <span>Chat with Teacher</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Attendance Section with Date Picker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.section}
          >
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📅 Attendance Record</h2>
            </div>

            {/* Date Selector */}
            <div style={styles.dateSelector}>
              <button onClick={handlePreviousDay} style={styles.dateNavBtn}>
                <FiChevronLeft size={20} />
              </button>
              <div style={styles.dateDisplay}>
                <FiCalendar size={18} />
                <span style={styles.dateText}>
                  {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <button
                onClick={handleNextDay}
                style={{
                  ...styles.dateNavBtn,
                  ...(new Date(selectedDate) >= new Date()
                    ? styles.dateNavBtnDisabled
                    : {}),
                }}
                disabled={new Date(selectedDate) >= new Date()}
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            {/* Selected Day Attendance */}
            {selectedDayAttendance ? (
              <div style={styles.selectedDayCard}>
                <div style={styles.selectedDayStatus}>
                  <span
                    style={{
                      ...styles.largeStatusBadge,
                      backgroundColor:
                        selectedDayAttendance.status === "present"
                          ? "#d1fae5"
                          : selectedDayAttendance.status === "late"
                            ? "#fed7aa"
                            : "#fee2e2",
                      color:
                        selectedDayAttendance.status === "present"
                          ? "#065f46"
                          : selectedDayAttendance.status === "late"
                            ? "#92400e"
                            : "#991b1b",
                    }}
                  >
                    {selectedDayAttendance.status === "present" && (
                      <FiCheckCircle size={20} />
                    )}
                    {selectedDayAttendance.status === "late" && (
                      <FiClock size={20} />
                    )}
                    {selectedDayAttendance.status === "absent" && (
                      <FiCalendar size={20} />
                    )}
                    <span style={{ marginLeft: "8px" }}>
                      {selectedDayAttendance.status.toUpperCase()}
                    </span>
                  </span>
                  <div style={styles.selectedDayDetails}>
                    <p>
                      <strong>Check In:</strong> {selectedDayAttendance.checkIn}
                    </p>
                    <p>
                      <strong>Check Out:</strong>{" "}
                      {selectedDayAttendance.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.noAttendanceCard}>
                <p>No attendance record available for this date</p>
                {new Date(selectedDate) > new Date() && (
                  <p style={styles.futureDateMsg}>
                    Future dates cannot be viewed
                  </p>
                )}
                {(new Date(selectedDate).getDay() === 0 ||
                  new Date(selectedDate).getDay() === 6) && (
                  <p style={styles.weekendMsg}>Weekend - No school</p>
                )}
              </div>
            )}

            {/* Monthly Attendance Table */}
            <div style={styles.attendanceTable}>
              <h3 style={styles.monthlyTitle}>Monthly Attendance Overview</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr
                      key={index}
                      style={{
                        ...styles.tableRow,
                        ...(record.date === selectedDate
                          ? styles.selectedRow
                          : {}),
                      }}
                    >
                      <td style={styles.td}>{record.date}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              record.status === "present"
                                ? "#d1fae5"
                                : record.status === "late"
                                  ? "#fed7aa"
                                  : "#fee2e2",
                            color:
                              record.status === "present"
                                ? "#065f46"
                                : record.status === "late"
                                  ? "#92400e"
                                  : "#991b1b",
                          }}
                        >
                          {record.status === "present" && (
                            <FiCheckCircle size={12} />
                          )}
                          {record.status === "late" && <FiClock size={12} />}
                          {record.status === "absent" && (
                            <FiCalendar size={12} />
                          )}{" "}
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>{record.checkIn}</td>
                      <td style={styles.td}>{record.checkOut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Performance Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.section}
          >
            <h2 style={styles.sectionTitle}>📈 Performance Overview</h2>
            <div style={styles.chartContainer}>
              <div style={styles.chart}>
                {grades.map((grade, index) => (
                  <div key={index} style={styles.chartBar}>
                    <div style={styles.chartLabel}>{grade.subject}</div>
                    <div style={styles.chartBarContainer}>
                      <div
                        style={{
                          ...styles.chartBarFill,
                          width: `${grade.score}%`,
                          backgroundColor: getGradeColor(grade.score),
                        }}
                      ></div>
                    </div>
                    <div style={styles.chartValue}>{grade.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
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
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "20px",
  },
  childSelector: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  childCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: 1,
    minWidth: "250px",
  },
  childCardActive: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },
  childName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  childInfo: {
    fontSize: "13px",
    color: "#6b7280",
  },
  childTeacher: {
    fontSize: "12px",
    color: "#8b5cf6",
    marginTop: "4px",
  },
  gradesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "16px",
  },
  gradeCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "transform 0.2s ease",
  },
  gradeInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradeSubject: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  gradeTeacher: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "2px",
  },
  gradeTerm: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  gradeScore: {
    textAlign: "right",
  },
  gradeValue: {
    fontSize: "24px",
    fontWeight: "700",
  },
  gradeLetter: {
    fontSize: "14px",
    fontWeight: "600",
    marginLeft: "8px",
    color: "#6b7280",
  },
  chatButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "8px",
    color: "#4f46e5",
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: "100%",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  dateSelector: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  dateNavBtn: {
    padding: "8px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  dateNavBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  dateDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
  },
  dateText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  selectedDayCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
  },
  selectedDayStatus: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  largeStatusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
  },
  selectedDayDetails: {
    fontSize: "14px",
    color: "#374151",
  },
  noAttendanceCard: {
    backgroundColor: "#fef2f2",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    marginBottom: "24px",
    color: "#dc2626",
  },
  futureDateMsg: {
    fontSize: "12px",
    color: "#f59e0b",
    marginTop: "8px",
  },
  weekendMsg: {
    fontSize: "12px",
    color: "#8b5cf6",
    marginTop: "8px",
  },
  monthlyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#374151",
  },
  attendanceTable: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
  },
  selectedRow: {
    backgroundColor: "#eef2ff",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  chartContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  chart: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  chartBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  chartLabel: {
    width: "80px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  chartBarContainer: {
    flex: 1,
    height: "32px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    overflow: "hidden",
  },
  chartBarFill: {
    height: "100%",
    borderRadius: "8px",
    transition: "width 0.5s ease",
  },
  chartValue: {
    width: "50px",
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "right",
  },
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .chat-button:hover {
    background-color: #4f46e5;
    color: white;
    transform: translateY(-2px);
  }
  .grade-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .date-nav-btn:hover:not(:disabled) {
    background-color: #e5e7eb;
    transform: scale(1.05);
  }
`;
document.head.appendChild(styleSheet);

export default ParentDashboard;
