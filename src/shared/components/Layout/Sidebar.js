import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiFolder,
  FiBell,
  FiClipboard,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiUsers,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { user: storeUser } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Modal animation variants
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

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get user from store or localStorage
  useEffect(() => {
    const getUser = () => {
      if (storeUser) {
        setUser(storeUser);
        return;
      }
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing user:", e);
        }
      }
    };
    getUser();
  }, [storeUser]);

  const confirmLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success(t("logged_out_success"));
    navigate("/login");
    setShowConfirmModal(false);
  };

  const handleLogoutClick = () => {
    setShowConfirmModal(true);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getMenuItems = () => {
    const role = user?.role;
    if (role === "parent") {
      return [
        { path: "/dashboard", icon: FiHome, label: t("dashboard") },
        { path: "/announcements", icon: FiBell, label: t("announcements") },
        { path: "/messages", icon: FiMessageSquare, label: t("messages") },
        { path: "/calendar", icon: FiCalendar, label: t("calendar") },
        { path: "/homework", icon: FiClipboard, label: t("homework") },
        { path: "/materials", icon: FiFolder, label: t("materials") },
      ];
    }
    if (role === "teacher") {
      return [
        { path: "/dashboard", icon: FiHome, label: t("dashboard") },
        { path: "/announcements", icon: FiBell, label: t("announcements") },
        { path: "/messages", icon: FiMessageSquare, label: t("messages") },
        { path: "/calendar", icon: FiCalendar, label: t("calendar") },
        { path: "/materials", icon: FiFolder, label: t("materials") },
        { path: "/homework", icon: FiClipboard, label: t("homework") },
        { path: "/my-students", icon: FiUsers, label: t("my_students") },
        { path: "/my-quizzes", icon: FiBook, label: t("my_quizzes") },
      ];
    }
    if (role === "student") {
      return [
        { path: "/dashboard", icon: FiHome, label: t("dashboard") },
        { path: "/announcements", icon: FiBell, label: t("announcements") },
        { path: "/calendar", icon: FiCalendar, label: t("calendar") },
        { path: "/homework", icon: FiClipboard, label: t("homework") },
        { path: "/materials", icon: FiFolder, label: t("materials") },
      ];
    }
    if (role === "admin") {
      return [
        { path: "/dashboard", icon: FiHome, label: t("dashboard") },
        { path: "/announcements", icon: FiBell, label: t("announcements") },
        { path: "/calendar", icon: FiCalendar, label: t("calendar") },
        { path: "/admin/users", icon: FiUsers, label: t("manage_users") },
        { path: "/admin/stats", icon: FiClipboard, label: t("reports") },
      ];
    }
    return [
      { path: "/dashboard", icon: FiHome, label: t("dashboard") },
      { path: "/profile", icon: FiUser, label: t("profile") },
    ];
  };

  const menuItems = getMenuItems();

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => isMobile && setMobileMenuOpen(false)}
      style={({ isActive }) => ({
        ...styles.navItem,
        ...(isActive ? styles.navItemActive : {}),
        ...(isCollapsed && !isMobile ? styles.navItemCollapsed : {}),
      })}
      title={isCollapsed && !isMobile ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && <span style={styles.activeIndicator} />}
          <item.icon
            size={18}
            style={{
              ...styles.navIcon,
              color: isActive ? "#4f46e5" : "#6b7280",
            }}
          />
          {(!isCollapsed || isMobile) && (
            <span style={styles.navLabel}>{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  );

  const allItems = [
    ...menuItems,
    { path: "#", icon: FiLogOut, label: t("logout"), isLogout: true },
  ];

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <>
        <button onClick={toggleMobileMenu} style={styles.mobileMenuBtn}>
          <FiMenu size={24} />
        </button>

        {mobileMenuOpen && (
          <div style={styles.mobileOverlay} onClick={toggleMobileMenu}>
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3 }}
              style={styles.mobileSidebar}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.logoSection}>
                <motion.div
                  style={styles.logoIcon}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span style={styles.logoText}>PT</span>
                </motion.div>
                <span style={styles.logoName}>ParentTeacher</span>
                <button
                  onClick={toggleMobileMenu}
                  style={styles.mobileCloseBtn}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>

              <nav style={styles.nav}>
                {allItems.map((item) =>
                  item.isLogout ? (
                    <button
                      key="logout"
                      onClick={handleLogoutClick}
                      style={{ ...styles.navItem, ...styles.logoutBtn }}
                    >
                      <FiLogOut size={18} style={styles.navIcon} />
                      <span style={styles.navLabel}>{t("logout")}</span>
                    </button>
                  ) : (
                    <NavItem key={item.path} item={item} />
                  ),
                )}
              </nav>
            </motion.aside>
          </div>
        )}

        {/* Confirm Modal */}
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
                <p style={styles.modalText}>
                  {t("logout_confirmation_message")}
                </p>
                <div style={styles.modalActions}>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    style={styles.modalCancelBtn}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={confirmLogout}
                    style={styles.modalConfirmBtn}
                  >
                    {t("logout")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={styles.sidebar}
      >
        <div style={styles.logoSection}>
          <motion.div
            style={styles.logoIcon}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={styles.logoText}>PT</span>
          </motion.div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={styles.logoName}
            >
              ParentTeacher
            </motion.span>
          )}
          <button onClick={onToggleCollapse} style={styles.collapseBtn}>
            {isCollapsed ? (
              <FiChevronRight size={16} />
            ) : (
              <FiChevronLeft size={16} />
            )}
          </button>
        </div>

        <nav style={styles.nav}>
          {allItems.map((item) =>
            item.isLogout ? (
              <button
                key="logout"
                onClick={handleLogoutClick}
                style={{
                  ...styles.navItem,
                  ...(isCollapsed ? styles.navItemCollapsed : {}),
                  ...styles.logoutBtn,
                }}
              >
                <FiLogOut size={18} style={styles.navIcon} />
                {!isCollapsed && (
                  <span style={styles.navLabel}>{t("logout")}</span>
                )}
              </button>
            ) : (
              <NavItem key={item.path} item={item} />
            ),
          )}
        </nav>
      </motion.aside>

      {/* Confirm Modal */}
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

  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflow: "hidden",
  },
  logoSection: {
    height: "64px",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #f3f4f6",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    color: "white",
    fontWeight: "700",
    fontSize: "14px",
  },
  logoName: {
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    whiteSpace: "nowrap",
  },
  collapseBtn: {
    marginLeft: "auto",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  nav: {
    flex: 1,
    padding: "20px 12px 16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#4a5568",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    position: "relative",
    cursor: "pointer",
  },
  navItemActive: {
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    fontWeight: "600",
  },
  navItemCollapsed: {
    justifyContent: "center",
    padding: "10px",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "8px",
    bottom: "8px",
    width: "3px",
    backgroundColor: "#4f46e5",
    borderRadius: "0 4px 4px 0",
  },
  navIcon: {
    flexShrink: 0,
    transition: "transform 0.2s ease",
  },
  navLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    color: "#dc2626",
    marginTop: "auto",
  },
  // Mobile styles
  mobileMenuBtn: {
    position: "fixed",
    top: "16px",
    left: "16px",
    zIndex: 50,
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  mobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  mobileSidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "280px",
    height: "100vh",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    zIndex: 1001,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflow: "hidden",
  },
  mobileCloseBtn: {
    marginLeft: "auto",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
};

// Hover effects via injected stylesheet
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .nav-item:hover { background: #f9fafb; }
  .nav-item:hover .nav-icon { transform: scale(1.05); }
  .logout-btn:hover { background: #fef2f2; }
`;
document.head.appendChild(styleSheet);
