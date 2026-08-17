// src/services/OfferServices.js
/**
 * Reads from `/offers/*` — the storefront asks the same routes. Writes go to
 * `/admin/offers/*`, which stores only the fields the offer's own type uses.
 */
import requests from './httpService';

const OfferServices = {
  addOffer: async (body) => {
    return requests.post('/admin/offers', body);
  },

  getOfferById: async (id) => {
    return requests.get(`/offers/${id}`);
  },

  getAllOffers: async () => {
    return requests.get(`/offers`);
  },

  updateOffer: async (id, body) => {
    return requests.patch(`/admin/offers/${id}`, body);
  },

  deleteOffer: async (id) => {
    return requests.delete(`/admin/offers/${id}`);
  },

  deleteManyOffer: async (body) => {
    return requests.delete('/admin/offers/bulk', body);
  },
};

export default OfferServices;
