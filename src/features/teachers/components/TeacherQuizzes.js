import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiEye, FiEdit2, FiTrash2, FiLoader, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { aiAPI } from "../../../services/api";

const TeacherQuizzes = ({ onClose }) => {
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getMyQuizzes();
      const data = response.data?.data || response.data || [];
      setQuizzes(data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error(t("failed_load_quizzes"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (window.confirm(t("confirm_delete_quiz"))) {
      try {
        await aiAPI.deleteQuiz(quizId);
        setQuizzes(quizzes.filter((q) => q._id !== quizId));
        toast.success(t("quiz_deleted_success"));
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error(t("quiz_delete_failed"));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FiLoader size={32} className="spin" />
        <p>{t("loading_quizzes")}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>{t("my_quizzes")}</h2>
        <button onClick={onClose} style={styles.closeBtn}>
          <FiX size={24} />
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div style={styles.empty}>
          <p>{t("no_quizzes_found")}</p>
          <p style={styles.emptySubtext}>{t("generate_quiz_first")}</p>
        </div>
      ) : (
        <div style={styles.quizzesList}>
          {quizzes.map((quiz) => (
            <div key={quiz._id} style={styles.quizCard}>
              <div style={styles.quizInfo}>
                <h3>{quiz.title}</h3>
                <p style={styles.quizMeta}>
                  {quiz.subject} • {quiz.grade} • {quiz.difficulty}
                </p>
                <p style={styles.quizDate}>{formatDate(quiz.createdAt)}</p>
              </div>
              <div style={styles.quizActions}>
                <button
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    setViewModalOpen(true);
                  }}
                  style={styles.viewBtn}
                  title={t("view")}
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => handleDelete(quiz._id)}
                  style={styles.deleteBtn}
                  title={t("delete")}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Quiz Modal */}
      <AnimatePresence>
        {viewModalOpen && selectedQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3>{selectedQuiz.title}</h3>
                <button
                  onClick={() => setViewModalOpen(false)}
                  style={styles.modalClose}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div style={styles.modalBody}>
                <p>
                  <strong>{t("subject")}:</strong> {selectedQuiz.subject}
                </p>
                <p>
                  <strong>{t("grade")}:</strong> {selectedQuiz.grade}
                </p>
                <p>
                  <strong>{t("topic")}:</strong> {selectedQuiz.topic || "—"}
                </p>
                <p>
                  <strong>{t("difficulty")}:</strong> {selectedQuiz.difficulty}
                </p>
                <h4 style={{ marginTop: "16px" }}>{t("questions")}</h4>
                {selectedQuiz.questions.map((q, idx) => (
                  <div key={idx} style={styles.questionItem}>
                    <p>
                      <strong>
                        {idx + 1}. {q.text}
                      </strong>
                    </p>
                    <ul style={styles.optionsList}>
                      {q.options.map((opt, optIdx) => (
                        <li
                          key={optIdx}
                          style={{
                            color: q.correct === optIdx ? "#10b981" : "#374151",
                          }}
                        >
                          {opt} {q.correct === optIdx && "✓"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={styles.modalFooter}>
                <button
                  onClick={() => setViewModalOpen(false)}
                  style={styles.closeModalBtn}
                >
                  {t("close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#9ca3af",
  },
  emptySubtext: { fontSize: "12px", marginTop: "8px" },
  quizzesList: { display: "flex", flexDirection: "column", gap: "12px" },
  quizCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },
  quizInfo: { flex: 1 },
  quizMeta: { fontSize: "12px", color: "#6b7280", margin: "4px 0" },
  quizDate: { fontSize: "11px", color: "#9ca3af" },
  quizActions: { display: "flex", gap: "8px" },
  viewBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
  },
  deleteBtn: {
    padding: "6px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
  },
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
    maxWidth: "700px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
  },
  modalBody: { padding: "20px" },
  questionItem: {
    marginBottom: "16px",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "12px",
  },
  optionsList: { marginTop: "8px", paddingLeft: "20px" },
  modalFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
  },
  closeModalBtn: {
    padding: "8px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default TeacherQuizzes;
