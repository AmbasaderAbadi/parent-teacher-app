import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiArrowRight, FiX, FiBarChart2 } from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate, FaUsers } from "react-icons/fa";
import "../../../assets/styles/auth-pages.css";
import toast from "react-hot-toast";

const LoginPage = ({ setUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ role: "", password: "", id: "" });
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleSelect = (role) => setFormData({ ...formData, role });
  const handleClose = () => navigate("/");

  const demoAccounts = {
    parent: {
      id: "parent123",
      password: "parent123",
      name: "Sarah Johnson",
      role: "parent",
      email: "parent@test.com",
      children: ["John Doe", "Emma Doe"],
    },
    teacher: {
      id: "teacher123",
      password: "teacher123",
      name: "Michael Chen",
      role: "teacher",
      email: "teacher@test.com",
      subject: "Mathematics",
      class: "Grade 10A",
    },
    student: {
      id: "student123",
      password: "student123",
      name: "John Doe",
      role: "student",
      email: "student@test.com",
      grade: "10th Grade",
      class: "Section A",
    },
    admin: {
      id: "admin123",
      password: "admin123",
      name: "Admin User",
      role: "admin",
      email: "admin@school.com",
    },
  };

  const handleDemoLogin = (role) => {
    const demo = demoAccounts[role];
    performLogin(demo.id, demo.password, role);
  };

  const performLogin = async (id, password, role) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const demo = demoAccounts[role];

    if (demo && demo.id === id && demo.password === password) {
      const userData = {
        id: demo.id,
        name: demo.name,
        firstName: demo.name.split(" ")[0],
        lastName: demo.name.split(" ")[1] || "",
        email: demo.email,
        role: demo.role,
        ...(demo.role === "parent" && { children: demo.children }),
        ...(demo.role === "teacher" && {
          subject: demo.subject,
          class: demo.class,
        }),
        ...(demo.role === "student" && {
          grade: demo.grade,
          class: demo.class,
        }),
      };
      localStorage.setItem("token", "demo-token-" + Date.now());
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${demo.name}!`);
      setTimeout(() => {
        window.location.href =
          {
            teacher: "/teacher-dashboard",
            student: "/student-dashboard",
            parent: "/parent-dashboard",
            admin: "/admin-dashboard",
          }[demo.role] || "/dashboard";
      }, 100);
    } else {
      toast.error("Invalid credentials. Use demo accounts below.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.role || !formData.id) {
      toast.error("Please fill in all login fields");
      return;
    }
    await performLogin(formData.id, formData.password, formData.role);
  };

  const { role } = formData;
  const roleIcons = {
    teacher: <FaChalkboardTeacher size={20} />,
    parent: <FaUsers size={20} />,
    student: <FaUserGraduate size={20} />,
    admin: <FiBarChart2 size={20} />,
  };

  return (
    <div className="login-container">
      <div className="bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <button onClick={handleClose} className="close-button" aria-label="Close">
        <FiX size={24} />
      </button>

      <div className="login-wrapper">
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
          <h2 className="info-title">Welcome Back!</h2>
          <p className="info-desc">
            Sign in to access your dashboard and stay connected with your
            educational community.
          </p>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="form-panel"
        >
          <div className="form-header">
            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="role-container">
            {["parent", "teacher", "student", "admin"].map((r) => (
              <motion.button
                key={r}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`role-button ${role === r ? "active" : ""}`}
                onClick={() => handleRoleSelect(r)}
              >
                <span className="role-icon">{roleIcons[r]}</span>
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form">
            <Input
              label={`${role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"} ID`}
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder={`Enter your ${role || "user"} ID`}
              icon={<FiUser />}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={<FiLock />}
            />

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
                  Sign In <FiArrowRight className="button-icon" />
                </>
              )}
            </motion.button>
          </form>

          <div className="demo-box">
            <p className="demo-title">
              🎭 Demo Accounts (Click to login instantly)
            </p>
            <div className="demo-grid">
              {[
                {
                  role: "parent",
                  icon: FaUsers,
                  label: "Parent Demo",
                  creds: "parent123 / parent123",
                  color: "#4f46e5",
                },
                {
                  role: "teacher",
                  icon: FaChalkboardTeacher,
                  label: "Teacher Demo",
                  creds: "teacher123 / teacher123",
                  color: "#4f46e5",
                },
                {
                  role: "student",
                  icon: FaUserGraduate,
                  label: "Student Demo",
                  creds: "student123 / student123",
                  color: "#4f46e5",
                },
                {
                  role: "admin",
                  icon: FiBarChart2,
                  label: "Admin Demo",
                  creds: "admin123 / admin123",
                  color: "#ef4444",
                },
              ].map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleDemoLogin(demo.role)}
                  className="demo-card"
                  type="button"
                >
                  <demo.icon
                    size={20}
                    style={{ color: demo.color, flexShrink: 0 }}
                  />
                  <div className="demo-card-content">
                    <strong>{demo.label}</strong>
                    <p className="demo-text">{demo.creds}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="toggle-container">
            <p className="toggle-text">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="toggle-link"
              >
                Sign up here
              </button>
            </p>
          </div>
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

export default LoginPage;
