import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { notificationsAPI } from "../services/api";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const isAuthenticated = () => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    return !!(token && user);
  };

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await notificationsAPI.getNotifications();
      // ✅ Backend returns { success: true, data: [...], unreadCount: x }
      const notificationsData = response.data?.data || [];
      const unread = response.data?.unreadCount || 0;

      setNotifications(
        Array.isArray(notificationsData) ? notificationsData : [],
      );
      setUnreadCount(unread);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error fetching notifications:", error);
      }
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read – uses _id
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated()) return;

    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) => {
          const id = notif._id || notif.id;
          return id === notificationId ? { ...notif, read: true } : notif;
        }),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to mark as read");
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated()) return;

    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to mark all as read");
      }
    }
  };

  // Delete notification – uses _id
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated()) return;

    try {
      await notificationsAPI.deleteNotification(notificationId);
      const deletedNotif = notifications.find(
        (n) => (n._id || n.id) === notificationId,
      );
      setNotifications((prev) =>
        prev.filter((n) => (n._id || n.id) !== notificationId),
      );
      if (!deletedNotif?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to delete notification");
      }
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!isAuthenticated()) return;

    try {
      await notificationsAPI.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to clear notifications");
      }
    }
  };

  // Send single notification (admin/teacher)
  const sendNotification = async (data) => {
    if (!isAuthenticated()) return;

    try {
      const response = await notificationsAPI.createNotification(data);
      toast.success("Notification sent successfully");
      return response.data;
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to send notification",
      );
      throw error;
    }
  };

  // Send bulk notification (admin)
  const sendBulkNotification = async (data) => {
    if (!isAuthenticated()) return;

    try {
      const response = await notificationsAPI.sendBulkNotification(data);
      toast.success("Bulk notifications sent successfully");
      return response.data;
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      toast.error(
        error.response?.data?.message || "Failed to send bulk notifications",
      );
      throw error;
    }
  };

  // Poll every 30 seconds (only if authenticated)
  useEffect(() => {
    if (isAuthenticated()) {
      fetchNotifications();
      const interval = setInterval(() => {
        if (isAuthenticated()) fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    showDropdown,
    setShowDropdown,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    sendNotification,
    sendBulkNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
