import requests from "./httpService";

/**
 * שירותי אזורי משלוח.
 * כל יעד (עיר) חייב להיות משויך לאזור. מחיר המשלוח נקבע לפי כללי התמחור של האזור (לפי סכום אחרי הנחות).
 */
const RegionServices = {
  /** רשימת כל האזורים כולל יעדים וכללי תמחור */
  getAllRegions: async () => {
    return requests.get("/delivery-regions");
  },

  getRegionById: async (id) => {
    return requests.get(`/delivery-regions/${id}`);
  },

  addRegion: async (body) => {
    return requests.post("/delivery-regions", body);
  },

  updateRegion: async (id, body) => {
    return requests.put(`/delivery-regions/${id}`, body);
  },

  deleteRegion: async (id) => {
    return requests.delete(`/delivery-regions/${id}`);
  },

  /** עדכון כללי תמחור לאזור. body: { priceRules: [{ minOrderTotal, shippingCost }] } */
  updateRegionPriceRules: async (regionId, body) => {
    return requests.put(`/delivery-regions/${regionId}/price-rules`, body);
  },
};

export default RegionServices;
