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
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUserPlus,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { format } from "date-fns";
import toast from "react-hot-toast";
import "../../../assets/styles/dashboard.css";

const TeacherDashboard = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeData, setGradeData] = useState({
    subject: "",
    score: "",
    term: "Term 1",
  });
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] =
    useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [attendanceRemarks, setAttendanceRemarks] = useState("");

  const todayDate = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
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
      toast.error("Please select a student and fill all grade fields");
      return;
    }
    toast.success(
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
    const key = `${selectedStudentForAttendance.id}_${todayDate}`;
    setAttendanceData({
      ...attendanceData,
      [key]: {
        status: attendanceStatus,
        remarks: attendanceRemarks,
        date: todayDate,
      },
    });
    toast.success(
      `Attendance marked as ${attendanceStatus.toUpperCase()} for ${selectedStudentForAttendance.name}`,
    );
    setShowAttendanceModal(false);
    setSelectedStudentForAttendance(null);
  };

  const getAttendanceStatusForToday = (studentId) => {
    const key = `${studentId}_${todayDate}`;
    return attendanceData[key]?.status || null;
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
      icon: <FiUsers size={isMobile ? 20 : 24} />,
      label: "Total Students",
      value: students.length,
      color: "#3b82f6",
      link: "/students",
    },
    {
      icon: <FiBookOpen size={isMobile ? 20 : 24} />,
      label: "Average Class Grade",
      value: "85%",
      color: "#10b981",
    },
    {
      icon: <FiCalendar size={isMobile ? 20 : 24} />,
      label: "Today's Attendance",
      value: "92%",
      color: "#8b5cf6",
    },
    {
      icon: <FiMessageSquare size={isMobile ? 20 : 24} />,
      label: "Pending Messages",
      value: "5",
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
          <h1 className="dashboard-title">Teacher Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.name || "Teacher"}! 👨‍🏫
          </p>
        </div>
        <div className="date-display">
          <FiCalendar size={isMobile ? 14 : 16} />
          <span>Today: {todayDate}</span>
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
        <h2 className="section-title">📋 My Students</h2>
        <div className="students-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Grade/Class</th>
                <th>Parent</th>
                <th>Attendance</th>
                <th>Avg Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const todayStatus = getAttendanceStatusForToday(student.id);
                return (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <p className="student-email">{student.email}</p>
                    </td>
                    <td>
                      {student.grade} • {student.class}
                    </td>
                    <td>
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
                          className="chat-parent-btn"
                        >
                          <FiMessageSquare size={14} /> Message
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-attendance">
                        Overall: {student.attendance}%
                      </span>
                      {todayStatus && (
                        <span
                          className={`badge badge-today status-${todayStatus}`}
                        >
                          Today: {todayStatus.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-grade">
                        {student.averageGrade}%
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="action-btn"
                          title="Add Grade"
                        >
                          <FiPlus size={16} />
                        </button>
                        <button
                          onClick={() => openAttendanceModal(student)}
                          className="action-btn"
                          title="Mark Attendance"
                        >
                          <FiCalendar size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedStudentForAttendance && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mark Attendance for {selectedStudentForAttendance.name}</h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="date-display-box">
                <FiCalendar /> {todayDate}
              </div>
              <div className="status-buttons">
                {["present", "absent", "late", "excused"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setAttendanceStatus(status)}
                    className={`status-btn ${attendanceStatus === status ? "active" : ""}`}
                    style={{
                      backgroundColor:
                        attendanceStatus === status
                          ? status === "present"
                            ? "#10b981"
                            : status === "absent"
                              ? "#ef4444"
                              : status === "late"
                                ? "#f59e0b"
                                : "#8b5cf6"
                          : "#f3f4f6",
                      color: attendanceStatus === status ? "white" : "#374151",
                    }}
                  >
                    {status === "present" && "✅ Present"}
                    {status === "absent" && "❌ Absent"}
                    {status === "late" && "⏰ Late"}
                    {status === "excused" && "📝 Excused"}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Remarks (optional)"
                rows="3"
                value={attendanceRemarks}
                onChange={(e) => setAttendanceRemarks(e.target.value)}
                className="textarea-field"
              ></textarea>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleMarkAttendance} className="btn-primary">
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Grade for {selectedStudent.name}</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Subject *"
                value={gradeData.subject}
                onChange={(e) =>
                  setGradeData({ ...gradeData, subject: e.target.value })
                }
                className="input-field"
              />
              <input
                type="number"
                placeholder="Score (%) *"
                value={gradeData.score}
                onChange={(e) =>
                  setGradeData({ ...gradeData, score: e.target.value })
                }
                className="input-field"
              />
              <select
                value={gradeData.term}
                onChange={(e) =>
                  setGradeData({ ...gradeData, term: e.target.value })
                }
                className="select-field"
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleAddGrade} className="btn-primary">
                Add Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
