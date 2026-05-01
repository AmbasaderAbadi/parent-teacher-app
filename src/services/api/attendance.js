// src/services/api/attendance.js
import apiClient from "./client";

export const attendanceAPI = {
  markAttendance: (data) => apiClient.post("/attendance/mark", data),
  bulkMarkAttendance: (data) => apiClient.post("/attendance/bulk", data),
  getStudentAttendance: (phoneNumber, params = {}) =>
    apiClient.get(`/attendance/student/${phoneNumber}`, { params }),
  getMyAttendance: () => apiClient.get("/attendance/my"),
  getClassAttendance: (params) =>
    apiClient.get("/attendance/class", { params }),
  getTodayAttendance: () => apiClient.get("/attendance/today"),
  getAttendanceStats: (phoneNumber) =>
    apiClient.get(`/attendance/stats/${phoneNumber}`),
  getMonthlyReport: (phoneNumber, params) =>
    apiClient.get(`/attendance/report/${phoneNumber}`, { params }),
  updateAttendance: (id, data) => apiClient.put(`/attendance/${id}`, data),
};
