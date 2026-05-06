import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FiEye,
  FiTrash2,
  FiLoader,
  FiX,
  FiDownload,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { aiAPI } from "../../../services/api";
import QuizGenerator from "../components/QuizGenerator";
import { exportQuizToPDF } from "../../../shared/utils/pdfExport";

const TeacherQuizzesPage = () => {
  const { t, i18n } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [fullQuiz, setFullQuiz] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  // Helper: Convert stored subject string to translation key
  const getSubjectKey = (subject) => {
    if (!subject) return "";
    const s = subject.toLowerCase();
    // Map possible stored values (English, Amharic, Tigrinya) to translation keys
    const map = {
      mathematics: "mathematics",
      math: "mathematics",
      physics: "physics",
      chemistry: "chemistry",
      biology: "biology",
      english: "english",
      history: "history",
      geography: "geography",
      // Amharic
      ሂሳብ: "mathematics",
      ፊዚክስ: "physics",
      ኬሚስትሪ: "chemistry",
      ባዮሎጂ: "biology",
      እንግሊዘኛ: "english",
      ታሪክ: "history",
      "ሥነ-ምድር": "geography",
      // Tigrinya
      ሒሳብ: "mathematics",
      ፊዚክስ: "physics",
      ኬሚስትሪ: "chemistry",
      ባዮሎጂ: "biology",
      እንግሊዘኛ: "english",
      ታሪኽ: "history",
      ጂኦግራፊ: "geography",
    };
    return map[subject] || map[s] || subject;
  };

  // Helper: Convert stored grade string to translation key
  const getGradeKey = (grade) => {
    if (!grade) return "";
    const map = {
      "Grade 9": "grade_9",
      "Grade 10": "grade_10",
      "Grade 11": "grade_11",
      "Grade 12": "grade_12",
      "9ይ ክፍሊ": "grade_9",
      "10ይ ክፍሊ": "grade_10",
      "11ይ ክፍሊ": "grade_11",
      "12ይ ክፍሊ": "grade_12",
      "ክፍል 9": "grade_9",
      "ክፍል 10": "grade_10",
      "ክፍል 11": "grade_11",
      "ክፍል 12": "grade_12",
      "9ኛ ክፍሊ": "grade_9",
      "10ኛ ክፍሊ": "grade_10",
      "11ኛ ክፍሊ": "grade_11",
      "12ኛ ክፍሊ": "grade_12",
    };
    return map[grade] || grade;
  };

  // Helper: Convert stored difficulty string to translation key
  const getDifficultyKey = (difficulty) => {
    if (!difficulty) return "";
    const d = difficulty.toLowerCase();
    const map = {
      easy: "easy",
      medium: "medium",
      hard: "hard",
      ቀሊል: "easy",
      መካከለኛ: "medium",
      ከባድ: "hard",
      ቀሊል: "easy",
      ማእከላይ: "medium",
      ከቢድ: "hard",
    };
    return map[difficulty] || map[d] || difficulty;
  };

  // Format date according to current language
  const formatLocalizedDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString(i18n.language, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getMyQuizzes();
      let data =
        response.data?.data || response.data?.quizzes || response.data || [];
      if (!Array.isArray(data)) data = [];
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
        setQuizzes(quizzes.filter((q) => q._id !== quizId && q.id !== quizId));
        toast.success(t("quiz_deleted_success"));
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error(t("quiz_delete_failed"));
      }
    }
  };

  const handleView = async (quiz) => {
    setSelectedQuiz(quiz);
    setFetchingDetails(true);
    setViewModalOpen(true);
    try {
      const quizId = quiz._id || quiz.id;
      const response = await aiAPI.getQuizById(quizId);
      const fullData = response.data?.data || response.data;
      setFullQuiz(fullData);
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      toast.error(t("failed_load_quiz_details"));
      setFullQuiz(quiz);
    } finally {
      setFetchingDetails(false);
    }
  };

  const downloadQuizAsJSON = (quiz) => {
    const dataStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title || "quiz"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("quiz_downloaded"));
  };

  const downloadCurrentQuizAsPDF = () => {
    if (!fullQuiz || !fullQuiz.questions?.length) {
      toast.error(t("no_quiz_data_to_export"));
      return;
    }
    exportQuizToPDF(fullQuiz, fullQuiz.title);
    toast.success(t("quiz_downloaded_pdf"));
  };

  const handleQuizGenerated = () => {
    fetchQuizzes();
    setShowGenerator(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FiLoader size={32} className="spin" />
        <p>{t("loading_quizzes")}</p>
        <style>{`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t("my_quizzes")}</h1>
          <p style={styles.subtitle}>{t("manage_your_quizzes")}</p>
        </div>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          style={styles.generateBtn}
          className="generate-btn"
        >
          <FiZap size={18} />
          <span>
            {showGenerator ? t("hide_generator") : t("generate_new_quiz")}
          </span>
          {showGenerator ? (
            <FiChevronUp size={16} />
          ) : (
            <FiChevronDown size={16} />
          )}
        </button>
      </div>

      {showGenerator && (
        <div style={styles.generatorContainer}>
          <QuizGenerator onQuizSaved={handleQuizGenerated} />
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={styles.empty}>
          <p>{t("no_quizzes_found")}</p>
          <p style={styles.emptySubtext}>{t("generate_quiz_first")}</p>
        </div>
      ) : (
        <div style={styles.quizzesList}>
          {quizzes.map((quiz) => (
            <div key={quiz._id || quiz.id} style={styles.quizCard}>
              <div style={styles.quizInfo}>
                <h3>{quiz.title}</h3>
                <p style={styles.quizMeta}>
                  {t(getSubjectKey(quiz.subject))} •{" "}
                  {t(getGradeKey(quiz.grade))} •{" "}
                  {t(getDifficultyKey(quiz.difficulty))}
                </p>
                <p style={styles.quizDate}>
                  {formatLocalizedDate(quiz.createdAt)}
                </p>
              </div>
              <div style={styles.quizActions}>
                <button
                  onClick={() => handleView(quiz)}
                  style={styles.viewBtn}
                  title={t("view")}
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => downloadQuizAsJSON(quiz)}
                  style={styles.downloadBtn}
                  title={t("download")}
                >
                  <FiDownload size={16} />
                </button>
                <button
                  onClick={() => handleDelete(quiz._id || quiz.id)}
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
                {fetchingDetails ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <FiLoader size={32} className="spin" />
                    <p>{t("loading_quiz_details")}</p>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong>{t("subject")}:</strong>{" "}
                      {t(getSubjectKey(selectedQuiz.subject))}
                    </p>
                    <p>
                      <strong>{t("grade")}:</strong>{" "}
                      {t(getGradeKey(selectedQuiz.grade))}
                    </p>
                    <p>
                      <strong>{t("topic")}:</strong> {selectedQuiz.topic || "—"}
                    </p>
                    <p>
                      <strong>{t("difficulty")}:</strong>{" "}
                      {t(getDifficultyKey(selectedQuiz.difficulty))}
                    </p>
                    <h4 style={{ marginTop: "16px" }}>{t("questions")}</h4>
                    {fullQuiz?.questions &&
                    Array.isArray(fullQuiz.questions) &&
                    fullQuiz.questions.length > 0 ? (
                      fullQuiz.questions.map((q, idx) => (
                        <div key={idx} style={styles.questionItem}>
                          <p>
                            <strong>
                              {idx + 1}. {q.text}
                            </strong>
                          </p>
                          <ul style={styles.optionsList}>
                            {q.options &&
                              q.options.map((opt, optIdx) => (
                                <li
                                  key={optIdx}
                                  style={{
                                    color:
                                      q.correct === optIdx
                                        ? "#10b981"
                                        : "#374151",
                                  }}
                                >
                                  {opt} {q.correct === optIdx && "✓"}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p>{t("no_questions_display")}</p>
                    )}
                  </>
                )}
              </div>
              <div style={styles.modalFooter}>
                <button
                  onClick={downloadCurrentQuizAsPDF}
                  style={styles.pdfModalBtn}
                >
                  <FiDownload size={14} /> {t("download_pdf")}
                </button>
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
    </div>
  );
};

const styles = {
  container: { padding: "24px", maxWidth: "1000px", margin: "0 auto" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 4px",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", marginBottom: "24px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  generateBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(102,126,234,0.3)",
  },
  generatorContainer: {
    marginBottom: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
  },
  empty: {
    textAlign: "center",
    padding: "60px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
  },
  emptySubtext: { fontSize: "12px", marginTop: "8px", color: "#d1d5db" },
  quizzesList: { display: "flex", flexDirection: "column", gap: "16px" },
  quizCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
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
  downloadBtn: {
    padding: "6px",
    backgroundColor: "#e0e7ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#3b82f6",
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
    gap: "12px",
  },
  pdfModalBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
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

// Add global hover style for generate button
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .generate-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102,126,234,0.4);
    }
  `;
  if (!document.head.querySelector("#quiz-generator-btn-style")) {
    styleSheet.id = "quiz-generator-btn-style";
    document.head.appendChild(styleSheet);
  }
}

export default TeacherQuizzesPage;
