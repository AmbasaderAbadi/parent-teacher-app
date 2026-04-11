import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../../services/api/apiClient";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    )
      return toast.error("Please fill in all required fields");
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (
      selectedRole === "teacher" &&
      (!formData.teacherId || !formData.subject)
    )
      return toast.error("Please fill in teacher ID and subject");
    if (
      selectedRole === "student" &&
      (!formData.studentId || !formData.grade || !formData.parentEmail)
    )
      return toast.error("Please fill in all student details");
    if (selectedRole === "parent" && !formData.childrenCount)
      return toast.error("Please enter number of children");

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
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
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
              {selectedRole === "teacher" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="section-title">Teacher Information</div>
                  <div className="form-row">
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
                    />
                  </div>
                  <div className="form-row">
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
                      <option value="parent">Parent</option>
                      <option value="guardian">Guardian</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="other">Other</option>
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

// Input Component - SINGLE BOX with icon on left inside the input
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

export default RegisterPage;
