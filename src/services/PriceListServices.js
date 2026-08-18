import requests from "./httpService";

const pickExportErrorMessage = (payload) => {
    if (!payload) return null;
    if (typeof payload.message === "string") return payload.message;
    if (payload.message?.he) return payload.message.he;
    if (payload.message?.en) return payload.message.en;
    return null;
};

/**
 * Reads and the two file operations stay on `/price-list/*`; the CRUD writes moved to
 * `/admin/price-lists/*`, which refuses to delete the DEFAULT list — a rule this file
 * used to enforce only by checking before it opened the delete modal.
 */
const PriceListServices = {
    // Add a new price list
    addPriceList: async (body) => {
        return requests.post("/admin/price-lists", body);
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
        return requests.patch(`/admin/price-lists/${id}`, body);
    },

    // Import prices by barcode for a specific price list
    importPriceListPrices: async (id, body, options = {}) => {
        const query = options?.dryRun ? "?dryRun=true" : "";
        return requests.post(`/price-list/${id}/import${query}`, body);
    },

    /** הורדת קובץ אקסל עם המחירים הקיימים למחירון (עמודות כמו בייבוא) */
    downloadPriceListExcel: async (id, filenameBase = "price-list") => {
        const response = await requests.getBlob(`/price-list/${id}/export`);
        const blob = response.data;
        const ct = (response.headers?.["content-type"] || blob?.type || "").toLowerCase();
        if (ct.includes("application/json") || blob.type === "application/json") {
            const text = await blob.text();
            try {
                const err = JSON.parse(text);
                throw new Error(pickExportErrorMessage(err) || "Export failed");
            } catch (e) {
                if (e.message && e.message !== "Export failed") throw e;
                throw new Error("Export failed");
            }
        }
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `${String(filenameBase).replace(/[/\\?%*:|"<>]/g, "_").slice(0, 80) || "price-list"}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(href);
    },

    // Delete a price list by ID
    deletePriceList: async (id) => {
        return requests.delete(`/admin/price-lists/${id}`);
    },

    // Delete multiple price lists by IDs
    deleteManyPriceLists: async (body) => {
        return requests.delete(`/admin/price-lists/bulk`, body);
    }
};

export default PriceListServices;
