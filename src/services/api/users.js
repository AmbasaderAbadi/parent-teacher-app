import apiClient from "./client";

export const usersAPI = {
  // Get all users
  getAllUsers: () => apiClient.get("/users"),

  // Get user by phone number
  getUserByPhone: (phoneNumber) => apiClient.get(`/users/phone/${phoneNumber}`),

  // Update user by phone number
  updateUserByPhone: (phoneNumber, userData) =>
    apiClient.put(`/users/phone/${phoneNumber}`, userData),

  // Delete user by phone number
  deleteUserByPhone: (phoneNumber) =>
    apiClient.delete(`/users/phone/${phoneNumber}`),

  // Activate/deactivate user by phone number
  activateUserByPhone: (phoneNumber) =>
    apiClient.put(`/users/phone/${phoneNumber}/activate`),

  // Get user by ID (legacy)
  getUserById: (id) => apiClient.get(`/users/id/${id}`),
};
