import apiClient from "./client";

export const gradesAPI = {
  createGrade: (gradeData) => apiClient.post("/grades", gradeData),
  getStudentGrades: (studentId) =>
    apiClient.get(`/grades/student/${studentId}`),
  getMyGrades: () => apiClient.get("/grades/my"),
  updateGrade: (id, gradeData) => apiClient.put(`/grades/${id}`, gradeData),
  deleteGrade: (id) => apiClient.delete(`/grades/${id}`),
};
