import apiClient from "./client";

export const notificationsAPI = {
  // Create notification
  createNotification: (data) => apiClient.post("/notifications", data),

  // Get user notifications
  getNotifications: () => apiClient.get("/notifications"),

  // Delete all notifications
  deleteAllNotifications: () => apiClient.delete("/notifications"),

  // Send bulk notification
  sendBulkNotification: (data) => apiClient.post("/notifications/bulk", data),

  // Get unread count
  getUnreadCount: () => apiClient.get("/notifications/unread/count"),

  // Mark as read
  markAsRead: (id) => apiClient.post(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => apiClient.post("/notifications/read-all"),

  // Delete notification
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
};
