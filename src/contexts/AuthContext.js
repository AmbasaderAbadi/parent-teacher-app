import React, { createContext, useContext, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { axiosInstance } from "../services/api/axiosInstance";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { login: storeLogin, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      const { user, token } = response.data;
      storeLogin(user, token);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
  };

  return (
    <AuthContext.Provider value={{ login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
