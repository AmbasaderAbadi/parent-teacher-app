import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
  FiLock,
  FiArrowRight,
  FiX,
  FiBarChart2,
  FiPhone,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate, FaUsers } from "react-icons/fa";
import "../../../assets/styles/auth-pages.css";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/api";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    password: "",
    phoneNumber: "",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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

  const performLogin = async (phoneNumber, password, role) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authAPI.login({
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
        role,
      });

      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", user.role);

      navigate(`/${user.role}-dashboard`, { replace: true });

      toast.success(`Welcome back, ${user.firstName || user.phoneNumber}!`);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.password || !formData.role || !formData.phoneNumber) {
      const msg = "Please fill in all login fields";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    await performLogin(formData.phoneNumber, formData.password, formData.role);
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
              label={`${role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"} Phone Number`}
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder={`Enter your ${role || "user"} phone number`}
              icon={<FiPhone />}
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

            {/* Forgot Password Link */}
            <div className="text-right mb-4">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

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
