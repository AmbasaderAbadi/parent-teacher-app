import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiMessageCircle,
  FiFile,
} from "react-icons/fi";
import { FaChild } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "../../../assets/styles/dashboard.css";
import {
  usersAPI,
  gradesAPI,
  attendanceAPI,
  materialsAPI,
  homeworkAPI,
  messagingAPI,
} from "../../../services/api";

const ParentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("grades");
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
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setParentUser(userData);
      }

      const response = await messagingAPI.getParentChildren();
      const childrenData = response.data?.data || response.data || [];
      const formattedChildren = childrenData.map((child) => ({
        id: child.studentId,
        studentId: child.studentId,
        name: child.studentName,
        grade: child.grade,
        class: child.className,
        phoneNumber: child.phoneNumber,
        teachers: child.teachers,
      }));
      setChildren(formattedChildren);
      if (formattedChildren.length > 0 && !selectedChild) {
        setSelectedChild(formattedChildren[0]);
      }
    } catch (error) {
      console.error("Error fetching parent data:", error);
      toast.error(t("failed_load_children_data"));
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildData = async (child) => {
    try {
      // 1. Grades
      let gradesData = [];
      try {
        const result = await gradesAPI.getStudentGrades(child.studentId);
        let allGrades = result.data?.data || result.data || [];
        if (!Array.isArray(allGrades)) allGrades = [];
        gradesData = allGrades.map((grade) => ({
          id: grade.id || grade._id,
          subject: grade.subject,
          score: grade.score,
          grade: grade.grade,
          term: grade.term,
          teacher: grade.teacherId?.firstName + " " + grade.teacherId?.lastName,
          teacherId: grade.teacherId?._id,
        }));
      } catch (error) {
        gradesData = [];
      }
      setGrades(gradesData);

      // 2. Attendance
      let attendanceData = [];
      try {
        const result = await attendanceAPI.getStudentAttendance(
          child.phoneNumber,
        );
        attendanceData = result.data?.data || result.data || [];
      } catch (error) {
        attendanceData = [];
      }
      setAttendance(attendanceData);

      // 3. Materials
      let materialsData = [];
      try {
        const response = await materialsAPI.getAllMaterials();
        let allMaterials = response.data?.data || response.data || [];
        if (!Array.isArray(allMaterials)) allMaterials = [];
        materialsData = allMaterials.filter(
          (material) =>
            material.grade === child.grade &&
            (!material.section || material.section === child.class),
        );
      } catch (error) {
        materialsData = [];
      }
      setMaterials(materialsData);

      // 4. Homework
      let homeworksData = [];
      try {
        const response = await homeworkAPI.getAllHomework();
        let allHomework = response.data?.data || response.data || [];
        if (!Array.isArray(allHomework)) allHomework = [];
        homeworksData = allHomework.filter(
          (hw) =>
            hw.grade === child.grade &&
            (!hw.className || hw.className === child.class),
        );
      } catch (error) {
        homeworksData = [];
      }
      setHomeworks(homeworksData);
    } catch (error) {
      console.error("Error fetching child data:", error);
      toast.error(t("failed_load_child_data"));
    }
  };

  const handleChatWithTeacher = (
    teacherId,
    teacherName,
    studentId,
    subject,
  ) => {
    const chatData = {
      teacherId,
      teacherName,
      studentId,
      subject,
      childName: selectedChild?.name,
    };
    localStorage.setItem("directChat", JSON.stringify(chatData));
    navigate("/messages");
  };

  const handleExportGrades = () => {
    if (!grades.length) {
      toast.error(t("no_grades_to_export"));
      return;
    }
    const csvContent = [
      [t("subject"), t("score"), t("grade_letter"), t("term"), t("teacher")],
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
    a.download = `${selectedChild?.name}_${t("grades")}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(t("grades_exported_success"));
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#3b82f6";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const calculateAverageGrade = () => {
    if (!grades.length) return 0;
    const sum = grades.reduce((total, g) => total + (g.score || 0), 0);
    return Math.round(sum / grades.length);
  };

  const calculateAttendanceRate = () => {
    if (!attendance.length) return 0;
    const present = attendance.filter((a) => a.status === "present").length;
    return Math.round((present / attendance.length) * 100);
  };

  const stats = [
    {
      icon: <FiUsers size={isMobile ? 20 : 24} />,
      label: t("total_children"),
      value: children.length,
      color: "#3b82f6",
    },
    {
      icon: <FiBookOpen size={isMobile ? 20 : 24} />,
      label: t("average_grade"),
      value: selectedChild ? `${calculateAverageGrade()}%` : "--",
      color: "#10b981",
    },
    {
      icon: <FiCalendar size={isMobile ? 20 : 24} />,
      label: t("attendance"),
      value: selectedChild ? `${calculateAttendanceRate()}%` : "--",
      color: "#8b5cf6",
    },
    {
      icon: <FiMessageSquare size={isMobile ? 20 : 24} />,
      label: t("messages"),
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
          <h1 className="dashboard-title">{t("parent_dashboard")}</h1>
          <p className="dashboard-subtitle">
            {t("welcome_back")}{" "}
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
        <h2 className="section-title">{t("my_children")}</h2>
        {children.length === 0 ? (
          <div className="empty-state">
            <p>{t("no_children_added")}</p>
            <p className="text-sm text-gray-400 mt-2">
              {t("children_will_appear")}
            </p>
          </div>
        ) : (
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
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {selectedChild && (
        <>
          <div className="dashboard-tabs" style={styles.tabs}>
            <button
              onClick={() => setActiveTab("grades")}
              className={`tab-btn ${activeTab === "grades" ? "active" : ""}`}
              style={activeTab === "grades" ? styles.activeTab : styles.tab}
            >
              📊 {t("grades")}
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
              style={activeTab === "attendance" ? styles.activeTab : styles.tab}
            >
              📅 {t("attendance")}
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
              style={activeTab === "materials" ? styles.activeTab : styles.tab}
            >
              📁 {t("materials")}
            </button>
            <button
              onClick={() => setActiveTab("homework")}
              className={`tab-btn ${activeTab === "homework" ? "active" : ""}`}
              style={activeTab === "homework" ? styles.activeTab : styles.tab}
            >
              📝 {t("homework")}
            </button>
          </div>

          {activeTab === "grades" && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">
                  📚 {selectedChild.name} {t("grades")}
                </h2>
                {grades.length > 0 && (
                  <button onClick={handleExportGrades} className="export-btn">
                    <FiDownload size={16} /> {t("export")}
                  </button>
                )}
              </div>
              {grades.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {t("no_grades_available", { name: selectedChild.name })}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grades-grid">
                    {grades.map((grade, idx) => (
                      <motion.div
                        key={grade.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
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
                              grade.teacherId,
                              grade.teacher,
                              selectedChild.studentId,
                              grade.subject,
                            )
                          }
                          className="chat-btn"
                        >
                          <FiMessageCircle size={16} /> {t("chat_with_teacher")}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  <div
                    className="chart-container"
                    style={{ marginTop: "24px" }}
                  >
                    <h3 className="section-title">
                      {t("performance_overview")}
                    </h3>
                    {grades.map((grade, idx) => (
                      <div key={idx} className="chart-bar">
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
                </>
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="dashboard-section">
              <h2 className="section-title">{t("attendance_record")}</h2>
              {attendance.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {t("no_attendance_records", { name: selectedChild.name })}
                  </p>
                </div>
              ) : (
                <div className="attendance-table-wrapper">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>{t("date")}</th>
                        <th>{t("status")}</th>
                        <th>{t("check_in")}</th>
                        <th>{t("check_out")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record, idx) => (
                        <tr key={idx}>
                          <td>{record.date}</td>
                          <td>
                            <span
                              className={`status-badge status-${record.status}`}
                            >
                              {record.status === "present" && (
                                <FiCheckCircle size={12} />
                              )}
                              {record.status === "late" && (
                                <FiClock size={12} />
                              )}
                              {record.status === "absent" && (
                                <FiCalendar size={12} />
                              )}
                              {record.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{record.checkIn || "-"}</td>
                          <td>{record.checkOut || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div className="dashboard-section">
              <h2 className="section-title">{t("learning_materials")}</h2>
              {materials.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {t("no_materials_available", { name: selectedChild.name })}
                  </p>
                </div>
              ) : (
                <div className="materials-list">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="material-card"
                      style={styles.materialCard}
                    >
                      <div style={styles.materialIcon}>
                        <FiFile size={24} />
                      </div>
                      <div style={styles.materialInfo}>
                        <h3>{material.title}</h3>
                        <p>{material.description}</p>
                        <p style={styles.materialMeta}>
                          {t("subject")}: {material.subject} • {t("uploaded")}:{" "}
                          {material.date}
                        </p>
                      </div>
                      <button
                        onClick={() => window.open(material.fileUrl, "_blank")}
                        style={styles.viewBtn}
                      >
                        {t("view")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "homework" && (
            <div className="dashboard-section">
              <h2 className="section-title">{t("homework_assignments")}</h2>
              {homeworks.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {t("no_homework_assigned", { name: selectedChild.name })}
                  </p>
                </div>
              ) : (
                <div className="homework-list">
                  {homeworks.map((hw) => (
                    <div
                      key={hw.id}
                      className="homework-card"
                      style={styles.homeworkCard}
                    >
                      <div>
                        <h3>{hw.title}</h3>
                        <p>{hw.description}</p>
                        <p style={styles.meta}>
                          {t("due")}: {hw.dueDate}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/homework/${hw.id}`)}
                        style={styles.viewBtn}
                      >
                        {t("view_details")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
  },
  tab: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTab: {
    padding: "8px 16px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4f46e5",
  },
  materialCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
  },
  materialIcon: {
    padding: "12px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    color: "#4f46e5",
  },
  materialInfo: { flex: 1 },
  materialMeta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  viewBtn: {
    padding: "6px 12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  homeworkCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "12px",
  },
  meta: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
};

export default ParentDashboard;
