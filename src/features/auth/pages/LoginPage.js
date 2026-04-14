import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiArrowRight, FiX, FiBarChart2 } from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate, FaUsers } from "react-icons/fa";
import "../../../assets/styles/auth-pages.css";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/api";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    password: "",
    userId: "",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const userData = JSON.parse(user);

        const roleDashboards = {
          teacher: "/teacher-dashboard",
          student: "/student-dashboard",
          parent: "/parent-dashboard",
          admin: "/admin-dashboard",
        };

        // 🔥 Delay prevents redirect race condition
        setTimeout(() => {
          navigate(roleDashboards[userData.role] || "/dashboard", {
            replace: true,
          });
        }, 100);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChange = (e) => {
    setErrorMessage("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setErrorMessage("");
    setFormData({ ...formData, role });
  };

  const handleClose = () => navigate("/");

  const handleDemoLogin = async (role) => {
    const demoCredentials = {
      parent: { userId: "parent123", password: "parent123", role: "parent" },
      teacher: {
        userId: "teacher123",
        password: "teacher123",
        role: "teacher",
      },
      student: {
        userId: "student123",
        password: "student123",
        role: "student",
      },
      admin: { userId: "admin123", password: "admin123", role: "admin" },
    };

    const credentials = demoCredentials[role];
    if (credentials) {
      setFormData({
        role: credentials.role,
        userId: credentials.userId,
        password: credentials.password,
      });
      await performLogin(
        credentials.userId,
        credentials.password,
        credentials.role,
      );
    }
  };

  const performLogin = async (userId, password, role) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authAPI.login({
        userId: userId.trim(),
        password: password.trim(),
        role,
      });

      console.log("✅ FULL RESPONSE:", response.data);

      const { access_token, user } = response.data;

      if (!access_token || !user) {
        throw new Error("Invalid response from server");
      }

      // ✅ SAVE CORRECT TOKEN KEY
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", user.role);

      console.log("✅ SAVED USER:", user);

      const roleDashboards = {
        teacher: "/teacher-dashboard",
        student: "/student-dashboard",
        parent: "/parent-dashboard",
        admin: "/admin-dashboard",
      };

      const redirectPath = roleDashboards[user.role] || "/dashboard";

      console.log("🚀 NAVIGATING TO:", redirectPath);

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("❌ LOGIN ERROR:", error);

      const message =
        error.response?.data?.message || error.message || "Login failed";

      setErrorMessage(message);
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setErrorMessage("");

    if (!formData.password || !formData.role || !formData.userId) {
      const msg = "Please fill in all login fields";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    await performLogin(formData.userId, formData.password, formData.role);
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
                type="button"
              >
                <span className="role-icon">{roleIcons[r]}</span>
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form">
            <Input
              label={`${role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"} ID`}
              name="userId"
              value={formData.userId}
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

            {errorMessage && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ❌ {errorMessage}
              </div>
            )}

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
                  creds: "ID: parent123 / Password: parent123",
                  color: "#4f46e5",
                },
                {
                  role: "teacher",
                  icon: FaChalkboardTeacher,
                  label: "Teacher Demo",
                  creds: "ID: teacher123 / Password: teacher123",
                  color: "#4f46e5",
                },
                {
                  role: "student",
                  icon: FaUserGraduate,
                  label: "Student Demo",
                  creds: "ID: student123 / Password: student123",
                  color: "#4f46e5",
                },
                {
                  role: "admin",
                  icon: FiBarChart2,
                  label: "Admin Demo",
                  creds: "ID: admin123 / Password: admin123",
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
