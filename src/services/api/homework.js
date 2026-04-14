import apiClient from "./client";

export const homeworkAPI = {
  createHomework: (homeworkData) => apiClient.post("/homework", homeworkData),
  getMyHomework: () => apiClient.get("/homework/my"),
  getHomeworkByClass: (grade) => apiClient.get(`/homework/class/${grade}`),
  getHomeworkById: (id) => apiClient.get(`/homework/${id}`),
  updateHomework: (id, homeworkData) =>
    apiClient.put(`/homework/${id}`, homeworkData),
  deleteHomework: (id) => apiClient.delete(`/homework/${id}`),

  // Submissions
  submitHomework: (id, submissionData) =>
    apiClient.post(`/homework/${id}/submit`, submissionData),
  getSubmissions: (id) => apiClient.get(`/homework/${id}/submissions`),
  getMySubmission: (id) => apiClient.get(`/homework/${id}/my-submission`),
  gradeSubmission: (submissionId, gradeData) =>
    apiClient.put(`/homework/submission/${submissionId}/grade`, gradeData),
};
