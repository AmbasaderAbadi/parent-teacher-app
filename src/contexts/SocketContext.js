import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuthStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(
        process.env.REACT_APP_WS_URL || "http://localhost:5000",
        {
          auth: { token },
          transports: ["websocket"],
        },
      );
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, token]);

  const emit = (event, data) => {
    if (socket) socket.emit(event, data);
  };

  const on = (event, callback) => {
    if (socket) socket.on(event, callback);
  };

  const off = (event, callback) => {
    if (socket) socket.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{ socket, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
