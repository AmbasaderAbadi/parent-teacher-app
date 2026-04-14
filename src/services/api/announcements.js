import apiClient from "./client";

export const announcementsAPI = {
  createAnnouncement: (announcementData) =>
    apiClient.post("/announcements", announcementData),
  getAllAnnouncements: () => apiClient.get("/announcements"),
  getAnnouncementById: (id) => apiClient.get(`/announcements/${id}`),
  updateAnnouncement: (id, announcementData) =>
    apiClient.put(`/announcements/${id}`, announcementData),
  deleteAnnouncement: (id) => apiClient.delete(`/announcements/${id}`),
  pinAnnouncement: (id) => apiClient.put(`/announcements/${id}/pin`),
};
