import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiRefreshCw, FiSave, FiEdit2, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

// Simulate AI call – replace later with real API
const generateMockQuestions = (subject, grade, topic, numQuestions) => {
  const mock = [];
  for (let i = 1; i <= numQuestions; i++) {
    mock.push({
      id: i,
      text: `${subject} – ${topic} question ${i} (grade ${grade})`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 0,
    });
  }
  return mock;
};

const TeacherQuizGenerator = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    topic: "",
    numQuestions: 5,
  });
  const [questions, setQuestions] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const subjects = [
    t("mathematics"),
    t("physics"),
    t("chemistry"),
    t("biology"),
    t("english"),
    t("history"),
    t("geography"),
  ];
  const grades = [t("grade_9"), t("grade_10"), t("grade_11"), t("grade_12")];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.subject || !form.grade || !form.topic) {
      toast.error(t("fill_quiz_fields"));
      return;
    }
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await quizAPI.generate({ ...form });
      // const data = response.data;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockQuestions = generateMockQuestions(
        form.subject,
        form.grade,
        form.topic,
        form.numQuestions,
      );
      setQuestions(mockQuestions);
      setGenerated(true);
      setEditMode(true);
      toast.success(t("quiz_generated"));
    } catch (error) {
      toast.error(t("quiz_generate_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    if (field === "text") updated[idx].text = value;
    else if (field === "correct") updated[idx].correct = parseInt(value);
    else if (field === "option") {
      const [optIdx, optVal] = value;
      updated[idx].options[optIdx] = optVal;
    }
    setQuestions(updated);
  };

  const handleSaveQuiz = async () => {
    // TODO: POST /quizzes – save the quiz to backend
    toast.success(t("quiz_saved"));
    setGenerated(false);
    setEditMode(false);
    setForm({ subject: "", grade: "", topic: "", numQuestions: 5 });
    setQuestions([]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t("quiz_generator")}</h1>
        <p style={styles.subtitle}>{t("quiz_subtitle")}</p>
      </div>

      {!generated ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.formCard}
        >
          <div style={styles.formRow}>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">{t("select_subject")}</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              name="grade"
              value={form.grade}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">{t("select_grade")}</option>
              {grades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <input
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder={t("topic_placeholder")}
            style={styles.input}
          />
          <div style={styles.formRow}>
            <input
              name="numQuestions"
              type="number"
              min="1"
              max="20"
              value={form.numQuestions}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={styles.generateBtn}
          >
            {loading ? t("generating") : t("generate_quiz")}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.quizCard}
        >
          <div style={styles.quizHeader}>
            <h2>{t("generated_quiz")}</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              style={styles.editBtn}
            >
              {editMode ? <FiCheck size={16} /> : <FiEdit2 size={16} />}{" "}
              {editMode ? t("done") : t("edit")}
            </button>
          </div>
          {questions.map((q, idx) => (
            <div key={q.id} style={styles.questionBlock}>
              {editMode ? (
                <input
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionChange(idx, "text", e.target.value)
                  }
                  style={styles.questionInput}
                />
              ) : (
                <p style={styles.questionText}>
                  {idx + 1}. {q.text}
                </p>
              )}
              <div style={styles.options}>
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} style={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`q${idx}`}
                      checked={q.correct === optIdx}
                      onChange={() =>
                        handleQuestionChange(idx, "correct", optIdx)
                      }
                      disabled={!editMode}
                    />
                    {editMode ? (
                      <input
                        value={opt}
                        onChange={(e) =>
                          handleQuestionChange(idx, "option", [
                            optIdx,
                            e.target.value,
                          ])
                        }
                        style={styles.optionInput}
                      />
                    ) : (
                      <span>{opt}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSaveQuiz} style={styles.saveBtn}>
            <FiSave size={16} /> {t("save_quiz")}
          </button>
        </motion.div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 24,
    maxWidth: 800,
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700, color: "#1f2937" },
  subtitle: { fontSize: 14, color: "#6b7280" },
  formCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 12,
  },
  select: {
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  generateBtn: {
    width: "100%",
    padding: 12,
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  quizCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  questionBlock: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid #e5e7eb",
  },
  questionText: { fontWeight: 600, marginBottom: 8 },
  questionInput: {
    width: "100%",
    padding: 8,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    marginBottom: 8,
  },
  options: { display: "flex", flexDirection: "column", gap: 6, marginLeft: 16 },
  optionLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  optionInput: {
    width: 120,
    padding: 4,
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 13,
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 16,
  },
};

export default TeacherQuizGenerator;
