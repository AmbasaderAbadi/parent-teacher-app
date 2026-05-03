import apiClient from "./client";

export const aiAPI = {
  generateQuiz: (formData, config) =>
    apiClient.post("/ai/generate-quiz", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  saveQuiz: (data) => apiClient.post("/quizzes", data),
  getMyQuizzes: () => apiClient.get("/quizzes/my"), // returns list (metadata only)
  getQuizById: (quizId) => apiClient.get(`/quizzes/${quizId}`), // returns full quiz (including questions)
  deleteQuiz: (quizId) => apiClient.delete(`/quizzes/${quizId}`),
  summarizeConversations: (data) =>
    apiClient.post("/ai/summarize-conversations", data),
};
