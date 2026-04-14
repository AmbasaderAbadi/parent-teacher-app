import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import { homeworkAPI } from "../../../services/api";
import toast from "react-hot-toast";

const ParentHomeworkPage = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchHomeworks(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      let parentId = null;

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        parentId = userData.id;
      }

      // This endpoint needs to be created by your backend teammate
      // const response = await parentAPI.getChildren(parentId);
      // const childrenData = response.data;

      // Mock data for demonstration
      setTimeout(() => {
        const mockChildren = [
          {
            id: 1,
            name: "John Doe",
            grade: "Grade 10",
            section: "A",
            studentId: "STU001",
          },
          {
            id: 2,
            name: "Emma Doe",
            grade: "Grade 8",
            section: "B",
            studentId: "STU002",
          },
        ];
        setChildren(mockChildren);
        if (mockChildren.length > 0) {
          setSelectedChild(mockChildren[0]);
        } else {
          setLoading(false);
        }
      }, 500);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error("Failed to load children data");
      setLoading(false);
    }
  };

  const fetchHomeworks = async (childId) => {
    setLoading(true);
    try {
      // Fetch homework for the specific child/class
      // You may need to adjust this based on your API structure
      const response = await homeworkAPI.getMyHomework();
      let homeworkData = response.data;

      // Filter homework by child's grade/class
      const child = children.find((c) => c.id === childId);
      if (child) {
        homeworkData = homeworkData.filter(
          (hw) =>
            hw.className?.includes(child.grade) || hw.grade === child.grade,
        );
      }

      // Transform API data to match component structure
      const formattedHomeworks = homeworkData.map((hw) => ({
        id: hw.id || hw._id,
        title: hw.title,
        subject: hw.subject,
        description: hw.description,
        dueDate: hw.dueDate?.split("T")[0] || hw.dueDate,
        dueTime: hw.dueTime || "23:59",
        child: child?.name || "Your Child",
        childId: child?.id,
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
      toast.error("Failed to load homework. Using demo data.");

      // Fallback to demo data based on selected child
      const child = children.find((c) => c.id === childId);
      const demoHomeworks = [
        {
          id: 1,
          title: "Algebra Problems",
          subject: "Mathematics",
          description: "Solve problems 1-10 from Chapter 5",
          dueDate: "2024-04-15",
          dueTime: "23:59",
          child: child?.name || "Your Child",
          childId: childId,
          status: "pending",
          postedBy: "Mr. Smith",
          postedDate: "2024-04-01",
        },
        {
          id: 2,
          title: "Physics Assignment",
          subject: "Physics",
          description: "Complete lab report on motion and forces",
          dueDate: "2024-04-20",
          dueTime: "23:59",
          child: child?.name || "Your Child",
          childId: childId,
          status: "submitted",
          submittedDate: "2024-04-18",
          postedBy: "Dr. Wilson",
          postedDate: "2024-04-05",
        },
        {
          id: 3,
          title: "English Essay",
          subject: "English",
          description: "Write a 500-word essay about your favorite book",
          dueDate: "2024-04-10",
          dueTime: "23:59",
          child: child?.name || "Your Child",
          childId: childId,
          status: "graded",
          marks: 85,
          postedBy: "Ms. Davis",
          postedDate: "2024-03-28",
        },
      ];
      setHomeworks(demoHomeworks);
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

  if (loading && !homeworks.length) {
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
                (c) => c.id === parseInt(e.target.value),
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
