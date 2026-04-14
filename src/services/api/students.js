import apiClient from "./client";

export const studentsAPI = {
  // Profile
  getStudentProfile: (id) => apiClient.get(`/students/${id}/profile`),
  updateStudentProfile: (id, profileData) =>
    apiClient.put(`/students/${id}/profile`, profileData),

  // Medical
  getMedicalInfo: (id) => apiClient.get(`/students/${id}/medical`),
  updateMedicalInfo: (id, medicalData) =>
    apiClient.put(`/students/${id}/medical`, medicalData),

  // Achievements
  getAchievements: (id) => apiClient.get(`/students/${id}/achievements`),
  addAchievement: (id, achievementData) =>
    apiClient.post(`/students/${id}/achievements`, achievementData),
};
