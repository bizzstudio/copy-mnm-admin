import requests from "./httpService";

const PriceListServices = {
    // Add a new price list
    addPriceList: async (body) => {
        return requests.post("/price-list/add", body);
    },

    // Get all price lists
    getAllPriceLists: async () => {
        return requests.get("/price-list/all");
    },

    // Get price list by ID
    getPriceListById: async (id) => {
        return requests.get(`/price-list/${id}`);
    },

    // Update a price list by ID
    updatePriceList: async (id, body) => {
        return requests.put(`/price-list/${id}`, body);
    },

    // Delete a price list by ID
    deletePriceList: async (id) => {
        return requests.delete(`/price-list/${id}`);
    },

    // Delete multiple price lists by IDs
    deleteManyPriceLists: async (body) => {
        return requests.patch(`/price-list/delete-many`, body);
    }
};

export default PriceListServices;