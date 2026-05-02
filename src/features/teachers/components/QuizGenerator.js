import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiZap, FiCopy, FiCheck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const QuizGenerator = () => {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("Grade 9");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [copied, setCopied] = useState(false);

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const subjects = [
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
  ];

  // Mock AI response (replace with real API call later)
  const mockGenerateQuiz = () => {
    return {
      title: `${subject} Quiz: ${topic}`,
      questions: Array.from({ length: numQuestions }, (_, i) => ({
        id: i + 1,
        text: `Sample question ${i + 1} about ${topic} in ${subject}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: `This is an explanation for question ${i + 1}.`,
      })),
      answerKey: Array.from({ length: numQuestions }, (_, i) => `Q${i + 1}: A`),
    };
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !subject) {
      toast.error("Please provide a topic and subject");
      return;
    }
    setLoading(true);
    try {
      // 🔁 Replace with real API call:
      // const res = await fetch('/api/ai/generate-quiz', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ topic, grade, subject, numQuestions })
      // });
      // const data = await res.json();
      // setGeneratedQuiz(data);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate network
      const mock = mockGenerateQuiz();
      setGeneratedQuiz(mock);
      toast.success("Quiz generated successfully!");
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const quizText = `
${generatedQuiz.title}

${generatedQuiz.questions
  .map(
    (q) => `
${q.id}. ${q.text}
   A) ${q.options[0]}   B) ${q.options[1]}   C) ${q.options[2]}   D) ${q.options[3]}
`,
  )
  .join("\n")}

ANSWER KEY:
${generatedQuiz.answerKey.join("\n")}
    `;
    navigator.clipboard.writeText(quizText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🤖 AI Quiz Generator</h2>
        <p>Create custom quizzes in seconds with AI</p>
      </div>

      <div style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Subject *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={styles.select}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              style={styles.select}
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Number of Questions</label>
            <input
              type="number"
              min={1}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Topic / Learning Objective *</label>
          <textarea
            rows={2}
            placeholder="e.g., Quadratic equations, Cell division, Past tense verbs..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={styles.textarea}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !topic || !subject}
          style={{
            ...styles.generateBtn,
            opacity: !topic || !subject || loading ? 0.6 : 1,
            cursor: !topic || !subject || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            "Generating..."
          ) : (
            <>
              <FiZap /> Generate Quiz
            </>
          )}
        </button>
      </div>

      {generatedQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.result}
        >
          <div style={styles.resultHeader}>
            <h3>{generatedQuiz.title}</h3>
            <button onClick={copyToClipboard} style={styles.copyBtn}>
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
          {generatedQuiz.questions.map((q) => (
            <div key={q.id} style={styles.questionCard}>
              <p style={styles.questionText}>
                <strong>
                  {q.id}. {q.text}
                </strong>
              </p>
              <div style={styles.options}>
                {q.options.map((opt, idx) => (
                  <div key={idx} style={styles.option}>
                    {" "}
                    {String.fromCharCode(65 + idx)}) {opt}
                  </div>
                ))}
              </div>
              <details style={styles.details}>
                <summary style={styles.summary}>
                  Show Answer & Explanation
                </summary>
                <p>
                  <strong>Answer:</strong> {q.correctAnswer}
                </p>
                <p>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              </details>
            </div>
          ))}
          <div style={styles.answerKey}>
            <h4>📝 Answer Key</h4>
            {generatedQuiz.answerKey.map((ans, i) => (
              <div key={i}>
                Q{i + 1}: {ans}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  header: { marginBottom: "24px" },
  title: { fontSize: "20px", fontWeight: "600", marginBottom: "4px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "16px", flexWrap: "wrap" },
  field: { flex: 1, minWidth: "150px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
  },
  generateBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  result: {
    marginTop: "32px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "24px",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
  },
  questionCard: {
    background: "#f9fafb",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  questionText: { fontSize: "15px", marginBottom: "12px" },
  options: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  },
  option: { fontSize: "13px", color: "#4b5563" },
  details: { fontSize: "13px", color: "#6b7280", cursor: "pointer" },
  summary: { cursor: "pointer", fontWeight: "500" },
  answerKey: {
    marginTop: "20px",
    padding: "12px",
    background: "#eef2ff",
    borderRadius: "10px",
  },
};

export default QuizGenerator;
