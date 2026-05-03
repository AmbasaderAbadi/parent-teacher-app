import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBell,
  FiMail,
  FiMessageSquare,
  FiMoon,
  FiSun,
  FiGlobe,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const defaultNotifications = {
  email: true,
  push: true,
  sms: false,
  gradeAlerts: true,
  attendanceAlerts: true,
  messageAlerts: true,
  announcementAlerts: true,
};

const defaultPreferences = {
  theme: "light",
  language: "en",
  notifications: defaultNotifications,
  emailFrequency: "instant",
};

export const PreferencesPage = () => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = localStorage.getItem("userPreferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        const notifications = {
          ...defaultNotifications,
          ...parsed.notifications,
        };
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          notifications,
        });
        // Sync language with i18n
        const lang = parsed.language || "en";
        if (lang !== i18n.language) {
          i18n.changeLanguage(lang);
        }
      } else {
        setPreferences(defaultPreferences);
        i18n.changeLanguage("en");
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setPreferences(defaultPreferences);
    }
  };

  const handleNotificationToggle = (key) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key],
      },
    });
  };

  const handleChange = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
    if (key === "language") {
      i18n.changeLanguage(value);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      if (preferences.theme === "dark") {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    i18n.changeLanguage("en");
    toast.info("Preferences reset to default");
  };

  // Ensure notifications exists before rendering
  const notifications = preferences.notifications || defaultNotifications;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Preferences</h1>
          <p style={styles.subtitle}>Customize your app experience</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        {/* Appearance Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiSun size={18} /> Appearance
          </h3>
          <div style={styles.themeOptions}>
            <button
              onClick={() => handleChange("theme", "light")}
              style={{
                ...styles.themeBtn,
                ...(preferences.theme === "light" ? styles.themeBtnActive : {}),
              }}
            >
              <FiSun size={20} /> Light
            </button>
            <button
              onClick={() => handleChange("theme", "dark")}
              style={{
                ...styles.themeBtn,
                ...(preferences.theme === "dark" ? styles.themeBtnActive : {}),
              }}
            >
              <FiMoon size={20} /> Dark
            </button>
          </div>
        </div>

        {/* Language Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiGlobe size={18} /> Language
          </h3>
          <select
            value={preferences.language}
            onChange={(e) => handleChange("language", e.target.value)}
            style={styles.select}
          >
            <option value="en">English</option>
            <option value="am">አማርኛ (Amharic)</option>
            <option value="ti">ትግርኛ (Tigrinya)</option>
          </select>
        </div>

        {/* Notifications Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiBell size={18} /> Notification Preferences
          </h3>

          <div style={styles.notificationGroup}>
            <div style={styles.notificationItem}>
              <div>
                <p style={styles.notificationLabel}>Email Notifications</p>
                <p style={styles.notificationDesc}>Receive updates via email</p>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationToggle("email")}
                />
                <span style={styles.slider}></span>
              </label>
            </div>

            <div style={styles.notificationItem}>
              <div>
                <p style={styles.notificationLabel}>Push Notifications</p>
                <p style={styles.notificationDesc}>
                  Receive push notifications in browser
                </p>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationToggle("push")}
                />
                <span style={styles.slider}></span>
              </label>
            </div>

            <div style={styles.notificationItem}>
              <div>
                <p style={styles.notificationLabel}>SMS Notifications</p>
                <p style={styles.notificationDesc}>
                  Receive SMS alerts (charges may apply)
                </p>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={() => handleNotificationToggle("sms")}
                />
                <span style={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Alert Types Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiMail size={18} /> Alert Types
          </h3>

          <div style={styles.alertGrid}>
            <div style={styles.alertItem}>
              <span>📊 Grade Alerts</span>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.gradeAlerts}
                  onChange={() => handleNotificationToggle("gradeAlerts")}
                />
                <span style={styles.slider}></span>
              </label>
            </div>

            <div style={styles.alertItem}>
              <span>📅 Attendance Alerts</span>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.attendanceAlerts}
                  onChange={() => handleNotificationToggle("attendanceAlerts")}
                />
                <span style={styles.slider}></span>
              </label>
            </div>

            <div style={styles.alertItem}>
              <span>💬 Message Alerts</span>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.messageAlerts}
                  onChange={() => handleNotificationToggle("messageAlerts")}
                />
                <span style={styles.slider}></span>
              </label>
            </div>

            <div style={styles.alertItem}>
              <span>📢 Announcement Alerts</span>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={notifications.announcementAlerts}
                  onChange={() =>
                    handleNotificationToggle("announcementAlerts")
                  }
                />
                <span style={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Email Frequency */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiMessageSquare size={18} /> Email Frequency
          </h3>
          <div style={styles.frequencyOptions}>
            {["instant", "daily", "weekly"].map((freq) => (
              <button
                key={freq}
                onClick={() => handleChange("emailFrequency", freq)}
                style={{
                  ...styles.freqBtn,
                  ...(preferences.emailFrequency === freq
                    ? styles.freqBtnActive
                    : {}),
                }}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={handleReset} style={styles.resetBtn}>
            <FiRefreshCw size={16} /> Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={styles.saveBtn}
          >
            {loading ? (
              <span className="loading-spinner-small"></span>
            ) : (
              <>
                <FiSave size={16} /> Save Preferences
              </>
            )}
          </button>
        </div>
      </motion.div>

      <style>{`
        .loading-spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .dark-mode {
          background-color: #1a1a2e;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  section: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
  },
  themeOptions: {
    display: "flex",
    gap: "16px",
  },
  themeBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  themeBtnActive: {
    backgroundColor: "#4f46e5",
    color: "white",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  notificationGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  notificationItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
  },
  notificationLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: "2px",
  },
  notificationDesc: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "50px",
    height: "24px",
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#cbd5e1",
    transition: "0.3s",
    borderRadius: "24px",
    "&:before": {
      position: "absolute",
      content: '""',
      height: "18px",
      width: "18px",
      left: "3px",
      bottom: "3px",
      backgroundColor: "white",
      transition: "0.3s",
      borderRadius: "50%",
    },
  },
  alertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  alertItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    fontSize: "13px",
  },
  frequencyOptions: {
    display: "flex",
    gap: "12px",
  },
  freqBtn: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  freqBtnActive: {
    backgroundColor: "#4f46e5",
    color: "white",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "16px",
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 24px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
};
