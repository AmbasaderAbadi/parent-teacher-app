// MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../shared/components/Layout/Sidebar";
import { Header } from "../shared/components/Layout/Header";

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true);
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div style={styles.layout}>
      <Sidebar
        isCollapsed={isMobile ? sidebarCollapsed : sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <motion.div
        animate={{ marginLeft: isMobile ? 0 : sidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={styles.mainArea}
      >
        <Header onToggleSidebar={toggleSidebar} />

        <main style={styles.mainContent}>
          <div style={styles.contentWrapper}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © {new Date().getFullYear()} Parent-Teacher Relationship Portal. All
            rights reserved.
          </p>
        </footer>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  mainContent: {
    flex: 1,
    padding: "24px",
    overflow: "auto",
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  footer: {
    padding: "16px 24px",
    textAlign: "center",
    fontSize: "12px",
    color: "#6b7280",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  footerText: {
    margin: 0,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 35,
    backdropFilter: "blur(4px)",
  },
};
