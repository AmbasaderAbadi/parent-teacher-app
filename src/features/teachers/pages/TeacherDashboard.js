import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiUser,
} from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";
import "../../../assets/styles/dashboard.css";
import {
  studentsAPI,
  gradesAPI,
  attendanceAPI,
  messagingAPI,
} from "../../../services/api";

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeData, setGradeData] = useState({
    studentId: "",
    subject: "",
    score: "",
    maxScore: 100,
    assessmentName: "",
    assessmentType: "other",
    term: "Term 1",
    academicYear: new Date().getFullYear().toString(),
    remarks: "",
    assessmentDate: new Date().toISOString().split("T")[0],
    feedback: "",
  });
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] =
    useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [attendanceRemarks, setAttendanceRemarks] = useState("");
  const [teacherUser, setTeacherUser] = useState(null);

  const todayDate = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setTeacherUser(userData);
      }

      // Fetch students with parent info using messaging endpoint
      const response = await messagingAPI.getTeacherStudents();
      const studentsData =
        response.data?.data?.students ||
        response.data?.data ||
        response.data ||
        [];
      const studentsList = Array.isArray(studentsData) ? studentsData : [];

      // Map to the format expected by the component
      const formattedStudents = await Promise.all(
        studentsList.map(async (item) => {
          // Fetch average grade for this student
          const avg = await fetchStudentAverage(item.studentId);
          return {
            id: item.studentId,
            name: item.studentName,
            grade: item.grade,
            class: item.className,
            phoneNumber: item.phoneNumber,
            email: `${item.studentName.replace(/\s/g, "")}@school.com`,
            attendance: 0,
            averageGrade: avg,
            parentName: item.parent?.parentName || "Parent",
            parentId: item.parent?.parentId,
            studentId: item.studentId, // ensure this is set
            lastMessage: item.lastMessage,
            unreadCount: item.unreadCount,
            conversationId: item.conversationId,
          };
        }),
      );

      setStudents(formattedStudents);
      await fetchTodayAttendance(formattedStudents);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      toast.error("Failed to load data");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAverage = async (studentId) => {
    try {
      const response = await gradesAPI.getStudentGrades(studentId);
      if (response.data?.summary?.averageScore) {
        return Math.round(parseFloat(response.data.summary.averageScore));
      }
      let grades = response.data?.data || response.data;
      if (!Array.isArray(grades)) grades = [];
      if (grades.length === 0) return 0;
      const scores = grades.map((g) => g.score);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return Math.round(avg);
    } catch (error) {
      console.error(`Error fetching average for student ${studentId}:`, error);
      return 0;
    }
  };

  const updateStudentAverage = async (studentId) => {
    const newAvg = await fetchStudentAverage(studentId);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, averageGrade: newAvg } : s,
      ),
    );
  };

  const handleAddGrade = async () => {
    if (!selectedStudent || !gradeData.subject || !gradeData.score) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        studentId: gradeData.studentId,
        subject: gradeData.subject,
        score: parseInt(gradeData.score),
        maxScore: gradeData.maxScore,
        assessmentName: gradeData.assessmentName || "General Assessment",
        assessmentType: gradeData.assessmentType || "other",
        term: gradeData.term,
        academicYear: gradeData.academicYear,
        remarks: gradeData.remarks || "",
        assessmentDate: gradeData.assessmentDate,
        feedback: gradeData.feedback || "",
      };

      await gradesAPI.createGrade(payload);
      toast.success(
        `Grade added for ${selectedStudent.name}: ${gradeData.subject} - ${gradeData.score}%`,
      );
      await updateStudentAverage(selectedStudent.id);
      setSelectedStudent(null);
      setGradeData({
        studentId: "",
        subject: teacherUser?.primarySubject || "",
        score: "",
        maxScore: 100,
        assessmentName: "",
        assessmentType: "other",
        term: "Term 1",
        academicYear: new Date().getFullYear().toString(),
        remarks: "",
        assessmentDate: new Date().toISOString().split("T")[0],
        feedback: "",
      });
    } catch (error) {
      console.error("Error adding grade:", error);
      toast.error(error.response?.data?.message || "Failed to add grade");
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setGradeData((prev) => ({
      ...prev,
      studentId: student.studentId,
      subject: teacherUser?.primarySubject || "",
      score: "",
      assessmentName: "",
      remarks: "",
      feedback: "",
      assessmentDate: new Date().toISOString().split("T")[0],
    }));
  };

  const fetchTodayAttendance = async (studentsList) => {
    if (!studentsList || studentsList.length === 0) return;
    try {
      const todayAttendance = {};
      for (const student of studentsList) {
        try {
          const response = await attendanceAPI.getStudentAttendance(
            student.phoneNumber,
          );
          const records = response.data?.data || response.data || [];
          const todayRecord = records.find(
            (record) => record.date?.split("T")[0] === todayDate,
          );
          if (todayRecord) {
            todayAttendance[`${student.id}_${todayDate}`] = {
              status: todayRecord.status,
              remarks: todayRecord.remarks,
              date: todayDate,
            };
          }
        } catch (error) {
          // No attendance for today – ignore
        }
      }
      setAttendanceData(todayAttendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };
  const openAttendanceModal = (student) => {
    setSelectedStudentForAttendance({
      ...student,
      phoneNumber: student.phoneNumber,
    });
    setAttendanceStatus("present");
    setAttendanceRemarks("");
    setShowAttendanceModal(true);
  };

  const handleMarkAttendance = async () => {
    if (!selectedStudentForAttendance) return;
    try {
      const payload = {
        phoneNumber: selectedStudentForAttendance.phoneNumber, // ✅ use phoneNumber
        status: attendanceStatus,
        type: "daily",
        period: "1st Period",
        remarks: attendanceRemarks || "",
      };
      await attendanceAPI.markAttendance(payload);
      await fetchTodayAttendance([selectedStudentForAttendance]);
      toast.success(
        `Attendance marked as ${attendanceStatus.toUpperCase()} for ${selectedStudentForAttendance.name}`,
      );
      setShowAttendanceModal(false);
      setSelectedStudentForAttendance(null);
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const getAttendanceStatusForToday = (studentId) => {
    const key = `${studentId}_${todayDate}`;
    return attendanceData[key]?.status || null;
  };

  const handleChatWithParent = (
    parentName,
    parentId,
    studentName,
    studentId,
  ) => {
    if (!studentId) {
      console.error("studentId is missing in handleChatWithParent");
      toast.error("Cannot start chat: missing student ID.");
      return;
    }
    const chatData = {
      teacherId: parentId,
      teacherName: parentName,
      studentId: studentId,
      childName: studentName,
      subject: `Parent of ${studentName}`,
    };
    localStorage.setItem("directChat", JSON.stringify(chatData));
    window.location.href = "/messages";
  };

  const calculateAverageClassGrade = () => {
    if (students.length === 0) return "0%";
    const sum = students.reduce((total, s) => total + (s.averageGrade || 0), 0);
    return `${Math.round(sum / students.length)}%`;
  };

  const calculateTodayAttendanceRate = () => {
    if (students.length === 0) return "0%";
    let presentCount = 0;
    students.forEach((s) => {
      if (getAttendanceStatusForToday(s.id) === "present") presentCount++;
    });
    return `${Math.round((presentCount / students.length) * 100)}%`;
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
      value: calculateAverageClassGrade(),
      color: "#10b981",
    },
    {
      icon: <FiCalendar size={isMobile ? 20 : 24} />,
      label: "Today's Attendance",
      value: calculateTodayAttendanceRate(),
      color: "#8b5cf6",
    },
    {
      icon: <FiMessageSquare size={isMobile ? 20 : 24} />,
      label: "Pending Messages",
      value: "0",
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
            Welcome back,{" "}
            {teacherUser?.firstName || teacherUser?.name || "Teacher"}! 👨‍🏫
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="date-display">
            <FiCalendar size={isMobile ? 14 : 16} />
            <span>Today: {todayDate}</span>
          </div>
          <Link to="/teacher/profile">
            <button className="profile-btn">
              <FiUser size={16} /> My Profile
            </button>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link || "#"} className="stat-link">
            <motion.div
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
          </Link>
        ))}
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">📋 My Students</h2>
        {students.length === 0 ? (
          <div className="empty-state">
            <p>No students assigned yet.</p>
          </div>
        ) : (
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
                        <div>
                          <strong>{student.name}</strong>
                          <div className="student-email">{student.email}</div>
                        </div>
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
                                student.studentId, // ✅ pass studentId
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
                            onClick={() => handleSelectStudent(student)}
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
        )}
      </div>

      {/* Attendance Modal (unchanged) */}
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
              />
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

      {/* Grade Modal (unchanged) */}
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
                disabled
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <input
                  type="number"
                  placeholder="Score (%) *"
                  value={gradeData.score}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, score: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Max Score"
                  value={gradeData.maxScore}
                  onChange={(e) =>
                    setGradeData({
                      ...gradeData,
                      maxScore: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                />
              </div>
              <input
                type="text"
                placeholder="Assessment Name (e.g., Midterm Exam)"
                value={gradeData.assessmentName}
                onChange={(e) =>
                  setGradeData({ ...gradeData, assessmentName: e.target.value })
                }
                className="input-field"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <select
                  value={gradeData.assessmentType}
                  onChange={(e) =>
                    setGradeData({
                      ...gradeData,
                      assessmentType: e.target.value,
                    })
                  }
                  className="select-field"
                >
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="other">Other</option>
                </select>
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="Academic Year"
                  value={gradeData.academicYear}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, academicYear: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  type="date"
                  placeholder="Assessment Date"
                  value={gradeData.assessmentDate}
                  onChange={(e) =>
                    setGradeData({
                      ...gradeData,
                      assessmentDate: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>
              <textarea
                placeholder="Remarks (optional)"
                rows="2"
                value={gradeData.remarks}
                onChange={(e) =>
                  setGradeData({ ...gradeData, remarks: e.target.value })
                }
                className="textarea-field"
              />
              <textarea
                placeholder="Feedback (optional)"
                rows="2"
                value={gradeData.feedback}
                onChange={(e) =>
                  setGradeData({ ...gradeData, feedback: e.target.value })
                }
                className="textarea-field"
              />
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
