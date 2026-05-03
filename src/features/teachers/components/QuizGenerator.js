import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiX,
  FiLoader,
  FiUpload,
  FiFile,
  FiDownload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { aiAPI } from "../../../services/api";
import { exportQuizToPDF } from "../../../shared/utils/pdfExport";

const QuizGenerator = ({ onQuizSaved }) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correct: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const grades = [t("grade_9"), t("grade_10"), t("grade_11"), t("grade_12")];
  const difficulties = ["easy", "medium", "hard"];
  const subjects = [
    t("mathematics"),
    t("physics"),
    t("chemistry"),
    t("biology"),
    t("english"),
    t("history"),
    t("geography"),
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("file_too_large"));
        return;
      }
      setSelectedFile(file);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      if (!topic) setTopic(nameWithoutExt);
    }
  };

  const generateQuestions = async () => {
    if (!subject || !grade) {
      toast.error(t("quiz_fill_fields"));
      return;
    }
    if (!topic && !selectedFile) {
      toast.error(t("quiz_topic_or_file_required"));
      return;
    }

    setGenerating(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("grade", grade);
      formData.append("numQuestions", numQuestions);
      formData.append("difficulty", difficulty);
      if (topic) formData.append("topic", topic);
      if (selectedFile) formData.append("file", selectedFile);

      const response = await aiAPI.generateQuiz(formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percent);
        },
      });
      const questions = response.data?.questions || [];
      setGeneratedQuestions(questions);
      toast.success(t("quiz_generated_success"));
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error(error.response?.data?.message || t("quiz_generate_failed"));
      const demo = Array.from({ length: numQuestions }, (_, i) => ({
        text: `Sample question ${i + 1} about ${topic || "uploaded file"}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0,
      }));
      setGeneratedQuestions(demo);
      toast.info(t("quiz_demo_mode"));
    } finally {
      setGenerating(false);
      setUploadProgress(0);
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...generatedQuestions];
    updated[index][field] = value;
    setGeneratedQuestions(updated);
  };

  const addQuestion = () => {
    setGeneratedQuestions([
      ...generatedQuestions,
      { text: "", options: ["", "", "", ""], correct: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    if (window.confirm(t("confirm_remove_question"))) {
      const updated = [...generatedQuestions];
      updated.splice(index, 1);
      setGeneratedQuestions(updated);
    }
  };

  const openEditModal = (question, index) => {
    setEditingQuestion(index);
    setEditForm({
      text: question.text,
      options: [...question.options],
      correct: question.correct,
    });
    setEditModalOpen(true);
  };

  const saveEdit = () => {
    if (editingQuestion !== null) {
      const updated = [...generatedQuestions];
      updated[editingQuestion] = {
        text: editForm.text,
        options: editForm.options,
        correct: editForm.correct,
      };
      setGeneratedQuestions(updated);
      setEditModalOpen(false);
      setEditingQuestion(null);
      toast.success(t("question_updated"));
    }
  };

  const saveQuiz = async () => {
    if (!quizTitle.trim()) {
      toast.error(t("quiz_title_required"));
      return;
    }
    if (generatedQuestions.length === 0) {
      toast.error(t("no_questions_to_save"));
      return;
    }
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      if (!q.text.trim()) {
        toast.error(t("question_text_missing", { num: i + 1 }));
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          toast.error(t("option_missing", { qNum: i + 1, optNum: j + 1 }));
          return;
        }
      }
    }

    setSaving(true);
    try {
      await aiAPI.saveQuiz({
        title: quizTitle,
        subject,
        grade,
        topic,
        difficulty,
        questions: generatedQuestions,
      });
      toast.success(t("quiz_saved_success"));
      if (onQuizSaved) onQuizSaved();
      setQuizTitle("");
      setGeneratedQuestions([]);
      setSubject("");
      setTopic("");
      setGrade("");
      setNumQuestions(5);
      setDifficulty("medium");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(error.response?.data?.message || t("quiz_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const downloadAsJSON = () => {
    if (generatedQuestions.length === 0) {
      toast.error(t("no_questions_to_export"));
      return;
    }
    const quizData = {
      title: quizTitle || "Untitled Quiz",
      subject,
      grade,
      topic,
      difficulty,
      questions: generatedQuestions,
    };
    const dataStr = JSON.stringify(quizData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quizTitle || "quiz"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("quiz_downloaded"));
  };

  const downloadAsPDF = () => {
    if (generatedQuestions.length === 0) {
      toast.error(t("no_questions_to_export"));
      return;
    }
    const quizData = {
      title: quizTitle || "Generated Quiz",
      subject,
      grade,
      topic,
      difficulty,
      questions: generatedQuestions,
    };
    exportQuizToPDF(quizData, quizData.title);
    toast.success(t("quiz_downloaded_pdf"));
  };

  const resetForm = () => {
    setSubject("");
    setTopic("");
    setGrade("");
    setNumQuestions(5);
    setDifficulty("medium");
    setGeneratedQuestions([]);
    setQuizTitle("");
    setSelectedFile(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t("quiz_generator")}</h2>
      <p style={styles.subtitle}>{t("quiz_generator_desc")}</p>

      <div style={styles.formCard}>
        <div style={styles.row}>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.select}
          >
            <option value="">{t("select_subject")}</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={styles.select}
          >
            <option value="">{t("select_grade")}</option>
            {grades.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div style={styles.row}>
          <input
            type="text"
            placeholder={t("topic_placeholder")}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder={t("num_questions")}
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            style={styles.input}
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={styles.select}
          >
            {difficulties.map((d) => (
              <option key={d}>{t(d)}</option>
            ))}
          </select>
        </div>

        <div style={styles.fileSection}>
          <label style={styles.fileLabel}>
            <FiUpload size={14} /> {t("upload_file_optional")}
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          {selectedFile && (
            <div style={styles.fileInfo}>
              <FiFile size={14} />
              <span>{selectedFile.name}</span>
              <span style={styles.fileSize}>
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>

        {generating && uploadProgress > 0 && (
          <div style={styles.progressBar}>
            <div
              style={{ ...styles.progressFill, width: `${uploadProgress}%` }}
            />
            <span style={styles.progressText}>{uploadProgress}%</span>
          </div>
        )}

        <button
          onClick={generateQuestions}
          disabled={generating}
          style={{
            ...styles.generateBtn,
            ...(generating ? styles.disabledBtn : {}),
          }}
        >
          {generating ? (
            <FiLoader size={18} className="spin" />
          ) : (
            <FiPlus size={18} />
          )}
          {generating ? t("generating") : t("generate_quiz")}
        </button>
      </div>

      {generatedQuestions.length > 0 && (
        <div style={styles.questionsSection}>
          <div style={styles.sectionHeader}>
            <h3>{t("generated_questions")}</h3>
            <button onClick={addQuestion} style={styles.addQuestionBtn}>
              <FiPlus size={16} /> {t("add_question")}
            </button>
          </div>
          <div style={styles.questionsList}>
            {generatedQuestions.map((q, idx) => (
              <div key={idx} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionNumber}>{idx + 1}.</span>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) =>
                      updateQuestion(idx, "text", e.target.value)
                    }
                    placeholder={t("question_text_placeholder")}
                    style={styles.questionInput}
                  />
                  <div style={styles.questionActions}>
                    <button
                      onClick={() => openEditModal(q, idx)}
                      style={styles.editBtn}
                      title={t("edit")}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => removeQuestion(idx)}
                      style={styles.deleteBtn}
                      title={t("delete")}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div style={styles.optionsGrid}>
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} style={styles.optionLabel}>
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={q.correct === optIdx}
                        onChange={() => updateQuestion(idx, "correct", optIdx)}
                        style={styles.radio}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[optIdx] = e.target.value;
                          updateQuestion(idx, "options", newOpts);
                        }}
                        placeholder={`${t("option")} ${optIdx + 1}`}
                        style={styles.optionInput}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.saveSection}>
            <input
              type="text"
              placeholder={t("quiz_title_placeholder")}
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              style={styles.quizTitleInput}
            />
            <button
              onClick={saveQuiz}
              disabled={saving}
              style={styles.saveQuizBtn}
            >
              {saving ? (
                <FiLoader size={16} className="spin" />
              ) : (
                <FiSave size={16} />
              )}
              {saving ? t("saving") : t("save_quiz")}
            </button>
            <button onClick={downloadAsJSON} style={styles.downloadBtn}>
              <FiDownload size={16} /> JSON
            </button>
            <button onClick={downloadAsPDF} style={styles.pdfBtn}>
              <FiDownload size={16} /> PDF
            </button>
            <button onClick={resetForm} style={styles.cancelBtn}>
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3>{t("edit_question")}</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  style={styles.modalClose}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div style={styles.modalBody}>
                <input
                  type="text"
                  value={editForm.text}
                  onChange={(e) =>
                    setEditForm({ ...editForm, text: e.target.value })
                  }
                  placeholder={t("question_text")}
                  style={styles.modalInput}
                />
                {editForm.options.map((opt, idx) => (
                  <div key={idx} style={styles.modalOptionRow}>
                    <input
                      type="radio"
                      name="modal-correct"
                      checked={editForm.correct === idx}
                      onChange={() =>
                        setEditForm({ ...editForm, correct: idx })
                      }
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editForm.options];
                        newOpts[idx] = e.target.value;
                        setEditForm({ ...editForm, options: newOpts });
                      }}
                      placeholder={`${t("option")} ${idx + 1}`}
                      style={styles.modalOptionInput}
                    />
                  </div>
                ))}
              </div>
              <div style={styles.modalFooter}>
                <button
                  onClick={() => setEditModalOpen(false)}
                  style={styles.modalCancelBtn}
                >
                  {t("cancel")}
                </button>
                <button onClick={saveEdit} style={styles.modalSaveBtn}>
                  {t("save")}
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
  container: { maxWidth: "900px", margin: "0 auto", padding: "20px" },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#1f2937",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", marginBottom: "24px" },
  formCard: {
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "24px",
  },
  row: { display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  select: {
    flex: 1,
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  generateBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
    width: "100%",
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
  disabledBtn: { opacity: 0.6, cursor: "not-allowed" },
  fileSection: { marginBottom: "16px" },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  fileInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
  },
  fileInfo: {
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#4b5563",
  },
  fileSize: { fontSize: "11px", color: "#6b7280" },
  progressBar: {
    position: "relative",
    height: "24px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "12px",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4f46e5",
    transition: "width 0.3s ease",
  },
  progressText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  questionsSection: { marginTop: "24px" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  addQuestionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  questionsList: { display: "flex", flexDirection: "column", gap: "16px" },
  questionCard: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
  },
  questionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  questionNumber: { fontWeight: "600", color: "#4f46e5" },
  questionInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  questionActions: { display: "flex", gap: "6px" },
  editBtn: {
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
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  optionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  radio: { cursor: "pointer", width: "16px", height: "16px" },
  optionInput: {
    flex: 1,
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
  },
  saveSection: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  quizTitleInput: {
    flex: 2,
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  saveQuizBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pdfBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
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
    maxWidth: "600px",
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
  modalInput: {
    width: "100%",
    padding: "10px",
    marginBottom: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  modalOptionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  modalOptionInput: {
    flex: 1,
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
  },
  modalCancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  modalSaveBtn: {
    padding: "8px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default QuizGenerator;
