import requests from "./httpService";

/** יעדי משלוח (עיר + ימים). חובה לשייך לאזור (regionId) – ראה RegionServices. */
const DeliveryServices = {
  getAllDeliveries: async () => {
    return requests.get("/deliveries");
  },

  /** יעדים לפי אזור */
  getDeliveriesByRegion: async (regionId) => {
    return requests.get(`/delivery-regions/${regionId}/deliveries`);
  },

  getDeliveryById: async (id) => {
    return requests.get(`/deliveries/${id}`);
  },

  addDelivery: async (body) => {
    return requests.post("/deliveries", body);
  },

  updateDelivery: async (id, body) => {
    return requests.put(`/deliveries/${id}`, body);
  },

  deleteDelivery: async (id) => {
    return requests.delete(`/deliveries/${id}`);
  },

  deleteManyDelivery: async (body) => {
    return requests.patch('/deliveries/delete/many', body);
  },

  addAllDelivery: async (body) => {
    return requests.post('/deliveries/add/all', body);
  },
};

export default DeliveryServices;
