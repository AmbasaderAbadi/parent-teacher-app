import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiZap, FiCopy, FiCheck, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

const MessageSummarizer = () => {
  const [originalMessage, setOriginalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [suggestedReply, setSuggestedReply] = useState("");
  const [copied, setCopied] = useState(false);

  // Mock AI response – replace with real API call
  const mockSummarize = (text) => {
    return {
      summary: `Parent is concerned about ${text.includes("grade") ? "recent grade drop" : "homework load"}. They request a meeting to discuss progress.`,
      suggestedReply: `Thank you for reaching out. I understand your concern. Let's schedule a 15‑minute call on [date]. I'll provide an update on assignments and support strategies.`,
    };
  };

  const handleSummarize = async () => {
    if (!originalMessage.trim()) {
      toast.error("Please paste a message to summarize");
      return;
    }
    setLoading(true);
    try {
      // 🔁 Replace with real API call:
      // const res = await fetch('/api/ai/summarize-message', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: originalMessage })
      // });
      // const data = await res.json();
      // setSummary(data.summary);
      // setSuggestedReply(data.suggestedReply);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const mock = mockSummarize(originalMessage);
      setSummary(mock.summary);
      setSuggestedReply(mock.suggestedReply);
      toast.success("Message summarized!");
    } catch (error) {
      toast.error("Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>✍️ AI Message Summarizer</h2>
        <p>
          Paste a long parent/teacher message → get a concise summary + draft
          reply
        </p>
      </div>

      <div style={styles.inputArea}>
        <label style={styles.label}>Original Message</label>
        <textarea
          rows={6}
          placeholder="Paste the message here..."
          value={originalMessage}
          onChange={(e) => setOriginalMessage(e.target.value)}
          style={styles.textarea}
        />
        <button
          onClick={handleSummarize}
          disabled={loading || !originalMessage.trim()}
          style={{
            ...styles.summarizeBtn,
            opacity: !originalMessage.trim() || loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            "Analyzing..."
          ) : (
            <>
              <FiZap /> Summarize & Generate Reply
            </>
          )}
        </button>
      </div>

      {(summary || suggestedReply) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.result}
        >
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <h3>📋 Summary</h3>
              <button
                onClick={() => copyToClipboard(summary)}
                style={styles.copyBtn}
              >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />} Copy
              </button>
            </div>
            <p style={styles.summaryText}>{summary}</p>
          </div>

          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <h3>💡 Suggested Reply</h3>
              <button
                onClick={() => copyToClipboard(suggestedReply)}
                style={styles.copyBtn}
              >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />} Copy
              </button>
            </div>
            <p style={styles.replyText}>{suggestedReply}</p>
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
  header: { marginBottom: "20px" },
  title: { fontSize: "20px", fontWeight: "600", marginBottom: "4px" },
  inputArea: { display: "flex", flexDirection: "column", gap: "16px" },
  label: { fontWeight: "500", fontSize: "14px", color: "#374151" },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  summarizeBtn: {
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
    alignSelf: "flex-start",
  },
  result: {
    marginTop: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  resultCard: { background: "#f9fafb", borderRadius: "12px", padding: "16px" },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "8px",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  summaryText: {
    fontSize: "14px",
    color: "#1f2937",
    lineHeight: "1.5",
    margin: 0,
  },
  replyText: {
    fontSize: "14px",
    color: "#1f2937",
    background: "#fff",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    margin: 0,
  },
};

export default MessageSummarizer;
