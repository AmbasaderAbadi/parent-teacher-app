import apiClient from "./client";

export const adminAPI = {
  // Statistics
  getStats: () => apiClient.get("/admin/stats"),

  // User management
  getAllUsers: () => apiClient.get("/admin/users"),
  getUsersByRole: (role) => apiClient.get(`/admin/users/role/${role}`),
  getUserByPhone: (phoneNumber) =>
    apiClient.get(`/admin/users/phone/${phoneNumber}`),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  activateUser: (userId) => apiClient.put(`/admin/users/${userId}/activate`),
  deleteUserByPhone: (phoneNumber) =>
    apiClient.delete(`/admin/users/phone/${phoneNumber}`),
  activateUserByPhone: (phoneNumber) =>
    apiClient.put(`/admin/users/phone/${phoneNumber}/activate`),
};
