import apiClient from "./client";

export const materialsAPI = {
  // Upload file (multipart/form-data)
  createMaterial: (data, config) => apiClient.post("/materials", data, config),

  // Create material with URL (JSON payload)
  createMaterialWithUrl: (urlData) => apiClient.post("/materials/url", urlData),

  // Get all materials
  getAllMaterials: () => apiClient.get("/materials"),

  // Get popular materials
  getPopularMaterials: () => apiClient.get("/materials/popular"),

  // Get featured materials
  getFeaturedMaterials: () => apiClient.get("/materials/featured"),

  // Get my materials
  getMyMaterials: () => apiClient.get("/materials/my"),

  // Get material statistics
  getMaterialStats: () => apiClient.get("/materials/statistics"),

  // Get materials by subject
  getMaterialsBySubject: (subject) =>
    apiClient.get(`/materials/subject/${subject}`),

  // Get materials by tags (query param)
  getMaterialsByTags: (tags) => apiClient.get(`/materials/tags?tags=${tags}`),

  // Get material by ID
  getMaterialById: (id) => apiClient.get(`/materials/${id}`),

  // Update material
  updateMaterial: (id, data) => apiClient.put(`/materials/${id}`, data),

  // Delete material
  deleteMaterial: (id) => apiClient.delete(`/materials/${id}`),

  // Publish material
  publishMaterial: (id) => apiClient.post(`/materials/${id}/publish`),

  // Track view
  trackView: (id) => apiClient.post(`/materials/${id}/view`),

  // Track download
  trackDownload: (id) => apiClient.post(`/materials/${id}/download`),
};
