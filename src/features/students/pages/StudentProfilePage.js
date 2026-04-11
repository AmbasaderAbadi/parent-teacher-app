import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiAlertCircle,
  FiHeart,
  FiBookOpen,
  FiUsers,
  FiAward,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";

const StudentProfilePage = ({ user, studentId: propStudentId }) => {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
    }
  }, []);

  useEffect(() => {
    // Demo student data - In real app, fetch from API
    setTimeout(() => {
      const demoStudent = {
        id: propStudentId || "STU001",
        name: "John Doe",
        email: "john.doe@student.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, Springfield, IL 62701",
        dateOfBirth: "2010-05-15",
        grade: "10th Grade",
        class: "Section A",
        rollNumber: "10A-001",
        bloodGroup: "O+",
        allergies: "None",
        medicalConditions: "None",
        emergencyContact: {
          name: "Jane Doe",
          relationship: "Mother",
          phone: "+1 (555) 987-6543",
        },
        parentInfo: {
          fatherName: "John Doe Sr.",
          motherName: "Jane Doe",
          fatherPhone: "+1 (555) 111-2222",
          motherPhone: "+1 (555) 333-4444",
          email: "parent@example.com",
        },
        achievements: [
          "🥇 Math Olympiad Winner 2023",
          "🏆 Science Fair 1st Place",
          "⭐ Perfect Attendance Award",
          "📚 Honor Roll Student",
        ],
        subjects: ["Mathematics", "Science", "English", "History", "Physics"],
        attendanceRate: 92,
        averageGrade: 85,
        recentGrades: [
          { subject: "Mathematics", score: 88, date: "2024-03-15" },
          { subject: "Science", score: 92, date: "2024-03-14" },
          { subject: "English", score: 85, date: "2024-03-13" },
        ],
      };
      setStudent(demoStudent);
      setEditedData(demoStudent);
      setLoading(false);
    }, 500);
  }, [propStudentId]);

  const handleSave = () => {
    setStudent(editedData);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditedData(student);
    setIsEditing(false);
  };

  const canEdit =
    userRole === "parent" || userRole === "teacher" || userRole === "admin";

  const InfoField = ({ label, value, field, type = "text" }) => (
    <div style={styles.infoField}>
      <label style={styles.infoLabel}>{label}</label>
      {isEditing && canEdit ? (
        <input
          type={type}
          value={editedData[field] || ""}
          onChange={(e) =>
            setEditedData({ ...editedData, [field]: e.target.value })
          }
          style={styles.infoInput}
        />
      ) : (
        <p style={styles.infoValue}>{value || "Not provided"}</p>
      )}
    </div>
  );

  const ParentInfoField = ({ label, value, field, parentField }) => (
    <div style={styles.infoField}>
      <label style={styles.infoLabel}>{label}</label>
      {isEditing && canEdit ? (
        <input
          type="text"
          value={editedData.parentInfo?.[parentField] || ""}
          onChange={(e) =>
            setEditedData({
              ...editedData,
              parentInfo: {
                ...editedData.parentInfo,
                [parentField]: e.target.value,
              },
            })
          }
          style={styles.infoInput}
        />
      ) : (
        <p style={styles.infoValue}>{value || "Not provided"}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👤 Student Profile</h1>
          <p style={styles.subtitle}>View and manage student information</p>
        </div>
        {canEdit && !isEditing && (
          <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
            <FiEdit2 size={16} /> Edit Profile
          </button>
        )}
        {isEditing && (
          <div style={styles.editActions}>
            <button onClick={handleCancel} style={styles.cancelBtn}>
              <FiX size={16} /> Cancel
            </button>
            <button onClick={handleSave} style={styles.saveBtn}>
              <FiSave size={16} /> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("personal")}
          style={{
            ...styles.tab,
            ...(activeTab === "personal" ? styles.tabActive : {}),
          }}
        >
          <FiUser size={16} /> Personal Info
        </button>
        <button
          onClick={() => setActiveTab("academic")}
          style={{
            ...styles.tab,
            ...(activeTab === "academic" ? styles.tabActive : {}),
          }}
        >
          <FiBookOpen size={16} /> Academic
        </button>
        <button
          onClick={() => setActiveTab("parents")}
          style={{
            ...styles.tab,
            ...(activeTab === "parents" ? styles.tabActive : {}),
          }}
        >
          <FiUsers size={16} /> Parent Info
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          style={{
            ...styles.tab,
            ...(activeTab === "achievements" ? styles.tabActive : {}),
          }}
        >
          <FiAward size={16} /> Achievements
        </button>
        <button
          onClick={() => setActiveTab("medical")}
          style={{
            ...styles.tab,
            ...(activeTab === "medical" ? styles.tabActive : {}),
          }}
        >
          <FiHeart size={16} /> Medical
        </button>
      </div>

      {/* Main Profile Card */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.profileCard}
      >
        {/* Personal Information Tab */}
        {activeTab === "personal" && (
          <div>
            <div style={styles.profileHeader}>
              <div style={styles.avatar}>
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.studentName}>{student.name}</h2>
                <p style={styles.studentMeta}>
                  {student.grade} • {student.class} • Roll No:{" "}
                  {student.rollNumber}
                </p>
                <div style={styles.quickStats}>
                  <span>
                    <FiCalendar /> Joined: 2023
                  </span>
                  <span>
                    <FiClock /> Attendance: {student.attendanceRate}%
                  </span>
                  <span>
                    <FiCheckCircle /> Avg Grade: {student.averageGrade}%
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <InfoField label="Full Name" value={student.name} field="name" />
              <InfoField
                label="Email Address"
                value={student.email}
                field="email"
                type="email"
              />
              <InfoField
                label="Phone Number"
                value={student.phone}
                field="phone"
                type="tel"
              />
              <InfoField
                label="Date of Birth"
                value={student.dateOfBirth}
                field="dateOfBirth"
                type="date"
              />
              <InfoField
                label="Address"
                value={student.address}
                field="address"
              />
              <InfoField
                label="Roll Number"
                value={student.rollNumber}
                field="rollNumber"
              />
            </div>
          </div>
        )}

        {/* Academic Information Tab */}
        {activeTab === "academic" && (
          <div>
            <h3 style={styles.sectionTitle}>📚 Subjects</h3>
            <div style={styles.subjectsGrid}>
              {student.subjects.map((subject, i) => (
                <span key={i} style={styles.subjectTag}>
                  {subject}
                </span>
              ))}
            </div>

            <h3 style={styles.sectionTitle}>📊 Recent Grades</h3>
            <div style={styles.gradesTable}>
              {student.recentGrades.map((grade, i) => (
                <div key={i} style={styles.gradeRow}>
                  <span style={styles.gradeSubject}>{grade.subject}</span>
                  <span style={styles.gradeScore}>{grade.score}%</span>
                  <span style={styles.gradeDate}>{grade.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parent Information Tab */}
        {activeTab === "parents" && (
          <div>
            <h3 style={styles.sectionTitle}>👨‍👩‍👧 Parent/Guardian Information</h3>
            <div style={styles.infoGrid}>
              <ParentInfoField
                label="Father's Name"
                value={student.parentInfo?.fatherName}
                parentField="fatherName"
              />
              <ParentInfoField
                label="Mother's Name"
                value={student.parentInfo?.motherName}
                parentField="motherName"
              />
              <ParentInfoField
                label="Father's Phone"
                value={student.parentInfo?.fatherPhone}
                parentField="fatherPhone"
              />
              <ParentInfoField
                label="Mother's Phone"
                value={student.parentInfo?.motherPhone}
                parentField="motherPhone"
              />
              <ParentInfoField
                label="Parent Email"
                value={student.parentInfo?.email}
                parentField="email"
              />
            </div>

            <h3 style={styles.sectionTitle}>🚨 Emergency Contact</h3>
            <div style={styles.emergencyCard}>
              <p>
                <strong>Name:</strong> {student.emergencyContact?.name}
              </p>
              <p>
                <strong>Relationship:</strong>{" "}
                {student.emergencyContact?.relationship}
              </p>
              <p>
                <strong>Phone:</strong> {student.emergencyContact?.phone}
              </p>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div>
            <h3 style={styles.sectionTitle}>🏆 Achievements & Awards</h3>
            <div style={styles.achievementsList}>
              {student.achievements.map((achievement, i) => (
                <div key={i} style={styles.achievementItem}>
                  <span style={styles.achievementIcon}>🏅</span>
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Information Tab */}
        {activeTab === "medical" && (
          <div>
            <h3 style={styles.sectionTitle}>🏥 Medical Information</h3>
            <div style={styles.medicalCard}>
              <div style={styles.medicalRow}>
                <span style={styles.medicalLabel}>Blood Group:</span>
                <span style={styles.medicalValue}>{student.bloodGroup}</span>
              </div>
              <div style={styles.medicalRow}>
                <span style={styles.medicalLabel}>Allergies:</span>
                <span style={styles.medicalValue}>{student.allergies}</span>
              </div>
              <div style={styles.medicalRow}>
                <span style={styles.medicalLabel}>Medical Conditions:</span>
                <span style={styles.medicalValue}>
                  {student.medicalConditions}
                </span>
              </div>
            </div>
            <div style={styles.medicalNote}>
              <FiAlertCircle size={16} />
              <span>
                This information is confidential and only accessible to
                authorized staff.
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
  editActions: {
    display: "flex",
    gap: "12px",
  },
  cancelBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
    flexWrap: "wrap",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    transition: "all 0.2s ease",
  },
  tabActive: {
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "bold",
    color: "white",
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
  },
  studentMeta: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "12px",
  },
  quickStats: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "#6b7280",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  infoField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "16px",
    color: "#1f2937",
    fontWeight: "500",
  },
  infoInput: {
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
    marginTop: "24px",
  },
  subjectsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "24px",
  },
  subjectTag: {
    padding: "6px 14px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  gradesTable: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    overflow: "hidden",
  },
  gradeRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
  },
  gradeSubject: {
    fontWeight: "500",
    color: "#1f2937",
  },
  gradeScore: {
    fontWeight: "600",
    color: "#10b981",
  },
  gradeDate: {
    color: "#6b7280",
    fontSize: "12px",
  },
  emergencyCard: {
    backgroundColor: "#fef3c7",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "16px",
  },
  achievementsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  achievementItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  achievementIcon: {
    fontSize: "20px",
  },
  medicalCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
  },
  medicalRow: {
    display: "flex",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  medicalLabel: {
    width: "150px",
    fontWeight: "600",
    color: "#374151",
  },
  medicalValue: {
    color: "#6b7280",
  },
  medicalNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#dbeafe",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#1e40af",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default StudentProfilePage;
