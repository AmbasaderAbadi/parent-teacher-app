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
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { useAuth } from "../../../contexts/AuthContext";
import NotificationsDropdown from "../../../components/NotificationsDropdown";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const Header = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dropdownRef = useRef(null);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

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

  const confirmLogout = () => {
    logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    toast.success(t("logged_out_success"));
    navigate("/login");
    setShowConfirmModal(false);
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowConfirmModal(true);
  };

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
    if (userData.firstName) return userData.firstName;
    if (userData.name) return userData.name;
    return t("user");
  };

  const getFirstName = () => {
    if (userData.firstName) return userData.firstName;
    if (userData.name) return userData.name.split(" ")[0];
    return t("user");
  };

  const getUserInitial = () => {
    if (userData.firstName) return userData.firstName.charAt(0).toUpperCase();
    if (userData.name) return userData.name.charAt(0).toUpperCase();
    return "U";
  };

  const getUserRole = () => {
    if (userData.role) {
      return userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    }
    return t("user");
  };

  const getUserEmail = () => userData.email || "";

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("good_morning");
    if (hour < 18) return t("good_afternoon");
    return t("good_evening");
  };

  const dropdownItems = [
    {
      icon: FiUser,
      label: t("profile_settings"),
      action: () => navigate("/profile"),
    },
    {
      icon: FiLock,
      label: t("change_password"),
      action: () => navigate("/settings/password"),
    },
    {
      icon: FiSettings,
      label: t("preferences"),
      action: () => navigate("/settings/preferences"),
    },
  ];

  return (
    <>
      <motion.header
        style={{ ...styles.header, ...(scrolled ? styles.headerScrolled : {}) }}
      >
        <div style={styles.headerContent}>
          <div style={styles.leftSection}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              style={styles.menuToggle}
              aria-label={t("toggle_sidebar")}
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

          <div style={styles.rightSection}>
            <NotificationsDropdown />
            <div style={styles.dropdownContainer} ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  ...styles.userBtn,
                  ...(showDropdown ? styles.userBtnActive : {}),
                }}
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
                    <div style={styles.dropdownHeader}>
                      <p style={styles.dropdownName}>{getFullName()}</p>
                      <p style={styles.dropdownEmail}>{getUserEmail()}</p>
                    </div>
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
                    <div style={styles.dropdownDivider} />
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={handleLogoutClick}
                      style={styles.logoutItem}
                    >
                      <FiLogOut size={16} style={styles.logoutIcon} />
                      {t("logout")}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Confirm Logout Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={styles.modalBackdrop}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>{t("confirm_logout")}</h3>
              <p style={styles.modalText}>{t("logout_confirmation_message")}</p>
              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={styles.modalCancelBtn}
                >
                  {t("cancel")}
                </button>
                <button onClick={confirmLogout} style={styles.modalConfirmBtn}>
                  {t("logout")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const styles = {
  // Keep all existing styles EXACTLY as in your original Header.jsx,
  // plus add these new modal styles:
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    width: "90%",
    maxWidth: "400px",
    boxShadow:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "12px",
  },
  modalText: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  modalCancelBtn: {
    padding: "8px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    transition: "all 0.2s ease",
  },
  modalConfirmBtn: {
    padding: "8px 20px",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    transition: "all 0.2s ease",
  },

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
