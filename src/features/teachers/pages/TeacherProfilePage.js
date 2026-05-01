import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiEdit2,
  FiX,
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { authAPI } from "../../../services/api";
import toast from "react-hot-toast";

const TeacherProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    primarySubject: "",
    qualification: "",
    yearsOfExperience: "",
    department: "",
    grades: [],
    sections: [],
  });

  // For adding new grades/sections
  const [newGrade, setNewGrade] = useState("");
  const [newSection, setNewSection] = useState("");

  const availableGrades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const availableSections = ["A", "B", "C", "D"];

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);

        // Get fresh profile from API
        const response = await authAPI.getProfile();
        const profileData = response.data;

        setTeacher(profileData);
        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          phoneNumber: profileData.phoneNumber || "",
          address: profileData.address || "",
          primarySubject: profileData.primarySubject || "",
          qualification: profileData.qualification || "",
          yearsOfExperience: profileData.yearsOfExperience || "",
          department: profileData.department || "",
          grades: profileData.grades || [],
          sections: profileData.sections || [],
        });
      }
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addGrade = () => {
    if (newGrade && !formData.grades.includes(newGrade)) {
      setFormData({ ...formData, grades: [...formData.grades, newGrade] });
      setNewGrade("");
    } else if (formData.grades.includes(newGrade)) {
      toast.error("Grade already added");
    }
  };

  const removeGrade = (gradeToRemove) => {
    setFormData({
      ...formData,
      grades: formData.grades.filter((g) => g !== gradeToRemove),
    });
  };

  const addSection = () => {
    if (newSection && !formData.sections.includes(newSection)) {
      setFormData({
        ...formData,
        sections: [...formData.sections, newSection],
      });
      setNewSection("");
    } else if (formData.sections.includes(newSection)) {
      toast.error("Section already added");
    }
  };

  const removeSection = (sectionToRemove) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((s) => s !== sectionToRemove),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        primarySubject: formData.primarySubject,
        qualification: formData.qualification,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        department: formData.department,
        grades: formData.grades,
        sections: formData.sections,
      };

      const response = await authAPI.updateProfile(updateData);
      const updatedUser = response.data;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setTeacher(updatedUser);

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teacher Profile</h1>
          <p style={styles.subtitle}>
            Manage your personal information and teaching assignments
          </p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
            <FiEdit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div style={styles.editActions}>
            <button
              onClick={() => setIsEditing(false)}
              style={styles.cancelBtn}
            >
              <FiX size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={styles.saveBtn}
            >
              <FiSave size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div style={styles.profileCard}>
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {formData.firstName?.charAt(0) ||
              teacher?.firstName?.charAt(0) ||
              "T"}
          </div>
          <div>
            <h2 style={styles.userName}>
              {formData.firstName} {formData.lastName}
            </h2>
            <p style={styles.userRole}>Teacher</p>
          </div>
        </div>

        {/* Personal Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.label}>First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <p style={styles.value}>{teacher?.firstName || "Not set"}</p>
              )}
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <p style={styles.value}>{teacher?.lastName || "Not set"}</p>
              )}
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Optional"
                />
              ) : (
                <p style={styles.value}>{teacher?.email || "Not set"}</p>
              )}
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <p style={styles.value}>{teacher?.phoneNumber || "Not set"}</p>
              )}
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows={2}
                />
              ) : (
                <p style={styles.value}>{teacher?.address || "Not set"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Professional Information</h3>
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.label}>Primary Subject</label>
              {isEditing ? (
                <input
                  type="text"
                  name="primarySubject"
                  value={formData.primarySubject}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <p style={styles.value}>
                  {teacher?.primarySubject || "Not set"}
                </p>
              )}
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Qualification</label>
              {isEditing ? (
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <p style={styles.value}>
                  {teacher?.qualification || "Not set"}
                </p>
              )}
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Years of Experience</label>
              {isEditing ? (
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <p style={styles.value}>
                  {teacher?.yearsOfExperience || "0"} years
                </p>
              )}
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Department</label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={styles.input}
                />
              ) : (
                <p style={styles.value}>{teacher?.department || "Not set"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Grades Management */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiBookOpen size={18} /> Grades Taught
          </h3>
          {isEditing ? (
            <>
              <div style={styles.arrayInputContainer}>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select Grade</option>
                  {availableGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addGrade} style={styles.addBtn}>
                  <FiPlus size={16} /> Add Grade
                </button>
              </div>
              <div style={styles.chipContainer}>
                {formData.grades.length === 0 ? (
                  <p style={styles.emptyChip}>
                    No grades added yet. Click "Add Grade" to add.
                  </p>
                ) : (
                  formData.grades.map((grade) => (
                    <div key={grade} style={styles.chip}>
                      <FiBookOpen size={14} />
                      <span>{grade}</span>
                      <button
                        type="button"
                        onClick={() => removeGrade(grade)}
                        style={styles.chipRemove}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={styles.chipContainer}>
              {teacher?.grades?.length === 0 ? (
                <p style={styles.emptyChip}>No grades assigned</p>
              ) : (
                teacher?.grades?.map((grade) => (
                  <div key={grade} style={styles.chipStatic}>
                    <FiBookOpen size={14} />
                    <span>{grade}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sections Management */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiUsers size={18} /> Sections Taught
          </h3>
          {isEditing ? (
            <>
              <div style={styles.arrayInputContainer}>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select Section</option>
                  {availableSections.map((section) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addSection}
                  style={styles.addBtn}
                >
                  <FiPlus size={16} /> Add Section
                </button>
              </div>
              <div style={styles.chipContainer}>
                {formData.sections.length === 0 ? (
                  <p style={styles.emptyChip}>
                    No sections added yet. Click "Add Section" to add.
                  </p>
                ) : (
                  formData.sections.map((section) => (
                    <div key={section} style={styles.chip}>
                      <FiUsers size={14} />
                      <span>Section {section}</span>
                      <button
                        type="button"
                        onClick={() => removeSection(section)}
                        style={styles.chipRemove}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={styles.chipContainer}>
              {teacher?.sections?.length === 0 ? (
                <p style={styles.emptyChip}>No sections assigned</p>
              ) : (
                teacher?.sections?.map((section) => (
                  <div key={section} style={styles.chipStatic}>
                    <FiUsers size={14} />
                    <span>Section {section}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Teaching Summary</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <FiBookOpen size={20} color="#4f46e5" />
              <div>
                <p style={styles.summaryLabel}>Grades</p>
                <p style={styles.summaryValue}>
                  {formData.grades.length || teacher?.grades?.length || 0}
                </p>
              </div>
            </div>
            <div style={styles.summaryItem}>
              <FiUsers size={20} color="#10b981" />
              <div>
                <p style={styles.summaryLabel}>Sections</p>
                <p style={styles.summaryValue}>
                  {formData.sections.length || teacher?.sections?.length || 0}
                </p>
              </div>
            </div>
            <div style={styles.summaryItem}>
              <FiCheckCircle size={20} color="#f59e0b" />
              <div>
                <p style={styles.summaryLabel}>Experience</p>
                <p style={styles.summaryValue}>
                  {teacher?.yearsOfExperience || 0} years
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "900px",
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
    transition: "all 0.2s ease",
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
    fontWeight: "500",
    transition: "all 0.2s ease",
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
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    paddingBottom: "24px",
    marginBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  userRole: {
    fontSize: "14px",
    color: "#6b7280",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
  },
  value: {
    fontSize: "15px",
    color: "#1f2937",
    margin: 0,
    padding: "8px 0",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  textarea: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
  },
  arrayInputContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
  },
  select: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "8px",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    backgroundColor: "#eef2ff",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#4f46e5",
  },
  chipStatic: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#374151",
  },
  chipRemove: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    padding: "0",
    marginLeft: "4px",
  },
  emptyChip: {
    fontSize: "13px",
    color: "#9ca3af",
    padding: "8px 0",
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "16px",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
  },
  summaryValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
};

export default TeacherProfilePage;
