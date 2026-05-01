import apiClient from "./client";

export const calendarAPI = {
  // Create event
  createEvent: (data) => apiClient.post("/calendar/events", data),

  // Get all events
  getAllEvents: () => apiClient.get("/calendar/events"),

  // Get upcoming events
  getUpcomingEvents: () => apiClient.get("/calendar/events/upcoming"),

  // Get monthly view
  getMonthlyEvents: (year, month) =>
    apiClient.get(`/calendar/events/monthly?year=${year}&month=${month}`),

  // Get events by type
  getEventsByType: (type) => apiClient.get(`/calendar/events/type/${type}`),

  // Get calendar statistics
  getCalendarStats: () => apiClient.get("/calendar/events/stats"),

  // Get event by ID
  getEventById: (id) => apiClient.get(`/calendar/events/${id}`),

  // Update event
  updateEvent: (id, data) => apiClient.put(`/calendar/events/${id}`, data),

  // Delete event
  deleteEvent: (id) => apiClient.delete(`/calendar/events/${id}`),

  // RSVP to event
  rsvpToEvent: (id, status) =>
    apiClient.post(`/calendar/events/${id}/rsvp`, { status }),
};
