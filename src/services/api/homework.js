// src/services/api/homework.js
import apiClient from "./client";

export const homeworkAPI = {
  // Create homework without files (JSON)
  createHomework: (data) => apiClient.post("/homework", data),

  // Create homework with file attachments (multipart/form-data)
  createHomeworkWithFiles: (formData, config) =>
    apiClient.post("/homework/with-files", formData, config),

  // Get all homework (teachers can filter by subject)
  getAllHomework: () => apiClient.get("/homework"),

  // Get upcoming homework
  getUpcomingHomework: () => apiClient.get("/homework/upcoming"),

  // Get my submissions (for students)
  getMySubmissions: () => apiClient.get("/homework/my-submissions"),

  // Get pending submissions (for teachers)
  getPendingSubmissions: () => apiClient.get("/homework/submissions/pending"),

  // Get submission statistics
  getSubmissionStats: () => apiClient.get("/homework/submissions/stats"),

  // Get homework by ID
  getHomeworkById: (id) => apiClient.get(`/homework/${id}`),

  // Update homework (JSON)
  updateHomework: (id, data) => apiClient.put(`/homework/${id}`, data),

  // Delete homework
  deleteHomework: (id) => apiClient.delete(`/homework/${id}`),

  // Get submissions for a specific homework (teacher)
  getSubmissions: (id) => apiClient.get(`/homework/${id}/submissions`),

  // Publish homework
  publishHomework: (id) => apiClient.post(`/homework/${id}/publish`),

  // Submit homework (student)
  submitHomework: (id, data) => apiClient.post(`/homework/${id}/submit`, data),

  // Grade a submission (teacher)
  gradeSubmission: (submissionId, data) =>
    apiClient.put(`/homework/submissions/${submissionId}/grade`, data),

  // Get a specific submission by ID
  getSubmissionById: (submissionId) =>
    apiClient.get(`/homework/submissions/${submissionId}`),
};
