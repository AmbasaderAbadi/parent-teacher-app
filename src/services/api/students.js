// src/services/api/students.js
import apiClient from "./client";

export const studentsAPI = {
  // Get all students (admin only)
  getAllStudents: () => apiClient.get("/users?role=student"),

  // Get students assigned to the logged‑in teacher
  getMyStudents: () => apiClient.get("/users/my-students"), // ✅ ADD THIS

  // Get student by ID
  getStudentById: (id) => apiClient.get(`/users/id/${id}`),

  // Get student by phone number
  getStudentByPhone: (phoneNumber) =>
    apiClient.get(`/users/phone/${phoneNumber}`),

  // Get student profile
  getStudentProfile: (id) => apiClient.get(`/users/id/${id}`),

  // Update student profile
  updateStudentProfile: (phoneNumber, data) =>
    apiClient.put(`/users/phone/${phoneNumber}`, data),

  // Activate/deactivate student
  activateStudent: (phoneNumber) =>
    apiClient.put(`/users/phone/${phoneNumber}/activate`),

  // Delete student
  deleteStudent: (phoneNumber) =>
    apiClient.delete(`/users/phone/${phoneNumber}`),

  // Get medical information (if endpoint exists)
  getMedicalInfo: (studentId) =>
    apiClient.get(`/students/${studentId}/medical`),

  // Update medical information
  updateMedicalInfo: (studentId, data) =>
    apiClient.put(`/students/${studentId}/medical`, data),

  // Get achievements
  getAchievements: (studentId) =>
    apiClient.get(`/students/${studentId}/achievements`),

  // Add achievement
  addAchievement: (studentId, data) =>
    apiClient.post(`/students/${studentId}/achievements`, data),

  getParentInfo: async (studentId) => {
    try {
      const studentResponse = await apiClient.get(`/users/id/${studentId}`);
      const studentData = studentResponse.data;
      const parentPhone = studentData.parentPhoneNumber;
      if (parentPhone) {
        const parentResponse = await apiClient.get(
          `/users/phone/${parentPhone}`,
        );
        return parentResponse.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching parent info:", error);
      return null;
    }
  },
};
