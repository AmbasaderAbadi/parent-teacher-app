import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiMessageSquare, FiLoader, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { aiAPI } from "../../../services/api"; // adjust path as needed

const MessageSummarizer = ({ studentId, teacherName, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    if (!studentId) {
      toast.error(t("missing_student_id"));
      return;
    }
    setLoading(true);
    try {
      const response = await aiAPI.summarizeTeacherConversations(studentId);
      // Assumes response.data.summary contains the text
      const summaryText =
        response.data?.summary ||
        response.data?.data?.summary ||
        t("summary_unavailable");
      setSummary(summaryText);
    } catch (error) {
      console.error("Summarization error:", error);
      toast.error(error.response?.data?.message || t("summary_failed"));
      setSummary(t("summary_failed_message"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          style={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.header}>
            <h3>{t("message_summary")}</h3>
            <button onClick={onClose} style={styles.closeBtn}>
              <FiX size={20} />
            </button>
          </div>
          <div style={styles.body}>
            {!summary ? (
              <button
                onClick={handleSummarize}
                disabled={loading}
                style={styles.summarizeBtn}
              >
                {loading ? (
                  <FiLoader className="spin" size={20} />
                ) : (
                  <FiMessageSquare size={20} />
                )}
                {loading ? t("summarizing") : t("generate_summary")}
              </button>
            ) : (
              <div style={styles.summaryBox}>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
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
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    padding: 20,
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
  },
  body: {
    minHeight: 150,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  summarizeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  summaryBox: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.5,
    color: "#1f2937",
    maxHeight: 300,
    overflowY: "auto",
  },
};

export default MessageSummarizer;
