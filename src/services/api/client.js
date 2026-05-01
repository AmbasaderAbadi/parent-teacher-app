import axios from "axios";

const API_BASE_URL = "https://parent-teacher-app-final.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 70000,
});

// 🔥 CLEAR AUTH + REDIRECT
const clearAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");

  if (
    !window.location.pathname.includes("/login") &&
    !window.location.pathname.includes("/register")
  ) {
    window.location.href = "/login";
  }
};

//
// ✅ REQUEST INTERCEPTOR (FIXED)
//
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    const isPublicEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/refresh-token");

    // ✅ ONLY check token — DO NOT use isAuthenticated
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

//
// ✅ RESPONSE INTERCEPTOR (FULLY SAFE)
//
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    const token = localStorage.getItem("accessToken");

    // 🔥 CRITICAL: if no token → user is logged out → do NOTHING
    if (!token) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // ❌ No refresh token → force logout
        if (!refreshToken) {
          clearAndRedirect();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
        );

        // ⚠️ SUPPORT BOTH BACKEND FORMATS
        const accessToken =
          response.data.accessToken || response.data.access_token;

        const newRefreshToken =
          response.data.refreshToken || response.data.refresh_token;

        if (!accessToken) {
          throw new Error("No access token returned");
        }

        // ✅ Save new tokens
        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // ✅ Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
