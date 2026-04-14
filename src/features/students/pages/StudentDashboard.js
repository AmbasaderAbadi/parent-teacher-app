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
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      let studentId = null;

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setStudentUser(userData);
        studentId = userData.studentId || userData.id;
      }

      // Fetch grades
      await fetchGrades(studentId);

      // Fetch attendance
      await fetchAttendance(studentId);

      // Fetch achievements (if endpoint exists)
      await fetchAchievements(studentId);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load data. Using demo data.");

      // Fallback to demo data
      setGrades([
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
      ]);

      setAttendance([
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
      ]);

      setAchievements([
        {
          id: 1,
          title: "Perfect Attendance",
          description: "90%+ attendance rate",
          icon: "star",
        },
        {
          id: 2,
          title: "Academic Excellence",
          description: "85%+ average grade",
          icon: "award",
        },
        {
          id: 3,
          title: "Most Improved",
          description: "15% grade improvement",
          icon: "trending",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async (studentId) => {
    try {
      // Use the "my grades" endpoint for the current student
      const response = await gradesAPI.getMyGrades();
      const gradesData = response.data;

      // Transform API data to match component structure
      const formattedGrades = gradesData.map((grade) => ({
        id: grade.id || grade._id,
        subject: grade.subject,
        score: grade.score,
        grade: grade.grade || calculateGradeLetter(grade.score),
        term: grade.term,
        teacher: grade.teacherName || grade.teacher,
        date: grade.date || grade.createdAt?.split("T")[0],
      }));

      setGrades(formattedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      throw error;
    }
  };

  const fetchAttendance = async (studentId) => {
    try {
      // Use the "my attendance" endpoint for the current student
      const response = await attendanceAPI.getMyAttendance();
      const attendanceData = response.data;

      // Transform API data to match component structure
      const formattedAttendance = attendanceData.map((record) => ({
        date: record.date,
        status: record.status,
        checkIn: record.checkIn || formatTime(record.checkInTime),
        checkOut: record.checkOut || formatTime(record.checkOutTime),
      }));

      setAttendance(formattedAttendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  };

  const fetchAchievements = async (studentId) => {
    try {
      // If achievements endpoint exists
      // const response = await studentsAPI.getAchievements(studentId);
      // setAchievements(response.data);

      // For now, generate achievements based on performance
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
      setAchievements([
        {
          id: 1,
          title: "Perfect Attendance",
          description: "90%+ attendance rate",
          icon: "star",
        },
        {
          id: 2,
          title: "Academic Excellence",
          description: "85%+ average grade",
          icon: "award",
        },
      ]);
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
    // Generate CSV export of grades and attendance
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
    {
      icon: <FiTrendingUp size={isMobile ? 20 : 24} />,
      label: "Class Rank",
      value: "12/45", // This would need a separate API endpoint
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
