import apiClient from "./client";

export const authAPI = {
  // Register
  registerTeacher: (userData) =>
    apiClient.post("/auth/register/teacher", userData),

  registerStudent: (userData) =>
    apiClient.post("/auth/register/student", userData),

  registerParent: (userData) =>
    apiClient.post("/auth/register/parent", userData),

  // Login
  login: (credentials) => apiClient.post("/auth/login", credentials),

  // Profile
  getProfile: () => apiClient.get("/auth/profile"),

  updateProfile: (profileData) => apiClient.put("/auth/profile", profileData),

  // Change password (logged in user)
  changePassword: (passwordData) =>
    apiClient.post("/auth/change-password", passwordData),

  // Forgot password
  forgotPassword: (phoneNumber) =>
    apiClient.post("/auth/forgot-password", { phoneNumber }),

  // ✅ RESET PASSWORD (FIXED FOR YOUR BACKEND)
  resetPassword: ({ token, newPassword, confirmPassword }) =>
    apiClient.post("/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    }),

  // Optional
  validateResetToken: (token) =>
    apiClient.post("/auth/validate-reset-token", { token }),

  // Token refresh
  refreshToken: (refreshToken) =>
    apiClient.post("/auth/refresh-token", { refreshToken }),

  logout: () => apiClient.post("/auth/logout"),

  // Clear session
  clearSession: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  },
};
