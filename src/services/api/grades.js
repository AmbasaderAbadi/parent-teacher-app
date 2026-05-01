import apiClient from "./client";

export const gradesAPI = {
  // Create grade
  createGrade: (data) => apiClient.post("/grades", data),

  // Get all grades
  getAllGrades: () => apiClient.get("/grades"),

  // Bulk create grades
  bulkCreateGrades: (data) => apiClient.post("/grades/bulk", data),

  // Get student grades
  getStudentGrades: (studentId) =>
    apiClient.get(`/grades/student/${studentId}`),

  // Get my grades
  getMyGrades: () => apiClient.get("/grades/my"),

  // Get student grade summary
  getGradeSummary: (studentId) => apiClient.get(`/grades/summary/${studentId}`),

  // Get class performance
  getClassPerformance: () => apiClient.get("/grades/class/performance"),

  // Get grade by ID
  getGradeById: (id) => apiClient.get(`/grades/${id}`),

  // Update grade
  updateGrade: (id, data) => apiClient.put(`/grades/${id}`, data),

  // Delete grade
  deleteGrade: (id) => apiClient.delete(`/grades/${id}`),

  // Publish grade
  publishGrade: (id) => apiClient.post(`/grades/${id}/publish`),
};
