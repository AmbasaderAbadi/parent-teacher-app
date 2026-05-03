import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useTranslation } from "react-i18next";
import "../../../assets/styles/dashboard.css";
import QuizGenerator from "../components/QuizGenerator";
import {
  studentsAPI,
  gradesAPI,
  attendanceAPI,
  messagingAPI,
} from "../../../services/api";

const TeacherDashboard = () => {
  const { t } = useTranslation();
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
  const navigate = useNavigate();
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

      const response = await messagingAPI.getTeacherStudents();
      const studentsData =
        response.data?.data?.students ||
        response.data?.data ||
        response.data ||
        [];
      const studentsList = Array.isArray(studentsData) ? studentsData : [];

      const formattedStudents = await Promise.all(
        studentsList.map(async (item) => {
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
            studentId: item.studentId,
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
      toast.error(t("failed_load_data"));
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
      toast.error(t("required_field"));
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
      toast.success(t("grade_added_success"));
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
      toast.error(error.response?.data?.message || t("grade_update_failed"));
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
        phoneNumber: selectedStudentForAttendance.phoneNumber,
        status: attendanceStatus,
        type: "daily",
        period: "1st Period",
        remarks: attendanceRemarks || "",
      };
      await attendanceAPI.markAttendance(payload);
      await fetchTodayAttendance([selectedStudentForAttendance]);
      toast.success(t("attendance_marked_success"));
      setShowAttendanceModal(false);
      setSelectedStudentForAttendance(null);
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error(
        error.response?.data?.message || t("attendance_marked_failed"),
      );
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
      toast.error(t("something_wrong"));
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
    navigate("/messages");
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
      label: t("total_students"),
      value: students.length,
      color: "#3b82f6",
      link: "/students",
    },
    {
      icon: <FiBookOpen size={isMobile ? 20 : 24} />,
      label: t("average_class_grade"),
      value: calculateAverageClassGrade(),
      color: "#10b981",
    },
    {
      icon: <FiCalendar size={isMobile ? 20 : 24} />,
      label: t("todays_attendance"),
      value: calculateTodayAttendanceRate(),
      color: "#8b5cf6",
    },
    {
      icon: <FiMessageSquare size={isMobile ? 20 : 24} />,
      label: t("pending_messages"),
      value: "0",
      color: "#f59e0b",
      link: "/messages",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t("loading_dashboard")}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t("teacher_dashboard")}</h1>
          <p className="dashboard-subtitle">
            {t("welcome_back")}{" "}
            {teacherUser?.firstName || teacherUser?.name || "Teacher"}! 👨‍🏫
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="date-display">
            <FiCalendar size={isMobile ? 14 : 16} />
            <span>
              {t("today")}: {todayDate}
            </span>
          </div>
          <Link to="/teacher/profile">
            <button className="profile-btn">
              <FiUser size={16} /> {t("my_profile")}
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
        <h2 className="section-title">{t("my_students")}</h2>
        {students.length === 0 ? (
          <div className="empty-state">
            <p>{t("no_students_assigned")}</p>
          </div>
        ) : (
          <div className="students-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("student_name")}</th>
                  <th>{t("grade_class")}</th>
                  <th>{t("parent")}</th>
                  <th>{t("attendance")}</th>
                  <th>{t("avg_grade")}</th>
                  <th>{t("actions")}</th>
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
                                student.studentId,
                              )
                            }
                            className="chat-parent-btn"
                          >
                            <FiMessageSquare size={14} /> {t("message")}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-attendance">
                          {t("overall")}: {student.attendance}%
                        </span>
                        {todayStatus && (
                          <span
                            className={`badge badge-today status-${todayStatus}`}
                          >
                            {t("today")}: {todayStatus.toUpperCase()}
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
                            title={t("add_grade")}
                          >
                            <FiPlus size={16} />
                          </button>
                          <button
                            onClick={() => openAttendanceModal(student)}
                            className="action-btn"
                            title={t("mark_attendance")}
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

      {/* Attendance Modal */}
      {showAttendanceModal && selectedStudentForAttendance && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {t("mark_attendance")} {selectedStudentForAttendance.name}
              </h3>
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
                placeholder={t("remarks_optional")}
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
                {t("cancel")}
              </button>
              <button onClick={handleMarkAttendance} className="btn-primary">
                {t("save_attendance")}
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
              <h3>
                {t("add_grade")} {selectedStudent.name}
              </h3>
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
                placeholder={t("subject")}
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
                  placeholder={t("score_percent")}
                  value={gradeData.score}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, score: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder={t("max_score")}
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
                placeholder={t("assessment_name")}
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
                  <option value="midterm">{t("midterm")}</option>
                  <option value="final">{t("final")}</option>
                  <option value="quiz">{t("quiz")}</option>
                  <option value="assignment">{t("assignment")}</option>
                  <option value="other">{t("other")}</option>
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
                  placeholder={t("academic_year")}
                  value={gradeData.academicYear}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, academicYear: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  type="date"
                  placeholder={t("assessment_date")}
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
                placeholder={t("remarks_optional")}
                rows="2"
                value={gradeData.remarks}
                onChange={(e) =>
                  setGradeData({ ...gradeData, remarks: e.target.value })
                }
                className="textarea-field"
              />
              <textarea
                placeholder={t("feedback_optional")}
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
                {t("cancel")}
              </button>
              <button onClick={handleAddGrade} className="btn-primary">
                {t("save_grade")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
