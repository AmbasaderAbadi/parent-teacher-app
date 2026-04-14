import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", user.role);

      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const response = await authAPI.adminLogin(credentials);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", "admin");

      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Admin login failed",
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    adminLogin,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
