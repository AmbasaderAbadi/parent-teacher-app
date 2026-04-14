import React, { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiFile,
  FiImage,
  FiUpload,
  FiDownload,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import { homeworkAPI } from "../../../services/api";
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  useEffect(() => {
    if (studentInfo) {
      fetchHomeworks();
      fetchMySubmissions();
    }
  }, [studentInfo]);

  const fetchStudentInfo = async () => {
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setStudentInfo({
          grade: userData.grade,
          section: userData.className || userData.section,
          studentId: userData.studentId || userData.id,
          name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        });
      } else {
        setStudentInfo({
          grade: "Grade 10",
          section: "A",
          studentId: "STU001",
          name: "Student",
        });
      }
    } catch (error) {
      console.error("Error fetching student info:", error);
      setStudentInfo({
        grade: "Grade 10",
        section: "A",
        studentId: "STU001",
        name: "Student",
      });
    }
  };

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      // Fetch homework for the student's class
      const response = await homeworkAPI.getMyHomework();
      let homeworkData = response.data;

      // Filter homework by student's grade/class
      if (studentInfo) {
        homeworkData = homeworkData.filter(
          (hw) =>
            hw.className?.includes(studentInfo.grade) ||
            hw.grade === studentInfo.grade,
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
        postedBy: hw.postedBy || hw.teacherName,
        postedDate: hw.createdAt
          ? new Date(hw.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fileType: hw.fileType || "pdf",
        fileName: hw.fileName,
        fileUrl: hw.fileUrl,
        attachments: hw.attachments || [],
      }));

      setHomeworks(formattedHomeworks);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      toast.error("Failed to load homework. Using demo data.");

      // Fallback to demo data
      const demoHomeworks = [
        {
          id: 1,
          title: "Algebra Problems",
          subject: "Mathematics",
          description: "Solve problems 1-10 from Chapter 5",
          dueDate: "2024-04-15",
          dueTime: "23:59",
          postedBy: "Mr. Smith",
          postedDate: "2024-04-01",
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
          dueTime: "23:59",
          postedBy: "Mr. Smith",
          postedDate: "2024-04-05",
          fileType: "image",
          fileName: "geometry_diagram.jpg",
          fileUrl: "#",
        },
        {
          id: 3,
          title: "Physics Lab Report",
          subject: "Physics",
          description: "Write a lab report on motion experiment",
          dueDate: "2024-04-10",
          dueTime: "23:59",
          postedBy: "Dr. Wilson",
          postedDate: "2024-03-28",
          fileType: "pdf",
          fileName: "lab_guide.pdf",
          fileUrl: "#",
        },
      ];
      setHomeworks(demoHomeworks);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const submissionsMap = {};
      for (const hw of homeworks) {
        try {
          const response = await homeworkAPI.getMySubmission(hw.id);
          const submission = response.data;
          submissionsMap[hw.id] = {
            status: submission.status || "submitted",
            submittedAt: submission.submittedAt || submission.createdAt,
            file: submission.fileName ? { name: submission.fileName } : null,
            text: submission.content,
            marks: submission.marks,
            feedback: submission.feedback,
          };
        } catch (error) {
          // No submission found
          console.log(`No submission for homework ${hw.id}`);
        }
      }
      setSubmissions(submissionsMap);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB");
        return;
      }

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

  const handleSubmitHomework = async () => {
    if (!submissionFile && !submissionText) {
      toast.error("Please upload a file or enter text submission");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("homeworkId", selectedHomework.id);
      if (submissionFile) {
        formData.append("file", submissionFile);
      }
      if (submissionText) {
        formData.append("content", submissionText);
      }

      const response = await homeworkAPI.submitHomework(
        selectedHomework.id,
        formData,
      );

      const submission = {
        status: "submitted",
        submittedAt: new Date().toISOString(),
        file: submissionFile ? { name: submissionFile.name } : null,
        text: submissionText,
      };

      setSubmissions({ ...submissions, [selectedHomework.id]: submission });
      setShowSubmitModal(false);
      setSubmissionFile(null);
      setSubmissionText("");
      setPreviewUrl(null);
      setSelectedHomework(null);
      toast.success("Homework submitted successfully!");
    } catch (error) {
      console.error("Error submitting homework:", error);
      toast.error(error.response?.data?.message || "Failed to submit homework");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadAttachment = async (homework) => {
    try {
      toast.loading(`Downloading ${homework.fileName}...`, { id: "download" });

      // Call API to download file
      // const response = await homeworkAPI.downloadAttachment(homework.id);

      // Simulate download for demo
      setTimeout(() => {
        toast.success(`${homework.fileName} downloaded!`, { id: "download" });
      }, 1000);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download file", { id: "download" });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === "image") return <FiImage size={16} />;
    return <FiFile size={16} />;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getStatusBadge = (homeworkId) => {
    const submission = submissions[homeworkId];
    if (submission) {
      if (submission.marks) {
        return {
          text: `Graded: ${submission.marks}%`,
          color: "#10b981",
          bg: "#d1fae5",
        };
      }
      return { text: "Submitted", color: "#2563eb", bg: "#dbeafe" };
    }
    return { text: "Pending", color: "#92400e", bg: "#fed7aa" };
  };

  if (loading) {
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
        <h1 style={styles.title}>📝 My Homework</h1>
        <p style={styles.subtitle}>View and submit your assignments</p>
      </div>

      {studentInfo && (
        <div style={styles.studentInfo}>
          <p>
            Welcome, <strong>{studentInfo.name}</strong>! ({studentInfo.grade} -
            Section {studentInfo.section})
          </p>
        </div>
      )}

      <div style={styles.homeworkList}>
        {homeworks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No homework assignments found.</p>
          </div>
        ) : (
          homeworks.map((hw) => {
            const submitted = submissions[hw.id];
            const overdue = isOverdue(hw.dueDate) && !submitted;
            const status = getStatusBadge(hw.id);

            return (
              <div key={hw.id} style={styles.homeworkCard}>
                <div style={styles.homeworkHeader}>
                  <div>
                    <h3 style={styles.homeworkTitle}>{hw.title}</h3>
                    <div style={styles.homeworkMeta}>
                      <span style={styles.subjectBadge}>{hw.subject}</span>
                      <span>
                        <FiClock size={12} /> Due: {hw.dueDate} by {hw.dueTime}
                      </span>
                      {overdue && (
                        <span style={styles.overdueBadge}>
                          <FiAlertCircle size={12} /> Overdue!
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.text}
                  </span>
                </div>

                <p style={styles.homeworkDescription}>{hw.description}</p>

                <div style={styles.homeworkMeta}>
                  <span>Posted by: {hw.postedBy}</span>
                  <span>Posted on: {hw.postedDate}</span>
                </div>

                {/* Attachment from teacher */}
                {hw.fileName && (
                  <div style={styles.teacherAttachment}>
                    {getFileIcon(hw.fileType)}
                    <span>Teacher's attachment: {hw.fileName}</span>
                    <button
                      onClick={() => handleDownloadAttachment(hw)}
                      style={styles.downloadBtn}
                    >
                      <FiDownload size={12} /> Download
                    </button>
                  </div>
                )}

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
                      {submitted.marks && (
                        <p style={styles.gradeText}>
                          Grade: {submitted.marks}%
                        </p>
                      )}
                      {submitted.feedback && (
                        <p style={styles.feedbackText}>
                          Feedback: {submitted.feedback}
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
              </div>
            );
          })
        )}
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
                disabled={submitting}
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
                    disabled={submitting}
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
                  Supported: Images, PDF, DOC, DOCX, TXT (Max 20MB)
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
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitHomework}
                style={styles.submitModalBtn}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

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
  header: { marginBottom: "24px" },
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
  studentInfo: {
    marginBottom: "20px",
    padding: "12px 16px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
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
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "12px",
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
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  homeworkDescription: {
    color: "#4b5563",
    lineHeight: "1.6",
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
    marginLeft: "auto",
  },
  submittedCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#d1fae5",
    borderRadius: "8px",
    marginTop: "12px",
  },
  submittedText: { fontSize: "13px", color: "#065f46", margin: 0 },
  submittedFile: { fontSize: "11px", color: "#065f46", marginTop: "4px" },
  gradeText: {
    fontSize: "13px",
    color: "#065f46",
    fontWeight: "500",
    marginTop: "4px",
  },
  feedbackText: {
    fontSize: "12px",
    color: "#065f46",
    marginTop: "4px",
    fontStyle: "italic",
  },
  submitBtn: {
    padding: "8px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "12px",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
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
    resize: "vertical",
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
    transition: "all 0.2s ease",
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
  submitModalBtn: {
    padding: "8px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default StudentHomeworkPage;
