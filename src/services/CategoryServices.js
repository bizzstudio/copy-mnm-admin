// src/services/CategoryServices.js
/**
 * Reads from `/category/*` — including the nested tree the category screens render.
 * Writes to `/admin/categories/*`, which is where the tree rules now live: a blank
 * parent stores as a root instead of an unreachable orphan, a cycle is refused, and
 * deleting a category takes its whole branch rather than one level of it.
 *
 * Write responses are `{ item }` / `{ ok, count }` with a bilingual `message` — see
 * the note in `ProductServices`.
 */
import requests from "./httpService";

const CategoryServices = {
  getAllCategory: async () => {
    return requests.get("/category");
  },

  getAllCategories: async () => {
    return requests.get("/category/all");
  },

  getCategoryById: async (id) => {
    return requests.get(`/category/${id}`);
  },

  addCategory: async (body) => {
    return requests.post("/admin/categories", body);
  },

  /** The categories file. Upserts by `_id`, so re-importing an export updates. */
  addAllCategory: async (body) => {
    const items = Array.isArray(body) ? body : body?.items;
    return requests.post("/admin/categories/import", { items });
  },

  updateCategory: async (id, body) => {
    return requests.patch(`/admin/categories/${id}`, body);
  },

  updateStatus: async (id, body) => {
    return requests.patch(`/admin/categories/${id}`, body);
  },

  deleteCategory: async (id) => {
    return requests.delete(`/admin/categories/${id}`);
  },

  updateManyCategory: async (body) => {
    return requests.patch("/admin/categories/bulk", body);
  },

  deleteManyCategory: async (body) => {
    return requests.delete("/admin/categories/bulk", body);
  },
};

export default CategoryServices;
