import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiArrowRight, FiX, FiBarChart2 } from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate, FaUsers } from "react-icons/fa";
import toast from "react-hot-toast";

const LoginPage = ({ setUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    password: "",
    id: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role: role });
  };

  const handleClose = () => {
    navigate("/");
  };

  // Demo accounts for testing (including Admin)
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
    // ✅ ADMIN DEMO ACCOUNT
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

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Demo login validation
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
        switch (demo.role) {
          case "teacher":
            window.location.href = "/teacher-dashboard";
            break;
          case "student":
            window.location.href = "/student-dashboard";
            break;
          case "parent":
            window.location.href = "/parent-dashboard";
            break;
          case "admin":
            window.location.href = "/admin-dashboard";
            break;
          default:
            window.location.href = "/dashboard";
        }
      }, 100);
    } else {
      toast.error("Invalid credentials. Use demo accounts below.");
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { role, password, id } = formData;
    if (!password || !role || !id) {
      toast.error("Please fill in all login fields");
      return;
    }

    await performLogin(id, password, role);
  };

  const { role } = formData;

  const roleIcons = {
    teacher: <FaChalkboardTeacher size={24} />,
    parent: <FaUsers size={24} />,
    student: <FaUserGraduate size={24} />,
    admin: <FiBarChart2 size={24} />,
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
          <h2 style={styles.infoTitle}>Welcome Back!</h2>
          <p style={styles.infoDesc}>
            Sign in to access your dashboard and stay connected with your
            educational community.
          </p>
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
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.formPanel}
        >
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Sign In</h2>
            <p style={styles.formSubtitle}>
              Enter your credentials to access your account
            </p>
          </div>

          {/* Role Selection */}
          <div style={styles.roleContainer}>
            {["parent", "teacher", "student"].map((r) => (
              <motion.button
                key={r}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...styles.roleButton,
                  backgroundColor: role === r ? "#4f46e5" : "#f3f4f6",
                  color: role === r ? "white" : "#374151",
                  borderColor: role === r ? "#4f46e5" : "#e5e7eb",
                }}
                onClick={() => handleRoleSelect(r)}
              >
                <span style={styles.roleIcon}>{roleIcons[r]}</span>
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
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
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingSpinner}></span>
              ) : (
                <>
                  Sign In
                  <FiArrowRight style={styles.buttonIcon} />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Accounts Section - Now includes Admin */}
          <div style={styles.demoBox}>
            <p style={styles.demoTitle}>
              🎭 Demo Accounts (Click to login instantly)
            </p>
            <div style={styles.demoGrid}>
              <button
                onClick={() => handleDemoLogin("parent")}
                style={styles.demoCard}
              >
                <FaUsers size={20} style={{ color: "#4f46e5" }} />
                <div>
                  <strong>Parent Demo</strong>
                  <p style={styles.demoText}>parent123 / parent123</p>
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin("teacher")}
                style={styles.demoCard}
              >
                <FaChalkboardTeacher size={20} style={{ color: "#4f46e5" }} />
                <div>
                  <strong>Teacher Demo</strong>
                  <p style={styles.demoText}>teacher123 / teacher123</p>
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin("student")}
                style={styles.demoCard}
              >
                <FaUserGraduate size={20} style={{ color: "#4f46e5" }} />
                <div>
                  <strong>Student Demo</strong>
                  <p style={styles.demoText}>student123 / student123</p>
                </div>
              </button>
              {/* ✅ ADMIN DEMO BUTTON */}
              <button
                onClick={() => handleDemoLogin("admin")}
                style={styles.demoCard}
              >
                <FiBarChart2 size={20} style={{ color: "#ef4444" }} />
                <div>
                  <strong>Admin Demo</strong>
                  <p style={styles.demoText}>admin123 / admin123</p>
                </div>
              </button>
            </div>
          </div>

          <div style={styles.toggleContainer}>
            <p style={styles.toggleText}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                style={styles.toggleLink}
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
}) => (
  <div style={styles.inputWrapper}>
    <label style={styles.inputLabel}>{label}</label>
    <div style={styles.inputContainer}>
      {icon && <span style={styles.inputIcon}>{icon}</span>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
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
    maxWidth: "1100px",
    width: "90%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    backgroundColor: "white",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    zIndex: 10,
    position: "relative",
  },
  infoPanel: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "48px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "48px",
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
    fontSize: "20px",
    fontWeight: "600",
  },
  infoTitle: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "16px",
  },
  infoDesc: {
    fontSize: "16px",
    opacity: 0.9,
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  infoFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoFeature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
  },
  infoIcon: {
    width: "20px",
    height: "20px",
  },
  formPanel: {
    padding: "48px",
    backgroundColor: "white",
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
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
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
  demoBox: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
  },
  demoTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
    textAlign: "center",
  },
  demoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  demoCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
    textAlign: "left",
  },
  demoText: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "2px",
  },
  toggleContainer: {
    textAlign: "center",
    marginTop: "20px",
  },
  toggleText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  toggleLink: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
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
  input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  .demo-card:hover {
    transform: translateX(5px);
    border-color: #4f46e5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .close-button:hover {
    transform: scale(1.1);
    background-color: #f3f4f6;
  }
`;
document.head.appendChild(styleSheet);

export default LoginPage;
