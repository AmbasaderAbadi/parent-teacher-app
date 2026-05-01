import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { homeworkAPI } from "../../../services/api";
import toast from "react-hot-toast";

const ParentHomeworkPage = () => {
  const { user: storeUser } = useAuthStore();
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // Get parent and children from localStorage or auth store
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let userData = storeUser;
    if (storedUser && !userData) {
      try {
        userData = JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    if (userData && userData.children && Array.isArray(userData.children)) {
      setChildren(userData.children);
      if (userData.children.length > 0) {
        setSelectedChild(userData.children[0]);
      }
    } else {
      setChildren([]);
      setLoading(false);
    }
  }, [storeUser]);

  useEffect(() => {
    if (selectedChild) {
      fetchHomeworks(selectedChild);
    }
  }, [selectedChild]);

  const fetchHomeworks = async (child) => {
    setLoading(true);
    try {
      const response = await homeworkAPI.getAllHomework();
      let allHomeworks = response.data?.data || response.data || [];
      if (!Array.isArray(allHomeworks)) allHomeworks = [];

      // Filter by child's grade and section
      const filtered = allHomeworks.filter((hw) => {
        if (hw.grade !== child.grade) return false;
        if (hw.className && hw.className !== child.section) return false;
        return true;
      });

      const formattedHomeworks = filtered.map((hw) => ({
        id: hw.id || hw._id,
        title: hw.title,
        subject: hw.subject,
        description: hw.description,
        dueDate: hw.dueDate?.split("T")[0] || hw.dueDate,
        dueTime: hw.dueTime || "23:59",
        child: child.name,
        childId: child.id,
        status: hw.status || "pending",
        submittedDate: hw.submittedDate,
        marks: hw.marks,
        postedBy: hw.postedBy || hw.teacherName,
        postedDate: hw.createdAt
          ? new Date(hw.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));

      setHomeworks(formattedHomeworks);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      toast.error("Failed to load homework");
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "submitted":
        return {
          bg: "#dbeafe",
          color: "#2563eb",
          text: "Submitted",
          icon: <FiClock size={12} />,
        };
      case "graded":
        return {
          bg: "#d1fae5",
          color: "#065f46",
          text: "Graded",
          icon: <FiCheckCircle size={12} />,
        };
      default:
        return {
          bg: "#fed7aa",
          color: "#92400e",
          text: "Pending",
          icon: <FiAlertCircle size={12} />,
        };
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading && !homeworks.length && children.length > 0) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading homework...</p>
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
        <div>
          <h1 style={styles.title}>📝 Homework</h1>
          <p style={styles.subtitle}>Track your children's assignments</p>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div style={styles.childSelector}>
          <label style={styles.childLabel}>Select Child:</label>
          <select
            value={selectedChild?.id}
            onChange={(e) => {
              const child = children.find(
                (c) =>
                  c.id === parseInt(e.target.value) || c.id === e.target.value,
              );
              setSelectedChild(child);
            }}
            style={styles.childSelect}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name} - {child.grade} Section {child.section}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedChild && (
        <div style={styles.childInfo}>
          <p>
            Showing homework for: <strong>{selectedChild.name}</strong> (
            {selectedChild.grade} - Section {selectedChild.section})
          </p>
        </div>
      )}

      <div style={styles.homeworkList}>
        {homeworks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No homework assignments found for this child.</p>
          </div>
        ) : (
          homeworks.map((hw) => {
            const statusBadge = getStatusBadge(hw.status);
            const overdue = isOverdue(hw.dueDate) && hw.status === "pending";

            return (
              <div key={hw.id} style={styles.homeworkCard}>
                <div style={styles.homeworkHeader}>
                  <div>
                    <h3 style={styles.homeworkTitle}>{hw.title}</h3>
                    <div style={styles.homeworkMeta}>
                      <span style={styles.subjectBadge}>{hw.subject}</span>
                      <span>
                        <FiCalendar size={12} /> Due: {hw.dueDate} by{" "}
                        {hw.dueTime}
                      </span>
                      {overdue && (
                        <span style={styles.overdueBadge}>Overdue!</span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color,
                    }}
                  >
                    {statusBadge.icon}
                    <span>{statusBadge.text}</span>
                    {hw.marks && (
                      <span style={styles.marksBadge}>Score: {hw.marks}%</span>
                    )}
                  </div>
                </div>

                <p style={styles.homeworkDescription}>{hw.description}</p>

                <div style={styles.homeworkFooter}>
                  <div style={styles.metaInfo}>
                    <p style={styles.meta}>
                      <FiClock size={12} /> Posted by: {hw.postedBy} on{" "}
                      {hw.postedDate}
                    </p>
                    {hw.submittedDate && (
                      <p style={styles.submittedDate}>
                        Submitted on: {hw.submittedDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
  header: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
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
  childSelector: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  childLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  childSelect: {
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    fontSize: "14px",
    cursor: "pointer",
  },
  childInfo: {
    marginBottom: "20px",
    padding: "8px 12px",
    backgroundColor: "#eef2ff",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#4f46e5",
  },
  homeworkList: { display: "flex", flexDirection: "column", gap: "16px" },
  homeworkCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.2s ease",
  },
  homeworkHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  homeworkTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  homeworkMeta: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    fontSize: "12px",
    color: "#6b7280",
    flexWrap: "wrap",
  },
  subjectBadge: {
    padding: "2px 8px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "12px",
    fontSize: "11px",
  },
  overdueBadge: {
    padding: "2px 8px",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    borderRadius: "12px",
    fontSize: "11px",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  marksBadge: {
    marginLeft: "8px",
    padding: "2px 6px",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: "10px",
  },
  homeworkDescription: {
    color: "#4b5563",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  homeworkFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "8px",
  },
  metaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  meta: {
    fontSize: "12px",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    margin: 0,
  },
  submittedDate: {
    fontSize: "12px",
    color: "#10b981",
    margin: 0,
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
};

export default ParentHomeworkPage;
