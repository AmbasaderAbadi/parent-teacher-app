import apiClient from "./client";

export const aiAPI = {
  generateQuiz: (formData, config) =>
    apiClient.post("/ai/generate-quiz", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  saveQuiz: (data) => apiClient.post("/quizzes", data),
  getMyQuizzes: () => apiClient.get("/quizzes/my"),
  getQuizById: (quizId) => apiClient.get(`/quizzes/${quizId}`),
  deleteQuiz: (quizId) => apiClient.delete(`/quizzes/${quizId}`),

  // Generic summarization (for parents, uses childId)
  summarizeConversations: (data) =>
    apiClient.post("/ai/summarize-conversations", data),

  //  Teacher-specific summarization for a student
  summarizeTeacherConversations: (studentId) =>
    apiClient.post("/ai/summarize-conversations/teacher", { studentId }),
};
