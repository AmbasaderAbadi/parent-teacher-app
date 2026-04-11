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

const ParentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
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
    }
  }, [selectedChild]);

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

  const getGradeColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#3b82f6";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
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
      value: selectedChild ? `${selectedChild.averageGrade}%` : "--",
      color: "#10b981",
    },
    {
      icon: <FiCalendar size={isMobile ? 20 : 24} />,
      label: "Attendance",
      value: selectedChild ? `${selectedChild.attendance}%` : "--",
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
            Welcome back, {user?.name || "Parent"}! 👋
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
              <button className="export-btn">
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
