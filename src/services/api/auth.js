import apiClient from "./client";

// 🔧 MOCK MODE - Set to false when backend is ready
const USE_MOCK = false;

// Mock user database for testing
const mockUsers = {
  parent: {
    id: 1,
    userId: "parent123",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "parent@test.com",
    password: "parent123",
    role: "parent",
    phone: "+1 (555) 123-4567",
    address: "123 Parent St",
    children: ["John Doe", "Emma Doe"],
  },
  teacher: {
    id: 2,
    userId: "teacher123",
    firstName: "Michael",
    lastName: "Chen",
    email: "teacher@test.com",
    password: "teacher123",
    role: "teacher",
    subject: "Mathematics",
    class: "Grade 10A",
    phone: "+1 (555) 234-5678",
  },
  student: {
    id: 3,
    userId: "student123",
    firstName: "John",
    lastName: "Doe",
    email: "student@test.com",
    password: "student123",
    role: "student",
    grade: "10th Grade",
    class: "Section A",
    phone: "+1 (555) 345-6789",
  },
  admin: {
    id: 4,
    userId: "admin123",
    firstName: "Admin",
    lastName: "User",
    email: "admin@school.com",
    password: "admin123",
    role: "admin",
    phone: "+1 (555) 456-7890",
  },
};

export const authAPI = {
  // Register endpoints
  registerParent: async (userData) => {
    if (USE_MOCK) {
      console.log("🎭 MOCK: Parent registration", userData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        data: {
          message: "Parent registration successful! Please login.",
          user: {
            ...userData,
            id: Date.now(),
            userId: userData.userId,
            role: "parent",
          },
        },
      };
    }
    return apiClient.post("/auth/register/parent", userData);
  },

  registerTeacher: async (userData) => {
    if (USE_MOCK) {
      console.log("🎭 MOCK: Teacher registration", userData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        data: {
          message: "Teacher registration successful! Please login.",
          user: {
            ...userData,
            id: Date.now(),
            userId: userData.userId,
            role: "teacher",
          },
        },
      };
    }
    return apiClient.post("/auth/register/teacher", userData);
  },

  registerStudent: async (userData) => {
    if (USE_MOCK) {
      console.log("🎭 MOCK: Student registration", userData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        data: {
          message: "Student registration successful! Please login.",
          user: {
            ...userData,
            id: Date.now(),
            userId: userData.userId,
            role: "student",
          },
        },
      };
    }
    return apiClient.post("/auth/register/student", userData);
  },

  // Login endpoint - NOW INCLUDES ROLE FIELD
  login: async (credentials) => {
    if (USE_MOCK) {
      console.log("🎭 MOCK: Login attempt", credentials);
      await new Promise((resolve) => setTimeout(resolve, 800));

      let foundUser = null;
      for (const key in mockUsers) {
        if (mockUsers[key].userId === credentials.userId) {
          foundUser = mockUsers[key];
          break;
        }
      }

      if (
        foundUser &&
        foundUser.password === credentials.password &&
        foundUser.role === credentials.role
      ) {
        const { password, ...userWithoutPassword } = foundUser;
        return {
          data: {
            accessToken: "mock-access-token-" + Date.now(),
            refreshToken: "mock-refresh-token-" + Date.now(),
            user: userWithoutPassword,
          },
        };
      }

      throw {
        response: {
          status: 401,
          data: { message: "Invalid userId, password, or role" },
        },
      };
    }

    // Send ALL THREE fields to real backend: userId, password, and role
    const loginData = {
      userId: credentials.userId,
      password: credentials.password,
      role: credentials.role, // ← CRITICAL: Include role field
    };

    console.log("===== AUTH.JS LOGIN =====");
    console.log("Sending to backend:", loginData);

    try {
      const response = await apiClient.post("/auth/login", loginData);
      console.log("Login successful:", response.data);
      return response;
    } catch (error) {
      console.error(
        "Auth.js login error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  adminLogin: async (credentials) => {
    if (USE_MOCK) {
      console.log("🎭 MOCK: Admin login attempt", credentials);
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (
        credentials.userId === mockUsers.admin.userId &&
        credentials.password === mockUsers.admin.password &&
        credentials.role === "admin"
      ) {
        const { password, ...userWithoutPassword } = mockUsers.admin;
        return {
          data: {
            accessToken: "mock-admin-token-" + Date.now(),
            refreshToken: "mock-refresh-token-" + Date.now(),
            user: userWithoutPassword,
          },
        };
      }

      throw {
        response: {
          status: 401,
          data: { message: "Invalid admin credentials" },
        },
      };
    }

    // Admin login also needs role field
    const loginData = {
      userId: credentials.userId,
      password: credentials.password,
      role: "admin",
    };

    return apiClient.post("/auth/admin/login", loginData);
  },

  // Profile endpoints
  getProfile: async () => {
    if (USE_MOCK) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return { data: JSON.parse(storedUser) };
      }
      throw {
        response: { status: 401, data: { message: "Not authenticated" } },
      };
    }

    try {
      const response = await apiClient.get("/auth/profile");
      return response;
    } catch (error) {
      console.warn("⚠️ Profile fetch failed, using stored user");

      // ✅ FALLBACK: use localStorage instead of breaking session
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        return { data: JSON.parse(storedUser) };
      }

      // ❗ Only throw if truly no user exists
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    if (USE_MOCK) {
      console.log("🎭 MOCK: Update profile", profileData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { data: profileData };
    }
    return apiClient.put("/auth/profile", profileData);
  },

  // Logout
  logout: () => {
    console.log("🔓 Logging out...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  },
};
