import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiSend, FiUsers, FiUserCheck, FiBookOpen } from "react-icons/fi";
import { useNotifications } from "../contexts/NotificationContext";
import toast from "react-hot-toast";

const SendNotificationModal = ({ isOpen, onClose }) => {
  const { sendNotification, sendBulkNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    targetType: "all",
    targetRole: "",
    targetGrade: "",
    targetSection: "",
  });

  const roles = ["parent", "teacher", "student"];
  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const sections = ["A", "B", "C", "D"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const notificationData = {
        title: formData.title || "New Notification",
        message: formData.message,
        type: formData.type,
        targetType: formData.targetType,
        targetRole: formData.targetRole,
        targetGrade: formData.targetGrade,
        targetSection: formData.targetSection,
      };

      if (formData.targetType === "bulk") {
        await sendBulkNotification(notificationData);
      } else {
        await sendNotification(notificationData);
      }

      onClose();
      setFormData({
        title: "",
        message: "",
        type: "general",
        targetType: "all",
        targetRole: "",
        targetGrade: "",
        targetSection: "",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={styles.modal}
      >
        <div style={styles.modalHeader}>
          <h3>Send Notification</h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title (Optional)</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Notification title"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter your notification message..."
              rows={4}
              style={styles.textarea}
              required
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="general">General</option>
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
                <option value="grade">Grade Update</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Target Audience</label>
              <select
                name="targetType"
                value={formData.targetType}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="all">All Users</option>
                <option value="role">By Role</option>
                <option value="grade">By Grade</option>
                <option value="section">By Section</option>
              </select>
            </div>
          </div>

          {formData.targetType === "role" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Role</label>
              <select
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(formData.targetType === "grade" ||
            formData.targetType === "section") && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Grade</label>
              <select
                name="targetGrade"
                value={formData.targetGrade}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Grade</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.targetType === "section" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Section</label>
              <select
                name="targetSection"
                value={formData.targetSection}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.sendBtn}>
              <FiSend size={16} />
              {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    padding: "24px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
  },
  formGroup: {
    marginBottom: "16px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    outline: "none",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  sendBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default SendNotificationModal;
