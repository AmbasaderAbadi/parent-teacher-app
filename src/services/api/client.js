import axios from "axios";

const API_BASE_URL = "https://parent-teacher-backend-y0j0.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ✅ REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config) => {
    const isAuthRequest =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/admin/login");

    if (!isAuthRequest) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ RESPONSE INTERCEPTOR (FIXED)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/admin/login");

    // 🔥 HANDLE TOKEN EXPIRY (ONLY ONCE)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // ❗ If no refresh token → don't logout instantly
        if (!refreshToken) {
          console.warn("No refresh token, skipping refresh");
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // ✅ Save new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // ✅ Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);

        // ❗ ONLY logout if refresh ALSO fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");

        // ❌ DO NOT use window.location.href
        // Let React handle redirect via ProtectedRoute

        return Promise.reject(refreshError);
      }
    }

    // ✅ DO NOT interfere with login errors
    if (error.response?.status === 401 && isAuthRequest) {
      return Promise.reject(error);
    }

    // Optional logs
    if (error.response?.status === 403) {
      console.error("Forbidden access");
    } else if (error.response?.status === 404) {
      console.error("Resource not found");
    } else if (error.response?.status === 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
