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
  FiMessageCircle,
} from "react-icons/fi";
import { FaChild, FaChartLine } from "react-icons/fa";
import toast from "react-hot-toast";
import "../../../assets/styles/dashboard.css";
import { studentsAPI } from "../../../services/api";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [parentUser, setParentUser] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setParentUser(userData);
      }

      // Fetch children data from API
      // Assuming the parent has children IDs in their profile
      // You may need to adjust this based on your API structure
      const childrenData = await fetchParentChildren();
      setChildren(childrenData);
    } catch (error) {
      console.error("Error fetching parent data:", error);
      toast.error("Failed to load data. Using demo data.");

      // Fallback to demo data
      setChildren([
        {
          id: 1,
          name: "John Doe",
          grade: "10th Grade",
          class: "Section A",
          teacher: "Mrs. Smith",
          attendance: 92,
          averageGrade: 85,
          studentId: "student123",
        },
        {
          id: 2,
          name: "Emma Doe",
          grade: "8th Grade",
          class: "Section B",
          teacher: "Mr. Johnson",
          attendance: 88,
          averageGrade: 78,
          studentId: "student456",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentChildren = async () => {
    // This function should fetch the parent's children
    // You may need to create a specific endpoint for this
    // For now, we'll use a mock implementation
    try {
      // If your API has an endpoint to get parent's children
      // const response = await parentAPI.getChildren();
      // return response.data;

      // Temporary mock data
      return [
        {
          id: 1,
          name: "John Doe",
          grade: "10th Grade",
          class: "Section A",
          teacher: "Mrs. Smith",
          attendance: 92,
          averageGrade: 85,
          studentId: "student123",
        },
        {
          id: 2,
          name: "Emma Doe",
          grade: "8th Grade",
          class: "Section B",
          teacher: "Mr. Johnson",
          attendance: 88,
          averageGrade: 78,
          studentId: "student456",
        },
      ];
    } catch (error) {
      console.error("Error fetching children:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild.studentId || selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildData = async (studentId) => {
    try {
      // Fetch grades for the selected student
      const gradesResponse = await studentsAPI.getStudentProfile(studentId);
      // You may need to adjust based on your actual API response structure
      const studentData = gradesResponse.data;

      // Fetch grades - you may need a specific grades endpoint
      // For now, using the gradesAPI that we'll create
      let gradesData = [];
      try {
        const gradesResponse = await import("../../../services/api").then(
          (module) => module.gradesAPI,
        );
        const result = await gradesResponse.getStudentGrades(studentId);
        gradesData = result.data;
      } catch (error) {
        console.log("Using demo grades data");
        gradesData = [
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
      }

      // Fetch attendance
      let attendanceData = [];
      try {
        const { attendanceAPI } = await import("../../../services/api");
        const result = await attendanceAPI.getStudentAttendance(studentId);
        attendanceData = result.data;
      } catch (error) {
        console.log("Using demo attendance data");
        attendanceData = [
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
      }

      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching child data:", error);
      toast.error("Failed to load child data");
    }
  };

  const handleChatWithTeacher = (teacherName, teacherId, subject) => {
    const chatData = {
      teacherName,
      teacherId,
      subject,
      childName: selectedChild?.name,
    };
    localStorage.setItem("directChat", JSON.stringify(chatData));
    navigate("/messages");
    toast.success(`Opening chat with ${teacherName} about ${subject}`);
  };

  const handleExportGrades = () => {
    // Generate CSV export of grades
    const csvContent = [
      ["Subject", "Score", "Grade", "Term", "Teacher"],
      ...grades.map((grade) => [
        grade.subject,
        grade.score,
        grade.grade,
        grade.term,
        grade.teacher,
      ]),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedChild?.name}_grades_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Grades exported successfully!");
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#3b82f6";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((total, grade) => total + grade.score, 0);
    return Math.round(sum / grades.length);
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(
      (a) => a.status === "present",
    ).length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  const stats = [
    {
      icon: <FiUsers size={isMobile ? 20 : 24} />,
      label: "Total Children",
      value: children.length,
      color: "#3b82f6",
    },
    {
      icon: <FiBookOpen size={isMobile ? 20 : 24} />,
      label: "Average Grade",
      value: selectedChild ? `${calculateAverageGrade()}%` : "--",
      color: "#10b981",
    },
    {
      icon: <FiCalendar size={isMobile ? 20 : 24} />,
      label: "Attendance",
      value: selectedChild ? `${calculateAttendanceRate()}%` : "--",
      color: "#8b5cf6",
    },
    {
      icon: <FiMessageSquare size={isMobile ? 20 : 24} />,
      label: "Messages",
      value: "3",
      color: "#f59e0b",
      link: "/messages",
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
          <h1 className="dashboard-title">Parent Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back,{" "}
            {parentUser?.firstName || parentUser?.name || "Parent"}! 👋
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const StatCard = (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div
                className="stat-icon"
                style={{
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            </motion.div>
          );
          return stat.link ? (
            <Link key={index} to={stat.link} className="stat-link">
              {StatCard}
            </Link>
          ) : (
            StatCard
          );
        })}
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">My Children</h2>
        <div className="children-grid">
          {children.map((child) => (
            <motion.button
              key={child.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedChild(child)}
              className={`child-card ${selectedChild?.id === child.id ? "active" : ""}`}
            >
              <FaChild size={isMobile ? 28 : 32} className="child-icon" />
              <div className="child-info">
                <h3 className="child-name">{child.name}</h3>
                <p className="child-meta">
                  {child.grade} • {child.class}
                </p>
                <p className="child-teacher">Teacher: {child.teacher}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedChild && (
        <>
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">
                📚 {selectedChild.name}'s Grades
              </h2>
              <button onClick={handleExportGrades} className="export-btn">
                <FiDownload size={16} /> Export
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
                  <button
                    onClick={() =>
                      handleChatWithTeacher(
                        grade.teacher,
                        grade.teacherId,
                        grade.subject,
                      )
                    }
                    className="chat-btn"
                  >
                    <FiMessageCircle size={16} /> Chat with Teacher
                  </button>
                </motion.div>
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
                        <span
                          className={`status-badge status-${record.status}`}
                        >
                          {record.status === "present" && (
                            <FiCheckCircle size={12} />
                          )}
                          {record.status === "late" && <FiClock size={12} />}
                          {record.status === "absent" && (
                            <FiCalendar size={12} />
                          )}
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
        </>
      )}
    </div>
  );
};

export default ParentDashboard;
