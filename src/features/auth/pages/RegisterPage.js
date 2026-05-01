import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../../../services/api";
import "../../../assets/styles/auth-pages.css";
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
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUsers,
  FaSchool,
} from "react-icons/fa";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("parent");
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "parent",
    // Teacher fields
    primarySubject: "",
    qualification: "",
    yearsOfExperience: "",
    department: "",
    grades: [],
    sections: [],
    // Parent fields
    childrenCount: "",
    relationship: "Parent",
    occupation: "",
    // Student fields
    dateOfBirth: "",
    grade: "",
    className: "",
    parentPhone: "",
  });

  // Dynamic arrays for teacher grades and sections
  const [newGrade, setNewGrade] = useState("");
  const [newSection, setNewSection] = useState("");
  const availableGrades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const availableSections = ["A", "B", "C", "D"];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
  };

  const handleClose = () => navigate("/");

  // Teacher grade management
  const addGrade = () => {
    if (newGrade && !formData.grades.includes(newGrade)) {
      setFormData({ ...formData, grades: [...formData.grades, newGrade] });
      setNewGrade("");
    }
  };

  const removeGrade = (gradeToRemove) => {
    setFormData({
      ...formData,
      grades: formData.grades.filter((g) => g !== gradeToRemove),
    });
  };

  // Teacher section management
  const addSection = () => {
    if (newSection && !formData.sections.includes(newSection)) {
      setFormData({
        ...formData,
        sections: [...formData.sections, newSection],
      });
      setNewSection("");
    }
  };

  const removeSection = (sectionToRemove) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((s) => s !== sectionToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.password
    ) {
      toast.error(
        "Please fill in all required fields (First Name, Last Name, Phone Number, Password)",
      );
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

    // Role-specific validation
    if (selectedRole === "teacher" && !formData.primarySubject) {
      toast.error("Please fill in primary subject");
      return;
    }
    if (selectedRole === "teacher" && formData.grades.length === 0) {
      toast.error("Please add at least one grade");
      return;
    }
    if (selectedRole === "teacher" && formData.sections.length === 0) {
      toast.error("Please add at least one section");
      return;
    }
    if (
      selectedRole === "student" &&
      (!formData.grade || !formData.className || !formData.parentPhone)
    ) {
      toast.error("Please fill in grade, class, and parent's phone number");
      return;
    }
    if (selectedRole === "parent" && !formData.childrenCount) {
      toast.error("Please enter number of children");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (selectedRole === "teacher") {
        const teacherData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || null,
          phoneNumber: formData.phone,
          address: formData.address || "Not provided",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          primarySubject: formData.primarySubject,
          qualification: formData.qualification,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          department: formData.department,
          grades: formData.grades,
          sections: formData.sections,
        };
        response = await authAPI.registerTeacher(teacherData);
      } else if (selectedRole === "student") {
        const studentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || null,
          phoneNumber: formData.phone,
          address: formData.address || "Not provided",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          dateOfBirth: formData.dateOfBirth,
          grade: formData.grade,
          className: formData.className,
          parentPhoneNumber: formData.parentPhone,
        };
        response = await authAPI.registerStudent(studentData);
      } else {
        // Parent registration
        const parentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || null,
          phoneNumber: formData.phone,
          address: formData.address || "Not provided",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          childrenCount: parseInt(formData.childrenCount) || 1,
          relationship: formData.relationship,
          occupation: formData.occupation || "",
        };
        response = await authAPI.registerParent(parentData);
      }

      toast.success(
        response.data?.message || "Account created successfully! Please login.",
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    teacher: <FaChalkboardTeacher size={20} />,
    parent: <FaUsers size={20} />,
    student: <FaUserGraduate size={20} />,
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
    <div className="register-container">
      <div className="bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
      <button onClick={handleClose} className="close-button" aria-label="Close">
        <FiX size={24} />
      </button>

      <div className="register-wrapper">
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="info-panel"
        >
          <div className="logo">
            <span className="logo-icon">PT</span>
            <span className="logo-text">ParentTeacher Portal</span>
          </div>
          <h2 className="info-title">{roleTitles[selectedRole]}</h2>
          <p className="info-desc">{roleDescriptions[selectedRole]}</p>
          <div className="info-features">
            <div className="info-feature">
              <FiCheckCircle className="info-icon" />
              <span>Real-time communication</span>
            </div>
            <div className="info-feature">
              <FiCheckCircle className="info-icon" />
              <span>Track student progress</span>
            </div>
            <div className="info-feature">
              <FiCheckCircle className="info-icon" />
              <span>Get instant notifications</span>
            </div>
          </div>
          <div className="already-account">
            <p>Already have an account?</p>
            <Link to="/login">
              <button className="sign-in-btn">Sign In →</button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="form-panel"
        >
          <div className="form-header">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Fill in your details to get started</p>
          </div>

          <div className="role-container">
            {["parent", "teacher", "student"].map((role) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`role-button ${selectedRole === role ? "active" : ""}`}
                onClick={() => handleRoleChange(role)}
              >
                <span className="role-icon">{roleIcons[role]}</span>
                <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
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
            <div className="form-row">
              <Input
                label="Email Address (Optional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                icon={<FiMail />}
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
              {selectedRole === "teacher" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="section-title">Teacher Information</div>
                  <Input
                    label="Primary Subject"
                    name="primarySubject"
                    value={formData.primarySubject}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics"
                    icon={<FiBookOpen />}
                    required
                  />
                  <div className="form-row">
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
                      name="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
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

                  {/* Grades Selection */}
                  <div className="section-title">Grades Taught</div>
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
                    <button
                      type="button"
                      onClick={addGrade}
                      style={styles.addBtn}
                    >
                      <FiPlus size={16} /> Add
                    </button>
                  </div>
                  <div style={styles.chipContainer}>
                    {formData.grades.map((grade) => (
                      <div key={grade} style={styles.chip}>
                        <span>{grade}</span>
                        <button
                          type="button"
                          onClick={() => removeGrade(grade)}
                          style={styles.chipRemove}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Sections Selection */}
                  <div className="section-title">Sections Taught</div>
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
                      <FiPlus size={16} /> Add
                    </button>
                  </div>
                  <div style={styles.chipContainer}>
                    {formData.sections.map((section) => (
                      <div key={section} style={styles.chip}>
                        <span>Section {section}</span>
                        <button
                          type="button"
                          onClick={() => removeSection(section)}
                          style={styles.chipRemove}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedRole === "student" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="section-title">Student Information</div>
                  <div className="form-row">
                    <Input
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      icon={<FiCalendar />}
                    />
                  </div>
                  <div className="form-row">
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
                      required
                    />
                  </div>
                  <Input
                    label="Parent's Phone Number"
                    name="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Parent's phone number"
                    icon={<FiPhone />}
                    required
                  />
                </motion.div>
              )}

              {selectedRole === "parent" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="section-title">Parent Information</div>
                  <div className="form-row">
                    <Input
                      label="Number of Children"
                      name="childrenCount"
                      type="number"
                      value={formData.childrenCount}
                      onChange={handleChange}
                      placeholder="Number of children"
                      icon={<FaUsers />}
                      required
                      min="1"
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
                  <div className="input-wrapper">
                    <label className="input-label">
                      Relationship to Student{" "}
                      <span className="required">*</span>
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="select-field"
                      required
                    >
                      <option value="Parent">Parent</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="section-title">Security</div>
            <div className="form-row">
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
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Create Account <FiArrowRight className="button-icon" />
                </>
              )}
            </motion.button>

            <div className="toggle-container">
              <p className="toggle-text">
                Already have an account?{" "}
                <Link to="/login" className="toggle-link">
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
  <div className="input-wrapper">
    <label className="input-label">
      {label} {required && <span className="required">*</span>}
    </label>
    <div className="input-container">
      {icon && <span className="input-icon">{icon}</span>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="input-field"
        aria-label={label}
      />
    </div>
  </div>
);

const FiCheckCircle = ({ className }) => (
  <svg
    className={className}
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
  arrayInputContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },
  select: {
    flex: 1,
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 16px",
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
    gap: "8px",
    marginBottom: "20px",
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
  chipRemove: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    padding: "0",
  },
};

export default RegisterPage;
