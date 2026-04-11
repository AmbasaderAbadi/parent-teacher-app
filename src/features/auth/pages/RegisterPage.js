import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../../services/api/apiClient";
import {
  FiUser,
  FiLock,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiUserCheck,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUsers,
  FaSchool,
  FaIdCard,
} from "react-icons/fa";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("parent");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "parent",
    teacherId: "",
    subject: "",
    qualification: "",
    experience: "",
    department: "",
    childrenCount: "",
    relationship: "parent",
    occupation: "",
    studentId: "",
    dateOfBirth: "",
    grade: "",
    className: "",
    parentEmail: "",
    parentPhone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role: role });
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (selectedRole === "teacher") {
      if (!formData.teacherId || !formData.subject) {
        toast.error("Please fill in teacher ID and subject");
        return;
      }
    }

    if (selectedRole === "student") {
      if (!formData.studentId || !formData.grade || !formData.parentEmail) {
        toast.error("Please fill in all student details");
        return;
      }
    }

    if (selectedRole === "parent") {
      if (!formData.childrenCount) {
        toast.error("Please enter number of children");
        return;
      }
    }

    setLoading(true);
    try {
      await apiClient.post("/users/register", {
        role: selectedRole,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        educationLevel: formData.qualification || formData.grade || "",
        userId:
          selectedRole === "teacher"
            ? formData.teacherId
            : selectedRole === "student"
              ? formData.studentId
              : formData.parentId,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        ...(selectedRole === "teacher" && {
          subject: formData.subject,
          qualification: formData.qualification,
          experience: formData.experience,
          department: formData.department,
        }),
        ...(selectedRole === "parent" && {
          childrenCount: formData.childrenCount,
          relationship: formData.relationship,
          occupation: formData.occupation,
        }),
        ...(selectedRole === "student" && {
          dateOfBirth: formData.dateOfBirth,
          grade: formData.grade,
          className: formData.className,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
        }),
      });

      toast.success("Account created successfully! Please login.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    teacher: <FaChalkboardTeacher size={24} />,
    parent: <FaUsers size={24} />,
    student: <FaUserGraduate size={24} />,
  };

  const roleTitles = {
    teacher: "Join as Teacher",
    parent: "Join as Parent",
    student: "Join as Student",
  };

  const roleDescriptions = {
    teacher: "Manage classes, grade students, and communicate with parents",
    parent: "Monitor your child's progress and stay connected with teachers",
    student: "Track your grades, attendance, and learning materials",
  };

  return (
    <div style={styles.container}>
      {/* Background Decoration */}
      <div style={styles.bgDecoration}>
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        <div style={styles.bgCircle3}></div>
      </div>

      {/* Close Button - X */}
      <button onClick={handleClose} style={styles.closeButton}>
        <FiX size={24} />
      </button>

      <div style={styles.wrapper}>
        {/* Left Side - Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.infoPanel}
        >
          <div style={styles.logo}>
            <span style={styles.logoIcon}>PT</span>
            <span style={styles.logoText}>ParentTeacher Portal</span>
          </div>
          <h2 style={styles.infoTitle}>{roleTitles[selectedRole]}</h2>
          <p style={styles.infoDesc}>{roleDescriptions[selectedRole]}</p>
          <div style={styles.infoFeatures}>
            <div style={styles.infoFeature}>
              <FiCheckCircle style={styles.infoIcon} />
              <span>Real-time communication</span>
            </div>
            <div style={styles.infoFeature}>
              <FiCheckCircle style={styles.infoIcon} />
              <span>Track student progress</span>
            </div>
            <div style={styles.infoFeature}>
              <FiCheckCircle style={styles.infoIcon} />
              <span>Get instant notifications</span>
            </div>
          </div>

          <div style={styles.alreadyAccount}>
            <p>Already have an account?</p>
            <Link to="/login">
              <button style={styles.signInBtn}>Sign In →</button>
            </Link>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.formPanel}
        >
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>
              Fill in your details to get started
            </p>
          </div>

          {/* Role Selection */}
          <div style={styles.roleContainer}>
            {["parent", "teacher", "student"].map((role) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...styles.roleButton,
                  backgroundColor:
                    selectedRole === role ? "#4f46e5" : "#f3f4f6",
                  color: selectedRole === role ? "white" : "#374151",
                  borderColor: selectedRole === role ? "#4f46e5" : "#e5e7eb",
                }}
                onClick={() => handleRoleChange(role)}
              >
                <span style={styles.roleIcon}>{roleIcons[role]}</span>
                <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Common Fields - Row 1 */}
            <div style={styles.row}>
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                icon={<FiUser />}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                icon={<FiUserCheck />}
                required
              />
            </div>

            {/* Common Fields - Row 2 */}
            <div style={styles.row}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                icon={<FiMail />}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                icon={<FiPhone />}
                required
              />
            </div>

            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
              icon={<FiMapPin />}
            />

            <AnimatePresence mode="wait">
              {/* Teacher Specific Fields */}
              {selectedRole === "teacher" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionTitle}>Teacher Information</div>
                  <div style={styles.row}>
                    <Input
                      label="Teacher ID"
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleChange}
                      placeholder="Teacher ID"
                      icon={<FaIdCard />}
                      required
                    />
                    <Input
                      label="Primary Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g., Mathematics"
                      icon={<FiBookOpen />}
                      required
                    />
                  </div>
                  <div style={styles.row}>
                    <Input
                      label="Qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g., Master's Degree"
                      icon={<FiBookOpen />}
                    />
                    <Input
                      label="Years of Experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Years"
                      icon={<FiBriefcase />}
                    />
                  </div>
                  <Input
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Science Department"
                    icon={<FaSchool />}
                  />
                </motion.div>
              )}

              {/* Student Specific Fields */}
              {selectedRole === "student" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionTitle}>Student Information</div>
                  <div style={styles.row}>
                    <Input
                      label="Student ID"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Student ID"
                      icon={<FaIdCard />}
                      required
                    />
                    <Input
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      placeholder="YYYY-MM-DD"
                      icon={<FiCalendar />}
                    />
                  </div>
                  <div style={styles.row}>
                    <Input
                      label="Grade/Year"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder="e.g., 10th Grade"
                      icon={<FiBookOpen />}
                      required
                    />
                    <Input
                      label="Class/Section"
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      placeholder="e.g., Section A"
                      icon={<FaSchool />}
                    />
                  </div>
                  <div style={styles.row}>
                    <Input
                      label="Parent's Email"
                      name="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      placeholder="parent@email.com"
                      icon={<FiMail />}
                      required
                    />
                    <Input
                      label="Parent's Phone"
                      name="parentPhone"
                      type="tel"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      placeholder="Parent phone"
                      icon={<FiPhone />}
                    />
                  </div>
                </motion.div>
              )}

              {/* Parent Specific Fields */}
              {selectedRole === "parent" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={styles.sectionTitle}>Parent Information</div>
                  <div style={styles.row}>
                    <Input
                      label="Number of Children"
                      name="childrenCount"
                      type="number"
                      value={formData.childrenCount}
                      onChange={handleChange}
                      placeholder="Number of children"
                      icon={<FaUsers />}
                      required
                    />
                    <Input
                      label="Occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="Your occupation"
                      icon={<FiBriefcase />}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>
                      Relationship to Student
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      style={styles.select}
                      required
                    >
                      <option value="parent">Parent</option>
                      <option value="guardian">Guardian</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Fields */}
            <div style={styles.sectionTitle}>Security</div>
            <div style={styles.row}>
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                icon={<FiLock />}
                required
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                icon={<FiLock />}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingSpinner}></span>
              ) : (
                <>
                  Create Account
                  <FiArrowRight style={styles.buttonIcon} />
                </>
              )}
            </motion.button>

            <div style={styles.toggleContainer}>
              <p style={styles.toggleText}>
                Already have an account?{" "}
                <Link to="/login" style={styles.toggleLink}>
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// Input Component
const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  required,
}) => (
  <div style={styles.inputWrapper}>
    <label style={styles.inputLabel}>
      {label} {required && <span style={styles.required}>*</span>}
    </label>
    <div style={styles.inputContainer}>
      {icon && <span style={styles.inputIcon}>{icon}</span>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  </div>
);

// Helper component for checkmark
const FiCheckCircle = ({ style }) => (
  <svg
    style={style}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#f9fafb",
    padding: "40px 20px",
  },
  closeButton: {
    position: "fixed",
    top: "24px",
    right: "24px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 100,
    transition: "all 0.3s ease",
    color: "#4a5568",
  },
  bgDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea20 0%, #764ba220 100%)",
    animation: "float 6s ease-in-out infinite",
  },
  bgCircle2: {
    position: "absolute",
    bottom: "-20%",
    left: "-10%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f093fb20 0%, #f5576c20 100%)",
    animation: "float 8s ease-in-out infinite reverse",
  },
  bgCircle3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #4facfe20 0%, #00f2fe20 100%)",
    transform: "translate(-50%, -50%)",
  },
  wrapper: {
    maxWidth: "1000px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    backgroundColor: "white",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    zIndex: 10,
    position: "relative",
  },
  infoPanel: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "600",
  },
  infoTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "16px",
  },
  infoDesc: {
    fontSize: "14px",
    opacity: 0.9,
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  infoFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "40px",
  },
  infoFeature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "13px",
  },
  infoIcon: {
    width: "18px",
    height: "18px",
  },
  alreadyAccount: {
    borderTop: "1px solid rgba(255,255,255,0.2)",
    paddingTop: "24px",
  },
  signInBtn: {
    marginTop: "12px",
    padding: "10px 20px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  formPanel: {
    padding: "40px",
    backgroundColor: "white",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  formHeader: {
    textAlign: "center",
    marginBottom: "32px",
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  roleContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
  },
  roleButton: {
    flex: 1,
    padding: "12px",
    border: "2px solid",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  },
  roleIcon: {
    display: "flex",
    alignItems: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "2px solid #e5e7eb",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  inputLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  required: {
    color: "#ef4444",
  },
  inputContainer: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px 12px 12px 40px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "white",
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    marginTop: "8px",
  },
  buttonIcon: {
    width: "18px",
    height: "18px",
  },
  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
    display: "inline-block",
  },
  toggleContainer: {
    textAlign: "center",
    marginTop: "16px",
  },
  toggleText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  toggleLink: {
    color: "#4f46e5",
    fontWeight: "600",
    textDecoration: "none",
    marginLeft: "4px",
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  input:focus, select:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  .sign-in-btn:hover {
    background: rgba(255,255,255,0.3);
  }
  .close-button:hover {
    transform: scale(1.1);
    background-color: #f3f4f6;
  }
`;
document.head.appendChild(styleSheet);

export default RegisterPage;
