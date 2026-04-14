import apiClient from "./client";

export const adminAPI = {
  // User management
  getAllUsers: () => apiClient.get("/admin/users"),
  getUsersByRole: (role) => apiClient.get(`/admin/users/role/${role}`),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  activateUser: (userId) => apiClient.put(`/admin/users/${userId}/activate`),

  // Announcements management
  createAnnouncement: (announcementData) =>
    apiClient.post("/admin/announcements", announcementData),
  deleteAnnouncement: (id) => apiClient.delete(`/admin/announcements/${id}`),
  pinAnnouncement: (id) => apiClient.put(`/admin/announcements/${id}/pin`),

  // Statistics
  getStats: () => apiClient.get("/admin/stats"),
};
