// src/services/ProductServices.js
/**
 * READS still go to `/products/*` — the storefront-shaped routes with the pricing,
 * the voice search and the CSV exports.
 *
 * WRITES GO TO `/admin/products/*`, which is now the only place that accepts them.
 * The old paths (`/products/add`, `/products/update/many`, `/products/status/:id`…)
 * were removed from the server in the same change: they wrote whatever was in the
 * body, with no field allowlist and no audit event, so `costPrice` was settable from
 * a screen that does not show it.
 *
 * THE RESPONSES CHANGED SHAPE. A write answers `{ item }` or `{ ok, count }` plus a
 * bilingual `message`, in place of MNM's `{ data, message }` with an English string.
 * Toast it through `notifyApiResponse(res, true)` — `notifySuccess(res.message)`
 * would hand React an object and render nothing.
 */
import requests from "./httpService";

const ProductServices = {
  getAllProducts: async ({ page, limit, category, title, price }) => {
    const searchCategory = category !== null ? category : "";
    const searchTitle = title !== null ? title : "";
    const searchPrice = price !== null ? price : "";

    return requests.get(
      `/products?page=${page}&limit=${limit}&category=${searchCategory}&title=${searchTitle}&price=${searchPrice}`
    );
  },

  getProductByBarcode: async (barcode) => {
    return requests.get(`/products/barcode/${barcode}`);
  },
  addStockByBarcode: async (barcode, quantity) => {
    return requests.patch(`/products/barcode/${encodeURIComponent(barcode)}/add-stock`, { quantity });
  },
  getProductById: async (id) => {
    return requests.post(`/products/${id}`);
  },
  addProduct: async (body) => {
    return requests.post("/admin/products", body);
  },

  /**
   * The catalogue spreadsheet. Two call sites pass two different shapes — the import
   * drawer an object, the CSV drop zone a bare array — and the array one had been
   * answered 400 for as long as it existed. Normalised here so both work.
   */
  addAllProducts: async (body) => {
    const products = Array.isArray(body) ? body : body?.products;
    return requests.post("/admin/products/import", { products });
  },

  updateProduct: async (id, body) => {
    return requests.patch(`/admin/products/${id}`, body);
  },
  updateProductPrice: async (id, priceListId, body) => {
    return requests.patch(`/admin/products/${id}/prices/${priceListId}`, body);
  },
  updateManyProducts: async (body) => {
    return requests.patch("/admin/products/bulk", body);
  },
  /** Show/hide is an ordinary field write; it does not need a route of its own. */
  updateStatus: async (id, body) => {
    return requests.patch(`/admin/products/${id}`, body);
  },

  deleteProduct: async (id) => {
    return requests.delete(`/admin/products/${id}`);
  },
  deleteManyProducts: async (body) => {
    return requests.delete("/admin/products/bulk", body);
  },

  downloadImagesZip: async () => {
    return requests.getBlobLongTimeout("/products/export/images-zip");
  },
};

export default ProductServices;
