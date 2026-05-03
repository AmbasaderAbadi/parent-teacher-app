import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
  const availableGrades = [
    t("grade_9"),
    t("grade_10"),
    t("grade_11"),
    t("grade_12"),
  ];
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
      toast.error(t("required_fields_register"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("password_mismatch"));
      return;
    }
    if (formData.password.length < 6) {
      toast.error(t("password_min_length"));
      return;
    }

    // Role-specific validation
    if (selectedRole === "teacher" && !formData.primarySubject) {
      toast.error(t("primary_subject_required"));
      return;
    }
    if (selectedRole === "teacher" && formData.grades.length === 0) {
      toast.error(t("at_least_one_grade"));
      return;
    }
    if (selectedRole === "teacher" && formData.sections.length === 0) {
      toast.error(t("at_least_one_section"));
      return;
    }
    if (
      selectedRole === "student" &&
      (!formData.grade || !formData.className || !formData.parentPhone)
    ) {
      toast.error(t("student_fields_required"));
      return;
    }
    if (selectedRole === "parent" && !formData.childrenCount) {
      toast.error(t("children_count_required"));
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

      toast.success(response.data?.message || t("registration_success"));
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        t("registration_failed");
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
    teacher: t("join_as_teacher"),
    parent: t("join_as_parent"),
    student: t("join_as_student"),
  };

  const roleDescriptions = {
    teacher: t("teacher_description"),
    parent: t("parent_description"),
    student: t("student_description"),
  };

  return (
    <div className="register-container">
      <div className="bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
      <button
        onClick={handleClose}
        className="close-button"
        aria-label={t("close")}
      >
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
            <span className="logo-text">{t("app_name")}</span>
          </div>
          <h2 className="info-title">{roleTitles[selectedRole]}</h2>
          <p className="info-desc">{roleDescriptions[selectedRole]}</p>
          <div className="info-features">
            <div className="info-feature">
              <FiCheckCircle className="info-icon" />
              <span>{t("feature_realtime")}</span>
            </div>
            <div className="info-feature">
              <FiCheckCircle className="info-icon" />
              <span>{t("feature_progress")}</span>
            </div>
            <div className="info-feature">
              <FiCheckCircle className="info-icon" />
              <span>{t("feature_notifications")}</span>
            </div>
          </div>
          <div className="already-account">
            <p>{t("already_have_account")}</p>
            <Link to="/login">
              <button className="sign-in-btn">{t("sign_in")} →</button>
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
            <h2 className="form-title">{t("create_account")}</h2>
            <p className="form-subtitle">{t("fill_details")}</p>
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
                <span>
                  {role === "parent"
                    ? t("parent")
                    : role === "teacher"
                      ? t("teacher")
                      : t("student")}
                </span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <Input
                label={t("first_name")}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t("first_name_placeholder")}
                icon={<FiUser />}
                required
              />
              <Input
                label={t("last_name")}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t("last_name_placeholder")}
                icon={<FiUserCheck />}
                required
              />
            </div>
            <div className="form-row">
              <Input
                label={t("email_optional")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("email_placeholder")}
                icon={<FiMail />}
              />
              <Input
                label={t("phone_number")}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("phone_placeholder")}
                icon={<FiPhone />}
                required
              />
            </div>
            <Input
              label={t("address")}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t("address_placeholder")}
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
                  <div className="section-title">{t("teacher_info")}</div>
                  <Input
                    label={t("primary_subject")}
                    name="primarySubject"
                    value={formData.primarySubject}
                    onChange={handleChange}
                    placeholder={t("primary_subject_placeholder")}
                    icon={<FiBookOpen />}
                    required
                  />
                  <div className="form-row">
                    <Input
                      label={t("qualification")}
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder={t("qualification_placeholder")}
                      icon={<FiBookOpen />}
                    />
                    <Input
                      label={t("years_experience")}
                      name="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      placeholder={t("years_placeholder")}
                      icon={<FiBriefcase />}
                    />
                  </div>
                  <Input
                    label={t("department")}
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder={t("department_placeholder")}
                    icon={<FaSchool />}
                  />

                  <div className="section-title">{t("grades_taught")}</div>
                  <div style={styles.arrayInputContainer}>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      style={styles.select}
                    >
                      <option value="">{t("select_grade")}</option>
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
                      <FiPlus size={16} /> {t("add")}
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

                  <div className="section-title">{t("sections_taught")}</div>
                  <div style={styles.arrayInputContainer}>
                    <select
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      style={styles.select}
                    >
                      <option value="">{t("select_section")}</option>
                      {availableSections.map((section) => (
                        <option key={section} value={section}>
                          {t("section")} {section}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addSection}
                      style={styles.addBtn}
                    >
                      <FiPlus size={16} /> {t("add")}
                    </button>
                  </div>
                  <div style={styles.chipContainer}>
                    {formData.sections.map((section) => (
                      <div key={section} style={styles.chip}>
                        <span>
                          {t("section")} {section}
                        </span>
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
                  <div className="section-title">{t("student_info")}</div>
                  <div className="form-row">
                    <Input
                      label={t("date_of_birth")}
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      icon={<FiCalendar />}
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label={t("grade")}
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder={t("grade_placeholder")}
                      icon={<FiBookOpen />}
                      required
                    />
                    <Input
                      label={t("class_section")}
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      placeholder={t("class_placeholder")}
                      icon={<FaSchool />}
                      required
                    />
                  </div>
                  <Input
                    label={t("parent_phone_number")}
                    name="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder={t("parent_phone_placeholder")}
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
                  <div className="section-title">{t("parent_info")}</div>
                  <div className="form-row">
                    <Input
                      label={t("children_count")}
                      name="childrenCount"
                      type="number"
                      value={formData.childrenCount}
                      onChange={handleChange}
                      placeholder={t("children_placeholder")}
                      icon={<FaUsers />}
                      required
                      min="1"
                    />
                    <Input
                      label={t("occupation")}
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder={t("occupation_placeholder")}
                      icon={<FiBriefcase />}
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">
                      {t("relationship_to_student")}{" "}
                      <span className="required">*</span>
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="select-field"
                      required
                    >
                      <option value="Parent">{t("parent")}</option>
                      <option value="Guardian">{t("guardian")}</option>
                      <option value="Grandparent">{t("grandparent")}</option>
                      <option value="Other">{t("other")}</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="section-title">{t("security")}</div>
            <div className="form-row">
              <Input
                label={t("password")}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("password_min_length_placeholder")}
                icon={<FiLock />}
                required
              />
              <Input
                label={t("confirm_password")}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("confirm_password_placeholder")}
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
                  {t("create_account")} <FiArrowRight className="button-icon" />
                </>
              )}
            </motion.button>

            <div className="toggle-container">
              <p className="toggle-text">
                {t("already_have_account")}{" "}
                <Link to="/login" className="toggle-link">
                  {t("sign_in")}
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
