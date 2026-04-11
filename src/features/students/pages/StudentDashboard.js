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
} from "react-icons/fi";
import "../../../assets/styles/dashboard.css";

const StudentDashboard = ({ user }) => {
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
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
      ];
      setGrades(demoGrades);
      setAttendance(demoAttendance);
      setLoading(false);
    }, 500);
  }, []);

  const calculateAverage = () =>
    (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1);
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

  const stats = [
    {
      icon: <FiBookOpen size={isMobile ? 20 : 24} />,
      label: "Average Grade",
      value: `${calculateAverage()}%`,
      color: "#3b82f6",
    },
    {
      icon: <FiCalendar size={isMobile ? 20 : 24} />,
      label: "Attendance Rate",
      value: `${calculateAttendanceRate()}%`,
      color: "#10b981",
    },
    {
      icon: <FiAward size={isMobile ? 20 : 24} />,
      label: "Subjects",
      value: grades.length,
      color: "#8b5cf6",
    },
    {
      icon: <FiTrendingUp size={isMobile ? 20 : 24} />,
      label: "Class Rank",
      value: "12/45",
      color: "#f59e0b",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Student Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.name || "Student"}! 🎓
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div
              className="stat-icon"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">📚 My Grades</h2>
          <button className="export-btn">
            <FiDownload size={16} /> Download Report
          </button>
        </div>
        <div className="grades-grid">
          {grades.map((grade, index) => (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grade-card"
            >
              <div className="grade-info">
                <div>
                  <h3 className="grade-subject">{grade.subject}</h3>
                  <p className="grade-teacher">{grade.teacher}</p>
                  <p className="grade-term">{grade.term}</p>
                </div>
                <div className="grade-score">
                  <span
                    className="grade-value"
                    style={{ color: getGradeColor(grade.score) }}
                  >
                    {grade.score}%
                  </span>
                  <span className="grade-letter">{grade.grade}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">📈 Performance Overview</h2>
        <div className="chart-container">
          {grades.map((grade, index) => (
            <div key={index} className="chart-bar">
              <div className="chart-label">{grade.subject}</div>
              <div className="chart-bar-container">
                <div
                  className="chart-bar-fill"
                  style={{
                    width: `${grade.score}%`,
                    backgroundColor: getGradeColor(grade.score),
                  }}
                ></div>
              </div>
              <div className="chart-value">{grade.score}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">📅 Attendance Record</h2>
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>
                    <span className={`status-badge status-${record.status}`}>
                      {record.status === "present" && (
                        <FiCheckCircle size={12} />
                      )}
                      {record.status === "late" && <FiClock size={12} />}
                      {record.status === "absent" && <FiCalendar size={12} />}
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">🏆 Achievements</h2>
        <div className="achievements-grid">
          <div className="achievement-card">
            <FiStar size={32} color="#f59e0b" />
            <h4>Perfect Attendance</h4>
            <p>90%+ attendance rate</p>
          </div>
          <div className="achievement-card">
            <FiAward size={32} color="#10b981" />
            <h4>Academic Excellence</h4>
            <p>85%+ average grade</p>
          </div>
          <div className="achievement-card">
            <FiTrendingUp size={32} color="#8b5cf6" />
            <h4>Most Improved</h4>
            <p>15% grade improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
