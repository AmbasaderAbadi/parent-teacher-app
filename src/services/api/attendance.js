import apiClient from "./client";

export const attendanceAPI = {
  createAttendance: (attendanceData) =>
    apiClient.post("/attendance", attendanceData),
  getStudentAttendance: (studentId) =>
    apiClient.get(`/attendance/student/${studentId}`),
  getMyAttendance: () => apiClient.get("/attendance/my"),
  getTodayAttendance: () => apiClient.get("/attendance/today"),
  updateAttendance: (id, attendanceData) =>
    apiClient.put(`/attendance/${id}`, attendanceData),
};
