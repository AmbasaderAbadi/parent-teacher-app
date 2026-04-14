import apiClient from "./client";

export const calendarAPI = {
  createEvent: (eventData) => apiClient.post("/calendar/events", eventData),
  getAllEvents: () => apiClient.get("/calendar/events"),
  getEventsByMonth: (year, month) =>
    apiClient.get(`/calendar/events/month?year=${year}&month=${month}`),
  getEventById: (id) => apiClient.get(`/calendar/events/${id}`),
  updateEvent: (id, eventData) =>
    apiClient.put(`/calendar/events/${id}`, eventData),
  deleteEvent: (id) => apiClient.delete(`/calendar/events/${id}`),
};
