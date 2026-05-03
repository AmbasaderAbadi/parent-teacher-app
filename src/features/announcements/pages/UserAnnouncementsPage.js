import React, { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { announcementsAPI } from "../../../services/api";
import toast from "react-hot-toast";

const UserAnnouncementsPage = () => {
  const { t } = useTranslation();
  const { user: storeUser } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Get user from localStorage if store is empty
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    } else if (storeUser) {
      setCurrentUser(storeUser);
    }
  }, [storeUser]);

  useEffect(() => {
    if (currentUser) {
      fetchAnnouncements();
    }
  }, [currentUser]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsAPI.getAllAnnouncements();
      let allData = response.data;
      if (allData?.data && Array.isArray(allData.data)) {
        allData = allData.data;
      } else if (
        allData?.announcements &&
        Array.isArray(allData.announcements)
      ) {
        allData = allData.announcements;
      } else if (!Array.isArray(allData)) {
        allData = [];
      }

      const filtered = filterAnnouncementsByUser(allData, currentUser);

      const formatted = filtered.map((ann) => ({
        id: ann.id || ann._id,
        title: ann.title,
        content: ann.content,
        targetAudience: ann.targetAudience || "all",
        targetGrade: ann.targetGrade,
        targetSection: ann.targetSection,
        date: ann.createdAt
          ? new Date(ann.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        postedBy: ann.postedBy || ann.createdBy?.name || "Admin",
      }));

      setAnnouncements(formatted);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      if (error.response?.status !== 401) {
        toast.error(t("failed_load_announcements"));
      }
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncementsByUser = (allAnnouncements, userData) => {
    if (!userData || !Array.isArray(allAnnouncements)) return [];

    return allAnnouncements.filter((ann) => {
      const target = ann.targetAudience || "all";

      if (target === "all") return true;
      if (target === "teachers" && userData.role === "teacher") return true;
      if (target === "parents" && userData.role === "parent") return true;
      if (target === "students" && userData.role === "student") return true;

      if (userData.role === "student" && ann.targetGrade) {
        if (ann.targetGrade === userData.grade) {
          if (ann.targetSection) {
            return (
              ann.targetSection === (userData.className || userData.section)
            );
          }
          return true;
        }
      }

      if (
        userData.role === "parent" &&
        userData.children &&
        Array.isArray(userData.children)
      ) {
        return userData.children.some((child) => {
          if (ann.targetGrade && ann.targetGrade === child.grade) {
            if (ann.targetSection) {
              return ann.targetSection === child.section;
            }
            return true;
          }
          return false;
        });
      }

      return false;
    });
  };

  const getTargetText = (ann) => {
    const target = ann.targetAudience || "all";
    if (target === "all") return `📢 ${t("everyone")}`;
    if (target === "teachers") return `👥 ${t("teachers_only")}`;
    if (target === "parents") return `👥 ${t("parents_only")}`;
    if (target === "students") return `👥 ${t("students_only")}`;
    if (ann.targetGrade && ann.targetSection) {
      return `🏫 ${ann.targetGrade} - ${t("section")} ${ann.targetSection}`;
    }
    if (ann.targetGrade) return `📚 ${ann.targetGrade}`;
    return `🎯 ${t("specific_audience")}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner" />
        <p>{t("loading_announcements")}</p>
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t("announcements")}</h1>
        <p style={styles.subtitle}>{t("stay_updated")}</p>
      </div>

      {currentUser && (
        <div style={styles.userInfo}>
          <p>
            {t("showing_announcements_for")}{" "}
            <strong>{currentUser.role?.toUpperCase()}</strong>
            {currentUser.grade && ` • ${currentUser.grade}`}
            {(currentUser.className || currentUser.section) &&
              ` • ${t("section")} ${currentUser.className || currentUser.section}`}
            {currentUser.role === "parent" &&
              currentUser.children &&
              ` • ${t("children")}: ${currentUser.children.map((c) => c.name).join(", ")}`}
          </p>
        </div>
      )}

      {announcements.length === 0 ? (
        <div style={styles.empty}>
          <FiBell size={48} style={styles.emptyIcon} />
          <p>{t("no_announcements_for_you")}</p>
          <p style={styles.emptySubtext}>{t("check_back_later")}</p>
        </div>
      ) : (
        <div style={styles.announcementsList}>
          {announcements.map((ann) => (
            <div key={ann.id} style={styles.announcementCard}>
              <div style={styles.announcementHeader}>
                <FiBell size={20} style={{ color: "#4f46e5" }} />
                <div>
                  <h3>{ann.title}</h3>
                  {ann.targetAudience !== "all" && (
                    <span style={styles.targetBadge}>{getTargetText(ann)}</span>
                  )}
                </div>
              </div>
              <p style={styles.announcementContent}>{ann.content}</p>
              <p style={styles.meta}>
                {ann.postedBy} • {ann.date}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 4px",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
  userInfo: {
    marginBottom: "20px",
    padding: "10px 16px",
    backgroundColor: "#eef2ff",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
  },
  empty: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptyIcon: { marginBottom: "16px", opacity: 0.5 },
  emptySubtext: { fontSize: "12px", marginTop: "8px", color: "#d1d5db" },
  announcementsList: { display: "flex", flexDirection: "column", gap: "16px" },
  announcementCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.2s ease",
  },
  announcementHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  targetBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    fontSize: "10px",
    marginTop: "4px",
    marginLeft: "8px",
  },
  announcementContent: {
    color: "#4b5563",
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  meta: { fontSize: "12px", color: "#6b7280" },
};

export default UserAnnouncementsPage;
