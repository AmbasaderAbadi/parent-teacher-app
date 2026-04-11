import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiStar,
  FiDownload,
  FiBell,
  FiUsers,
} from "react-icons/fi";
import { FaChartLine, FaUserGraduate } from "react-icons/fa";

const StudentDashboard = ({ user }) => {
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo data
    setTimeout(() => {
      const demoGrades = [
        {
          id: 1,
          subject: "Mathematics",
          score: 85,
          grade: "A",
          term: "Term 1",
          teacher: "Mr. Smith",
          date: "2024-01-15",
        },
        {
          id: 2,
          subject: "Science",
          score: 78,
          grade: "B+",
          term: "Term 1",
          teacher: "Mrs. Johnson",
          date: "2024-01-14",
        },
        {
          id: 3,
          subject: "English",
          score: 92,
          grade: "A+",
          term: "Term 1",
          teacher: "Ms. Davis",
          date: "2024-01-13",
        },
        {
          id: 4,
          subject: "History",
          score: 88,
          grade: "A-",
          term: "Term 1",
          teacher: "Mr. Brown",
          date: "2024-01-12",
        },
        {
          id: 5,
          subject: "Physics",
          score: 82,
          grade: "B+",
          term: "Term 1",
          teacher: "Dr. Wilson",
          date: "2024-01-11",
        },
      ];

      const demoAttendance = [
        {
          date: "2024-01-15",
          status: "present",
          checkIn: "8:30 AM",
          checkOut: "3:30 PM",
        },
        {
          date: "2024-01-14",
          status: "present",
          checkIn: "8:25 AM",
          checkOut: "3:30 PM",
        },
        {
          date: "2024-01-13",
          status: "late",
          checkIn: "9:00 AM",
          checkOut: "3:30 PM",
        },
        {
          date: "2024-01-12",
          status: "present",
          checkIn: "8:28 AM",
          checkOut: "3:30 PM",
        },
        { date: "2024-01-11", status: "absent", checkIn: "-", checkOut: "-" },
        {
          date: "2024-01-10",
          status: "present",
          checkIn: "8:30 AM",
          checkOut: "3:30 PM",
        },
        {
          date: "2024-01-09",
          status: "present",
          checkIn: "8:32 AM",
          checkOut: "3:30 PM",
        },
      ];

      setGrades(demoGrades);
      setAttendance(demoAttendance);
      setLoading(false);
    }, 500);
  }, []);

  const calculateAverage = () => {
    const total = grades.reduce((sum, grade) => sum + grade.score, 0);
    return (total / grades.length).toFixed(1);
  };

  const calculateAttendanceRate = () => {
    const present = attendance.filter((a) => a.status === "present").length;
    return ((present / attendance.length) * 100).toFixed(1);
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#3b82f6";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    return "D";
  };

  const stats = [
    {
      icon: <FiBookOpen />,
      label: "Average Grade",
      value: `${calculateAverage()}%`,
      color: "#3b82f6",
    },
    {
      icon: <FiCalendar />,
      label: "Attendance Rate",
      value: `${calculateAttendanceRate()}%`,
      color: "#10b981",
    },
    {
      icon: <FiAward />,
      label: "Subjects",
      value: grades.length,
      color: "#8b5cf6",
    },
    {
      icon: <FiTrendingUp />,
      label: "Class Rank",
      value: "12/45",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.name || "Student"}! 🎓
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.notificationBtn}>
            <FiBell size={20} />
            <span style={styles.notificationBadge}>2</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={styles.statCard}
          >
            <div
              style={{ ...styles.statIcon, backgroundColor: `${stat.color}15` }}
            >
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div>
              <p style={styles.statValue}>{stat.value}</p>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grades Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={styles.section}
      >
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📚 My Grades</h2>
          <button style={styles.exportBtn}>
            <FiDownload size={16} /> Download Report
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
              <div>
                <h3 style={styles.gradeSubject}>{grade.subject}</h3>
                <p style={styles.gradeTeacher}>{grade.teacher}</p>
                <p style={styles.gradeTerm}>
                  {grade.term} • {grade.date}
                </p>
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
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={styles.section}
      >
        <h2 style={styles.sectionTitle}>📈 Performance Overview</h2>
        <div style={styles.chartContainer}>
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
      </motion.div>

      {/* Attendance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={styles.section}
      >
        <h2 style={styles.sectionTitle}>📅 Attendance Record</h2>
        <div style={styles.attendanceTable}>
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
                <tr key={index} style={styles.tableRow}>
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

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={styles.section}
      >
        <h2 style={styles.sectionTitle}>🏆 Achievements</h2>
        <div style={styles.achievementsGrid}>
          <div style={styles.achievementCard}>
            <FiStar size={32} color="#f59e0b" />
            <h4>Perfect Attendance</h4>
            <p>90%+ attendance rate</p>
          </div>
          <div style={styles.achievementCard}>
            <FiAward size={32} color="#10b981" />
            <h4>Academic Excellence</h4>
            <p>85%+ average grade</p>
          </div>
          <div style={styles.achievementCard}>
            <FiTrendingUp size={32} color="#8b5cf6" />
            <h4>Most Improved</h4>
            <p>15% grade improvement</p>
          </div>
        </div>
      </motion.div>
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
  headerActions: {
    position: "relative",
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
  gradesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  },
  gradeCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "transform 0.2s ease",
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
  chartContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  chartBar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  chartLabel: {
    width: "90px",
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
  attendanceTable: {
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
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  achievementsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  achievementCard: {
    textAlign: "center",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
};

export default StudentDashboard;
