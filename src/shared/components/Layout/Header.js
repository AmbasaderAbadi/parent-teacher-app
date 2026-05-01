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
import NotificationsDropdown from "../../../components/NotificationsDropdown";
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Get user's full name or first name from localStorage
  const getUserData = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    return user || {};
  };

  const userData = getUserData();

  const getFullName = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.firstName) {
      return userData.firstName;
    }
    if (userData.name) {
      return userData.name;
    }
    return "User";
  };

  const getFirstName = () => {
    if (userData.firstName) {
      return userData.firstName;
    }
    if (userData.name) {
      return userData.name.split(" ")[0];
    }
    return "User";
  };

  const getUserInitial = () => {
    if (userData.firstName) {
      return userData.firstName.charAt(0).toUpperCase();
    }
    if (userData.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserRole = () => {
    if (userData.role) {
      return userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    }
    return "User";
  };

  const getUserEmail = () => {
    return userData.email || "";
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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
      action: () => navigate("/settings/preferences"),
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

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.welcomeContainer}
          >
            <span style={styles.greeting}>{getTimeBasedGreeting()},</span>
            <span style={styles.userNameText}>{getFirstName()}</span>
            <span style={styles.emoji}>👋</span>
          </motion.div>
        </div>

        {/* Right: Actions */}
        <div style={styles.rightSection}>
          {/* Notifications Dropdown */}
          <NotificationsDropdown />

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
                {getUserInitial()}
                <span style={styles.onlineDot} />
              </div>
              <div style={styles.userInfo}>
                <p style={styles.userName}>{getFullName()}</p>
                <p style={styles.userRole}>{getUserRole()}</p>
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
                    <p style={styles.dropdownName}>{getFullName()}</p>
                    <p style={styles.dropdownEmail}>{getUserEmail()}</p>
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
  welcomeContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    flexWrap: "wrap",
  },
  greeting: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#6b7280",
  },
  userNameText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
  },
  emoji: {
    fontSize: "16px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
