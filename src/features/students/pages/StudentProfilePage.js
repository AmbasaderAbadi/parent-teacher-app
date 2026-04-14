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
import { studentsAPI, gradesAPI, attendanceAPI } from "../../../services/api";

const StudentProfilePage = ({ studentId: propStudentId }) => {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role);
    }
  }, []);

  useEffect(() => {
    if (propStudentId) {
      fetchStudentData(propStudentId);
    } else {
      // If no studentId prop, try to get current student from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === "student") {
          fetchStudentData(parsedUser.studentId || parsedUser.id);
        }
      }
    }
  }, [propStudentId]);

  const fetchStudentData = async (id) => {
    setLoading(true);
    try {
      // Fetch student profile
      const profileResponse = await studentsAPI.getStudentProfile(id);
      const profileData = profileResponse.data;

      // Fetch medical information
      let medicalData = null;
      try {
        const medicalResponse = await studentsAPI.getMedicalInfo(id);
        medicalData = medicalResponse.data;
        setMedicalInfo(medicalData);
      } catch (error) {
        console.log("No medical info available");
      }

      // Fetch achievements
      let achievementsData = [];
      try {
        const achievementsResponse = await studentsAPI.getAchievements(id);
        achievementsData = achievementsResponse.data;
        setAchievements(achievementsData);
      } catch (error) {
        console.log("No achievements available");
      }

      // Fetch grades for academic summary
      let gradesData = [];
      try {
        const gradesResponse = await gradesAPI.getStudentGrades(id);
        gradesData = gradesResponse.data;
      } catch (error) {
        console.log("No grades available");
      }

      // Fetch attendance rate
      let attendanceRate = 0;
      try {
        const attendanceResponse = await attendanceAPI.getStudentAttendance(id);
        const attendanceRecords = attendanceResponse.data;
        const presentCount = attendanceRecords.filter(
          (r) => r.status === "present",
        ).length;
        attendanceRate =
          attendanceRecords.length > 0
            ? Math.round((presentCount / attendanceRecords.length) * 100)
            : 0;
      } catch (error) {
        console.log("No attendance available");
      }

      // Calculate average grade
      const averageGrade =
        gradesData.length > 0
          ? Math.round(
              gradesData.reduce((sum, g) => sum + g.score, 0) /
                gradesData.length,
            )
          : 0;

      // Transform API data to match component structure
      const transformedStudent = {
        id: profileData.id || profileData._id,
        name: `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim(),
        email: profileData.email,
        phone: profileData.phone || "Not provided",
        address: profileData.address || "Not provided",
        dateOfBirth: profileData.dateOfBirth || "Not provided",
        grade: profileData.grade || "Not assigned",
        class: profileData.className || "Not assigned",
        rollNumber: profileData.rollNumber || profileData.studentId || "N/A",
        bloodGroup: medicalData?.bloodGroup || "Not recorded",
        allergies: medicalData?.allergies || "None",
        medicalConditions: medicalData?.conditions || "None",
        emergencyContact: medicalData?.emergencyContact || {
          name: "Not provided",
          relationship: "Not provided",
          phone: "Not provided",
        },
        parentInfo: {
          fatherName: profileData.fatherName || "Not provided",
          motherName: profileData.motherName || "Not provided",
          fatherPhone: profileData.fatherPhone || "Not provided",
          motherPhone: profileData.motherPhone || "Not provided",
          email: profileData.parentEmail || "Not provided",
        },
        achievements: achievementsData.map((a) => a.title || a.description) || [
          "No achievements recorded yet",
        ],
        subjects: [...new Set(gradesData.map((g) => g.subject))],
        attendanceRate: attendanceRate,
        averageGrade: averageGrade,
        recentGrades: gradesData.slice(0, 5).map((g) => ({
          subject: g.subject,
          score: g.score,
          date: g.date || g.createdAt?.split("T")[0] || "Recent",
        })),
      };

      setStudent(transformedStudent);
      setEditedData(transformedStudent);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load student data. Using demo data.");

      // Fallback to demo data
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const studentId = student.id;

      // Update profile
      const profileUpdate = {
        firstName: editedData.name?.split(" ")[0] || "",
        lastName: editedData.name?.split(" ").slice(1).join(" ") || "",
        email: editedData.email,
        phone: editedData.phone,
        address: editedData.address,
        dateOfBirth: editedData.dateOfBirth,
        grade: editedData.grade,
        className: editedData.class,
        rollNumber: editedData.rollNumber,
        fatherName: editedData.parentInfo?.fatherName,
        motherName: editedData.parentInfo?.motherName,
        fatherPhone: editedData.parentInfo?.fatherPhone,
        motherPhone: editedData.parentInfo?.motherPhone,
        parentEmail: editedData.parentInfo?.email,
      };

      await studentsAPI.updateStudentProfile(studentId, profileUpdate);

      // Update medical info if changed
      if (medicalInfo) {
        const medicalUpdate = {
          bloodGroup: editedData.bloodGroup,
          allergies: editedData.allergies,
          conditions: editedData.medicalConditions,
          emergencyContact: editedData.emergencyContact,
        };
        await studentsAPI.updateMedicalInfo(studentId, medicalUpdate);
      }

      setStudent(editedData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
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

  const MedicalField = ({ label, value, field }) => (
    <div style={styles.infoField}>
      <label style={styles.infoLabel}>{label}</label>
      {isEditing && canEdit ? (
        <input
          type="text"
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={styles.loadingContainer}>
        <p>No student data available</p>
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
              {student.subjects && student.subjects.length > 0 ? (
                student.subjects.map((subject, i) => (
                  <span key={i} style={styles.subjectTag}>
                    {subject}
                  </span>
                ))
              ) : (
                <p>No subjects assigned yet</p>
              )}
            </div>

            <h3 style={styles.sectionTitle}>📊 Recent Grades</h3>
            <div style={styles.gradesTable}>
              {student.recentGrades && student.recentGrades.length > 0 ? (
                student.recentGrades.map((grade, i) => (
                  <div key={i} style={styles.gradeRow}>
                    <span style={styles.gradeSubject}>{grade.subject}</span>
                    <span style={styles.gradeScore}>{grade.score}%</span>
                    <span style={styles.gradeDate}>{grade.date}</span>
                  </div>
                ))
              ) : (
                <p style={styles.gradeRow}>No grades available yet</p>
              )}
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
              {student.achievements && student.achievements.length > 0 ? (
                student.achievements.map((achievement, i) => (
                  <div key={i} style={styles.achievementItem}>
                    <span style={styles.achievementIcon}>🏅</span>
                    <span>{achievement}</span>
                  </div>
                ))
              ) : (
                <p>No achievements recorded yet</p>
              )}
            </div>
          </div>
        )}

        {/* Medical Information Tab */}
        {activeTab === "medical" && (
          <div>
            <h3 style={styles.sectionTitle}>🏥 Medical Information</h3>
            <div style={styles.medicalCard}>
              <MedicalField
                label="Blood Group"
                value={student.bloodGroup}
                field="bloodGroup"
              />
              <MedicalField
                label="Allergies"
                value={student.allergies}
                field="allergies"
              />
              <MedicalField
                label="Medical Conditions"
                value={student.medicalConditions}
                field="medicalConditions"
              />
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
