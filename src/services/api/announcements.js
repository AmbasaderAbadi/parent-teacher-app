import apiClient from "./client";

export const announcementsAPI = {
  // Create announcement
  createAnnouncement: (data) => apiClient.post("/announcements", data),

  // Get all announcements
  getAllAnnouncements: () => apiClient.get("/announcements"),

  // Get pinned announcements
  getPinnedAnnouncements: () => apiClient.get("/announcements/pinned"),

  // Get unread count
  getUnreadCount: () => apiClient.get("/announcements/unread/count"),

  // Get my announcements
  getMyAnnouncements: () => apiClient.get("/announcements/my"),

  // Get announcement by ID
  getAnnouncementById: (id) => apiClient.get(`/announcements/${id}`),

  // Update announcement
  updateAnnouncement: (id, data) => apiClient.put(`/announcements/${id}`, data),

  // Delete announcement
  deleteAnnouncement: (id) => apiClient.delete(`/announcements/${id}`),

  // Mark as read
  markAsRead: (id) => apiClient.post(`/announcements/${id}/read`),
};
