import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user: storeUser } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getMenuItems = () => {
    const role = user?.role;

    // ============ PARENT MENU ============
    if (role === "parent") {
      return [
        { path: "/dashboard", icon: FiHome, label: "Dashboard" },
        { path: "/announcements", icon: FiBell, label: "Announcements" },
        { path: "/messages", icon: FiMessageSquare, label: "Messages" },
        { path: "/calendar", icon: FiCalendar, label: "Calendar" },
        { path: "/homework", icon: FiClipboard, label: "Homework" },
        { path: "/materials", icon: FiFolder, label: "Materials" },
        { path: "/profile", icon: FiUser, label: "Profile" },
      ];
    }

    // ============ TEACHER MENU ============
    if (role === "teacher") {
      return [
        { path: "/dashboard", icon: FiHome, label: "Dashboard" },
        { path: "/announcements", icon: FiBell, label: "Announcements" },
        { path: "/messages", icon: FiMessageSquare, label: "Messages" },
        { path: "/calendar", icon: FiCalendar, label: "Calendar" },
        { path: "/materials", icon: FiFolder, label: "Materials" },
        { path: "/homework", icon: FiClipboard, label: "Homework" },
      ];
    }

    // ============ STUDENT MENU ============
    if (role === "student") {
      return [
        { path: "/dashboard", icon: FiHome, label: "Dashboard" },
        { path: "/announcements", icon: FiBell, label: "Announcements" },
        { path: "/calendar", icon: FiCalendar, label: "Calendar" },
        { path: "/homework", icon: FiClipboard, label: "Homework" },
        { path: "/materials", icon: FiFolder, label: "Materials" },
        { path: "/profile", icon: FiUser, label: "Profile" },
      ];
    }

    // ============ ADMIN MENU ============
    if (role === "admin") {
      return [
        { path: "/dashboard", icon: FiHome, label: "Dashboard" },
        { path: "/announcements", icon: FiBell, label: "Announcements" },
        { path: "/calendar", icon: FiCalendar, label: "Calendar" },
        { path: "/profile", icon: FiUser, label: "Profile" },
      ];
    }

    // Default fallback
    return [
      { path: "/dashboard", icon: FiHome, label: "Dashboard" },
      { path: "/profile", icon: FiUser, label: "Profile" },
    ];
  };

  const menuItems = getMenuItems();

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      style={({ isActive }) => ({
        ...styles.navItem,
        ...(isActive ? styles.navItemActive : {}),
        ...(isCollapsed ? styles.navItemCollapsed : {}),
      })}
      title={isCollapsed ? item.label : undefined}
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
          {!isCollapsed && <span style={styles.navLabel}>{item.label}</span>}
        </>
      )}
    </NavLink>
  );

  // Add logout button at the end
  const allItems = [
    ...menuItems,
    { path: "#", icon: FiLogOut, label: "Logout", isLogout: true },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={styles.sidebar}
    >
      {/* Logo Section */}
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
        <button
          onClick={onToggleCollapse}
          style={styles.collapseBtn}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <FiChevronRight size={16} />
          ) : (
            <FiChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {allItems.map((item) =>
          item.isLogout ? (
            <button
              key="logout"
              onClick={handleLogout}
              style={{
                ...styles.navItem,
                ...(isCollapsed ? styles.navItemCollapsed : {}),
                ...styles.logoutBtn,
              }}
            >
              <FiLogOut size={18} style={styles.navIcon} />
              {!isCollapsed && <span style={styles.navLabel}>Logout</span>}
            </button>
          ) : (
            <NavItem key={item.path} item={item} />
          ),
        )}
      </nav>
    </motion.aside>
  );
};

const styles = {
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
