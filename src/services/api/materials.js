import apiClient from "./client";

export const materialsAPI = {
  createMaterial: (materialData) => apiClient.post("/materials", materialData),
  getMyMaterials: () => apiClient.get("/materials/my"),
  getMaterialsByClass: (grade) => apiClient.get(`/materials/class/${grade}`),
  getMaterialById: (id) => apiClient.get(`/materials/${id}`),
  deleteMaterial: (id) => apiClient.delete(`/materials/${id}`),
};
