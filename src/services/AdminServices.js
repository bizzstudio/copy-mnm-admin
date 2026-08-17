// src/services/AdminServices.js
import requests from "./httpService";

/**
 * SIGN-IN LIVES UNDER `/auth`, not `/admin`.
 *
 * `/admin/login` and `/admin/validate-token` are gone. They answered, which is
 * what made them dangerous: `/admin/login` returned a token stamped
 * `typ: 'customer'`, so signing in worked and every screen afterwards returned
 * 403; `/admin/validate-token` checked the retired secret and so said `false`
 * about every token ever issued, throwing a signed-in operator back to this form.
 *
 * The replacements mint a token carrying `typ`, the tenant id and a version, and
 * answer with `{ token, refreshToken, user }` — see `flattenSession` in
 * `useLoginSubmit`, which is where that shape is turned back into the flat
 * `adminInfo` cookie the rest of the app reads.
 */
const AdminServices = {
  registerAdmin: async (body) => {
    return requests.post("/admin/register", body);
  },

  loginAdmin: async (body) => {
    return requests.post(`/auth/login`, body);
  },

  forgetPassword: async (body) => {
    return requests.put("/admin/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/admin/reset-password", body);
  },

  verifyMfa: async (body) => {
    return requests.post("/auth/mfa/verify", body);
  },

  addStaff: async (body) => {
    return requests.post("/admin/add", body);
  },
  getAllStaff: async (body) => {
    return requests.get("/admin", body);
  },
  getStaffById: async (id, body) => {
    return requests.post(`/admin/${id}`, body);
  },

  updateStaff: async (id, body) => {
    return requests.put(`/admin/${id}`, body);
  },

  updateStaffStatus: async (id, body) => {
    return requests.put(`/admin/update-status/${id}`, body);
  },

  deleteStaff: async (id) => {
    return requests.delete(`/admin/${id}`);
  },

  /**
   * Is this session still good?
   *
   * `/auth/me` answers with the user rather than a bare boolean, and a rejected
   * token is a 401 — so "valid" is "it resolved", not "it returned true". The old
   * endpoint replied `200 false` for a bad token, which meant a network error and
   * a rejection were indistinguishable at the call site.
   */
  validateToken: async () => {
    return requests.get("/auth/me");
  },

  logout: async () => {
    return requests.post("/auth/logout", {});
  },
};

export default AdminServices;
