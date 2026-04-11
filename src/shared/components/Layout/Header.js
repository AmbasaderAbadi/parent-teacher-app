// Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiUser,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiLock,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Header = ({ onToggleSidebar }) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  const dropdownItems = [
    {
      icon: FiUser,
      label: "Profile Settings",
      action: () => navigate("/profile"),
    },
    {
      icon: FiLock,
      label: "Change Password",
      action: () => navigate("/settings/password"),
    },
    {
      icon: FiSettings,
      label: "Preferences",
      action: () => navigate("/settings"),
    },
  ];

  return (
    <motion.header
      style={{
        ...styles.header,
        ...(scrolled ? styles.headerScrolled : {}),
      }}
    >
      <div style={styles.headerContent}>
        {/* Left: Toggle + Welcome */}
        <div style={styles.leftSection}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            style={styles.menuToggle}
            aria-label="Toggle sidebar"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.welcomeText}
          >
            Welcome back,{" "}
            <span style={{ ...styles.gradientText, background: gradient }}>
              {user?.name?.split(" ")[0] || "User"}
            </span>
            <span style={{ marginLeft: "4px" }}>👋</span>
          </motion.h1>
        </div>

        {/* Right: Actions */}
        <div style={styles.rightSection}>
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.iconBtn}
            aria-label="Notifications"
          >
            <FiBell size={20} style={styles.icon} />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={styles.badge}
            >
              3
            </motion.span>
          </motion.button>

          {/* User Dropdown */}
          <div style={styles.dropdownContainer} ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                ...styles.userBtn,
                ...(showDropdown ? styles.userBtnActive : {}),
              }}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <div style={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase()}
                <span style={styles.onlineDot} />
              </div>
              <div style={styles.userInfo}>
                <p style={styles.userName}>{user?.name}</p>
                <p style={styles.userRole}>{user?.role}</p>
              </div>
              <FiChevronDown
                size={14}
                style={{
                  ...styles.chevron,
                  transform: showDropdown ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={styles.dropdown}
                >
                  {/* User Header */}
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownName}>{user?.name}</p>
                    <p style={styles.dropdownEmail}>{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div style={styles.dropdownItems}>
                    {dropdownItems.map((item, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          setShowDropdown(false);
                          item.action();
                        }}
                        style={styles.dropdownItem}
                      >
                        <item.icon size={16} style={styles.dropdownIcon} />
                        {item.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Logout */}
                  <div style={styles.dropdownDivider} />
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={handleLogout}
                    style={styles.logoutItem}
                  >
                    <FiLogOut size={16} style={styles.logoutIcon} />
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(229, 231, 235, 0.8)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  headerScrolled: {
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
  },
  headerContent: {
    height: "64px",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  menuToggle: {
    padding: "8px",
    borderRadius: "12px",
    border: "none",
    background: "transparent",
    color: "#6b7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
  },
  gradientText: {
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  iconBtn: {
    position: "relative",
    padding: "10px",
    borderRadius: "12px",
    border: "none",
    background: "transparent",
    color: "#6b7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  icon: {
    transition: "color 0.2s ease",
  },
  badge: {
    position: "absolute",
    top: "4px",
    right: "4px",
    minWidth: "18px",
    height: "18px",
    borderRadius: "9px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  dropdownContainer: {
    position: "relative",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 10px",
    borderRadius: "12px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  userBtnActive: {
    backgroundColor: "#f3f4f6",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    position: "relative",
    flexShrink: 0,
  },
  onlineDot: {
    position: "absolute",
    bottom: "1px",
    right: "1px",
    width: "9px",
    height: "9px",
    backgroundColor: "#22c55e",
    borderRadius: "50%",
    border: "2px solid white",
  },
  userInfo: {
    display: "none",
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: 0,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "120px",
  },
  userRole: {
    fontSize: "11px",
    color: "#6b7280",
    margin: 0,
    textTransform: "capitalize",
  },
  chevron: {
    color: "#9ca3af",
    transition: "transform 0.2s ease",
    display: "none",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: "224px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
    border: "1px solid #e5e7eb",
    padding: "8px",
    zIndex: 50,
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
  },
  dropdownName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
  },
  dropdownEmail: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "2px 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownItems: {
    padding: "4px 0",
  },
  dropdownItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#4a5568",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  dropdownIcon: {
    color: "#9ca3af",
    flexShrink: 0,
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#f3f4f6",
    margin: "4px 0",
  },
  logoutItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  logoutIcon: {
    flexShrink: 0,
  },
};

// Responsive adjustments via media query injection
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @media (min-width: 768px) {
    .user-info { display: flex !important; }
    .chevron { display: block !important; }
  }
  button:hover { transform: translateY(-1px); }
  .nav-item:hover { background: #f9fafb; }
`;
document.head.appendChild(styleSheet);
