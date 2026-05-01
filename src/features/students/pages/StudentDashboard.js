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
import { gradesAPI, attendanceAPI } from "../../../services/api";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [studentUser, setStudentUser] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setStudentUser(userData);
      }

      await Promise.all([
        fetchGrades(),
        fetchAttendance(),
        fetchAchievements(),
      ]);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await gradesAPI.getMyGrades();
      // Backend returns { success: true, data: [...] }
      let gradesData = response.data?.data || response.data;
      if (!Array.isArray(gradesData)) gradesData = [];

      const formattedGrades = gradesData.map((grade) => {
        // Extract teacher name from nested teacherId object
        let teacherName = grade.teacherName;
        if (!teacherName && grade.teacherId) {
          if (typeof grade.teacherId === "object") {
            teacherName =
              `${grade.teacherId.firstName || ""} ${grade.teacherId.lastName || ""}`.trim();
          } else {
            teacherName = grade.teacherId;
          }
        }
        return {
          id: grade.id || grade._id,
          subject: grade.subject,
          score: grade.score,
          grade: grade.grade || calculateGradeLetter(grade.score),
          term: grade.term,
          teacher: teacherName,
          date:
            grade.date ||
            grade.assessmentDate?.split("T")[0] ||
            grade.createdAt?.split("T")[0],
        };
      });

      setGrades(formattedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGrades([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance();
      let attendanceData = response.data?.data || response.data;
      if (!Array.isArray(attendanceData)) attendanceData = [];

      const formattedAttendance = attendanceData.map((record) => ({
        date: record.date,
        status: record.status,
        checkIn: record.checkIn || formatTime(record.checkInTime),
        checkOut: record.checkOut || formatTime(record.checkOutTime),
      }));

      setAttendance(formattedAttendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance([]);
    }
  };

  const fetchAchievements = async () => {
    try {
      const avgGrade = calculateAverage();
      const attendanceRate = calculateAttendanceRate();
      const generatedAchievements = [];

      if (attendanceRate >= 90) {
        generatedAchievements.push({
          id: 1,
          title: "Perfect Attendance",
          description: `${attendanceRate}% attendance rate`,
          icon: "star",
        });
      }

      if (avgGrade >= 85) {
        generatedAchievements.push({
          id: 2,
          title: "Academic Excellence",
          description: `${avgGrade}% average grade`,
          icon: "award",
        });
      }

      setAchievements(generatedAchievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setAchievements([]);
    }
  };

  const calculateGradeLetter = (score) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "C-";
    return "F";
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((sum, g) => sum + g.score, 0);
    return (sum / grades.length).toFixed(1);
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "present").length;
    return ((present / attendance.length) * 100).toFixed(1);
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#3b82f6";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const handleExportReport = () => {
    if (grades.length === 0 && attendance.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const csvContent = [
      ["STUDENT PERFORMANCE REPORT"],
      ["Generated:", new Date().toLocaleString()],
      [""],
      ["GRADES"],
      ["Subject", "Score", "Grade", "Term", "Teacher", "Date"],
      ...grades.map((grade) => [
        grade.subject,
        grade.score,
        grade.grade,
        grade.term,
        grade.teacher,
        grade.date,
      ]),
      [""],
      ["SUMMARY"],
      ["Average Grade", `${calculateAverage()}%`],
      ["Attendance Rate", `${calculateAttendanceRate()}%`],
      ["Total Subjects", grades.length],
      [""],
      ["ATTENDANCE RECORD"],
      ["Date", "Status", "Check In", "Check Out"],
      ...attendance.map((record) => [
        record.date,
        record.status.toUpperCase(),
        record.checkIn,
        record.checkOut,
      ]),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
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
            Welcome back,{" "}
            {studentUser?.firstName || studentUser?.name || "Student"}! 🎓
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

      {grades.length > 0 ? (
        <>
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">📚 My Grades</h2>
              <button onClick={handleExportReport} className="export-btn">
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
                    />
                  </div>
                  <div className="chart-value">{grade.score}%</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="dashboard-section">
          <div className="empty-state">
            <p>No grades available yet.</p>
          </div>
        </div>
      )}

      {attendance.length > 0 ? (
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
      ) : (
        <div className="dashboard-section">
          <div className="empty-state">
            <p>No attendance records available yet.</p>
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">🏆 Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-card">
                {achievement.icon === "star" && (
                  <FiStar size={32} color="#f59e0b" />
                )}
                {achievement.icon === "award" && (
                  <FiAward size={32} color="#10b981" />
                )}
                {achievement.icon === "trending" && (
                  <FiTrendingUp size={32} color="#8b5cf6" />
                )}
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
