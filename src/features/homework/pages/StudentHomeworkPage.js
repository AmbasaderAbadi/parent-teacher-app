import React, { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiFile,
  FiImage,
  FiUpload,
  FiDownload,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const StudentHomeworkPage = () => {
  const { user } = useAuthStore();
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Demo homework based on student's grade and section
    const demoHomeworks = [
      {
        id: 1,
        title: "Algebra Problems",
        subject: "Mathematics",
        description: "Solve problems 1-10 from Chapter 5",
        dueDate: "2024-04-15",
        postedBy: "Mr. Smith",
        grade: "Grade 10",
        section: "A",
        fileType: "pdf",
        fileName: "algebra_problems.pdf",
        fileUrl: "#",
      },
      {
        id: 2,
        title: "Geometry Assignment",
        subject: "Mathematics",
        description: "Complete the geometry worksheet",
        dueDate: "2024-04-20",
        postedBy: "Mr. Smith",
        grade: "Grade 10",
        section: "A",
        fileType: "image",
        fileName: "geometry_diagram.jpg",
        fileUrl: "#",
      },
    ];

    // Filter for student's grade and section
    const filtered = demoHomeworks.filter(
      (h) => h.grade === user?.grade && h.section === user?.class,
    );
    setHomeworks(filtered);
  }, [user]);

  const handleSubmitFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubmissionFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmitHomework = () => {
    if (!submissionFile && !submissionText) {
      toast.error("Please upload a file or enter text submission");
      return;
    }

    const submission = {
      homeworkId: selectedHomework.id,
      submittedAt: new Date().toISOString(),
      file: submissionFile
        ? {
            name: submissionFile.name,
            size: submissionFile.size,
            type: submissionFile.type,
          }
        : null,
      text: submissionText,
    };

    setSubmissions({ ...submissions, [selectedHomework.id]: submission });
    setShowSubmitModal(false);
    setSubmissionFile(null);
    setSubmissionText("");
    setPreviewUrl(null);
    setSelectedHomework(null);
    toast.success("Homework submitted successfully!");
  };

  const getFileIcon = (fileType) => {
    if (fileType === "image") return <FiImage size={16} />;
    return <FiFile size={16} />;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📝 My Homework</h1>
        <p style={styles.subtitle}>View and submit your assignments</p>
      </div>

      <div style={styles.homeworkList}>
        {homeworks.map((hw) => {
          const submitted = submissions[hw.id];
          const isOverdue = new Date(hw.dueDate) < new Date();

          return (
            <div key={hw.id} style={styles.homeworkCard}>
              <div style={styles.homeworkHeader}>
                <h3>{hw.title}</h3>
                <span
                  style={{
                    ...styles.subjectBadge,
                    backgroundColor: "#eef2ff",
                    color: "#4f46e5",
                  }}
                >
                  {hw.subject}
                </span>
              </div>
              <p style={styles.homeworkDescription}>{hw.description}</p>
              <div style={styles.homeworkMeta}>
                <span>
                  <FiClock size={12} /> Due: {hw.dueDate}
                </span>
                <span>Posted by: {hw.postedBy}</span>
              </div>

              {/* Attachment from teacher */}
              <div style={styles.teacherAttachment}>
                {getFileIcon(hw.fileType)}
                <span>Teacher's attachment: {hw.fileName}</span>
                <button style={styles.downloadBtn}>
                  <FiDownload size={12} /> Download
                </button>
              </div>

              {submitted ? (
                <div style={styles.submittedCard}>
                  <FiCheckCircle size={20} style={{ color: "#10b981" }} />
                  <div>
                    <p style={styles.submittedText}>
                      Submitted on{" "}
                      {new Date(submitted.submittedAt).toLocaleString()}
                    </p>
                    {submitted.file && (
                      <p style={styles.submittedFile}>
                        File: {submitted.file.name}
                      </p>
                    )}
                    {submitted.text && (
                      <p style={styles.submittedText}>
                        Message: {submitted.text}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedHomework(hw);
                    setShowSubmitModal(true);
                  }}
                  style={styles.submitBtn}
                >
                  Submit Homework
                </button>
              )}
              {isOverdue && !submitted && (
                <p style={styles.overdueWarning}>
                  ⚠️ Overdue! Please submit as soon as possible.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && selectedHomework && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Submit Homework: {selectedHomework.title}</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={styles.modalClose}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <textarea
                placeholder="Add any comments or text submission..."
                rows={4}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                style={styles.textarea}
              />

              <div style={styles.fileUploadSection}>
                <label style={styles.fileLabel}>Upload File (Optional)</label>
                <div style={styles.fileUploadArea}>
                  <input
                    type="file"
                    id="submission-file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleSubmitFile}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="submission-file" style={styles.fileUploadBtn}>
                    <FiUpload size={16} /> Choose File
                  </label>
                  {submissionFile && (
                    <div style={styles.fileInfo}>
                      {submissionFile.type.startsWith("image/") ? (
                        <FiImage size={16} />
                      ) : (
                        <FiFile size={16} />
                      )}
                      <span>{submissionFile.name}</span>
                      <span style={styles.fileSize}>
                        {(submissionFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>
                <p style={styles.fileHint}>
                  Supported: Images, PDF, DOC, DOCX, TXT
                </p>
              </div>

              {previewUrl && (
                <div style={styles.previewContainer}>
                  <p>Image Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={styles.previewImage}
                  />
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleSubmitHomework} style={styles.submitBtn}>
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#1f2937" },
  subtitle: { fontSize: "14px", color: "#6b7280", marginTop: "4px" },
  homeworkList: { display: "flex", flexDirection: "column", gap: "16px" },
  homeworkCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  homeworkHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "8px",
  },
  subjectBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px" },
  homeworkDescription: { color: "#4b5563", marginBottom: "12px" },
  homeworkMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "12px",
  },
  teacherAttachment: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  downloadBtn: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: "12px",
  },
  submittedCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#d1fae5",
    borderRadius: "8px",
    marginTop: "12px",
  },
  submittedText: { fontSize: "13px", color: "#065f46" },
  submittedFile: { fontSize: "11px", color: "#065f46", marginTop: "4px" },
  submitBtn: {
    padding: "8px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "12px",
  },
  overdueWarning: { fontSize: "12px", color: "#ef4444", marginTop: "8px" },
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
    fontSize: "24px",
    cursor: "pointer",
    color: "#9ca3af",
  },
  modalBody: { padding: "20px" },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    marginBottom: "16px",
  },
  fileUploadSection: { marginBottom: "16px" },
  fileLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  fileUploadArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  fileUploadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    backgroundColor: "#eef2ff",
    borderRadius: "8px",
    fontSize: "12px",
  },
  fileSize: { fontSize: "10px", color: "#6b7280" },
  fileHint: { fontSize: "11px", color: "#9ca3af", marginTop: "8px" },
  previewContainer: { marginTop: "12px" },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "150px",
    borderRadius: "8px",
    marginTop: "8px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default StudentHomeworkPage;
