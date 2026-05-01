// In your api.js or messagingApi.js
import apiClient from "./client";

export const messagingAPI = {
  createConversation: (data) =>
    apiClient.post("/messaging/conversations", data),
  getConversations: () => apiClient.get("/messaging/conversations"),
  getUnreadCount: () => apiClient.get("/messaging/conversations/unread/count"),
  getConversation: (id) => apiClient.get(`/messaging/conversations/${id}`),
  getMessages: (id) => apiClient.get(`/messaging/conversations/${id}/messages`),
  searchMessages: (id, query) =>
    apiClient.get(`/messaging/conversations/${id}/search?q=${query}`),
  sendMessage: (data) => apiClient.post("/messaging/messages", data),
  sendDirectMessage: (data) =>
    apiClient.post("/messaging/messages/direct", data),
  markAsRead: (data) => apiClient.put("/messaging/messages/read", data),
  deleteMessage: (id) => apiClient.delete(`/messaging/messages/${id}`),
  addParticipants: (conversationId, data) =>
    apiClient.post(
      `/messaging/conversations/${conversationId}/participants`,
      data,
    ),
  leaveConversation: (conversationId) =>
    apiClient.post(`/messaging/conversations/${conversationId}/leave`),

  // --- New role‑specific endpoints ---
  getParentChildren: () => apiClient.get("/messaging/parent/children"),
  getTeacherStudents: () => apiClient.get("/messaging/teacher/students"),
  getStudentContacts: () => apiClient.get("/messaging/student/contacts"),

  // Direct message shortcuts by role
  sendParentToTeacher: (teacherId, studentId, content) =>
    apiClient.post(
      `/messaging/parent/teacher/${teacherId}/student/${studentId}`,
      { content },
    ),
  sendTeacherToParent: (parentId, studentId, content) =>
    apiClient.post(
      `/messaging/teacher/parent/${parentId}/student/${studentId}`,
      { content },
    ),
  sendStudentToParent: (parentId, content) =>
    apiClient.post(`/messaging/student/parent/${parentId}`, { content }),
  sendStudentToTeacher: (teacherId, content) =>
    apiClient.post(`/messaging/student/teacher/${teacherId}`, { content }),
};
