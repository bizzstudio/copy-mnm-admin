// src/services/SupplyServices.js
import requests from "./httpService";

/**
 * צד הרכש והמשלוח: ספקים, הזמנות רכש וחברות משלוח.
 *
 * שלושתם יושבים על `crudController` בשרת ולכן חולקים את אותה מעטפת —
 * `{ items, total, page, pages }` בקריאה ו-`{ item }` בכתיבה.
 *
 * ── למה הנתיבים כתובים במלואם ולא נבנים ממשתנה ─────────────────────────────
 * `tests/contracts/routeCoverage.test.js` סורק את קוד הפרונט ומוודא שכל נתיב
 * שנקרא באמת קיים בשרת — אבל הוא יכול לקרוא רק ליטרלים. נתיב שנבנה מ-`${path}`
 * פשוט נדלג עליו בשקט, כלומר הוא מפסיק להיות מכוסה. עדיף חזרתיות מאשר להוציא
 * שנים־עשר endpoints מהבדיקה שנכתבה בדיוק בשביל המקרה של endpoint שנעלם.
 */

const listQuery = ({ search, page = 1, limit = 100, status } = {}) => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return params.toString();
};

const SupplyServices = {
  /* ── ספקים ─────────────────────────────────────────────────────────────── */
  getSuppliers: async (opts) => requests.get(`/admin/suppliers?${listQuery(opts)}`),
  getSupplier: async (id) => requests.get(`/admin/suppliers/${id}`),
  addSupplier: async (body) => requests.post("/admin/suppliers", body),
  updateSupplier: async (id, body) => requests.patch(`/admin/suppliers/${id}`, body),
  deleteSupplier: async (id) => requests.delete(`/admin/suppliers/${id}`),

  /* ── הזמנות רכש ────────────────────────────────────────────────────────── */
  getPurchaseOrders: async (opts) => requests.get(`/admin/purchase-orders?${listQuery(opts)}`),
  getPurchaseOrder: async (id) => requests.get(`/admin/purchase-orders/${id}`),
  addPurchaseOrder: async (body) => requests.post("/admin/purchase-orders", body),
  updatePurchaseOrder: async (id, body) => requests.patch(`/admin/purchase-orders/${id}`, body),
  deletePurchaseOrder: async (id) => requests.delete(`/admin/purchase-orders/${id}`),

  /**
   * קליטת סחורה. `lines` הן תוספות ולא ערכים מוחלטים — משלוח שני של אותו פריט
   * מצטבר לראשון במקום להחליף אותו בשקט.
   *
   * @param {string} id
   * @param {{lines: Array<{index:number, quantity:number, unitCost?:number}>, location?:string, supplierDocNumber?:string}} body
   */
  receivePurchaseOrder: async (id, body) =>
    requests.post(`/admin/purchase-orders/${id}/receive`, body),

  /* ── חברות משלוח ───────────────────────────────────────────────────────── */
  getShippingProviders: async (opts) =>
    requests.get(`/admin/shipping-providers?${listQuery(opts)}`),
  addShippingProvider: async (body) => requests.post("/admin/shipping-providers", body),
  updateShippingProvider: async (id, body) =>
    requests.patch(`/admin/shipping-providers/${id}`, body),
  deleteShippingProvider: async (id) => requests.delete(`/admin/shipping-providers/${id}`),
};

export default SupplyServices;
