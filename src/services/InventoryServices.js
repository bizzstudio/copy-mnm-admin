// src/services/InventoryServices.js
import requests from "./httpService";

const InventoryServices = {
  // כל נתוני דשבורד המלאי בקריאה אחת
  getInventoryDashboard: async ({ type, location, category, search } = {}) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    return requests.get(`/inventory/dashboard?${params.toString()}`);
  },

  getLocations: async ({ type, active } = {}) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (active) params.set("active", active);
    return requests.get(`/inventory/locations?${params.toString()}`);
  },

  addLocation: async (body) => requests.post("/inventory/locations", body),

  updateLocation: async (id, body) =>
    requests.put(`/inventory/locations/${id}`, body),

  deleteLocation: async (id) => requests.delete(`/inventory/locations/${id}`),

  // מלאי של מוצר בכל המיקומים
  getProductStock: async (productId) =>
    requests.get(`/inventory/product/${productId}`),

  // עדכון כמות של מוצר במיקום בודד
  updateStockItem: async (body) => requests.put("/inventory/item", body),

  // עדכון מרובה: { rows: [{ product, location, quantity }] }
  bulkUpdateStock: async (rows) => requests.put("/inventory/bulk", { rows }),
};

export default InventoryServices;
