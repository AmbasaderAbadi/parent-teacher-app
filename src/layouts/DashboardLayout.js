import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiBell } from "react-icons/fi";

const DashboardLayout = ({ children, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span style={styles.logoText}>ParentTeacher Portal</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.iconBtn}>
            <FiBell size={20} />
          </button>
          <div style={styles.userInfo}>
            <FiUser size={18} />
            <span style={styles.userName}>{user?.name || "User"}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  nav: {
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  logoText: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  main: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
};

export default DashboardLayout;
