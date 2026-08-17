// src/services/CouponServices.js
/**
 * Reads from `/coupon/*`, writes to `/admin/coupons/*`.
 *
 * `addAllCoupon` NO LONGER EMPTIES THE TABLE FIRST. The route it used to call ran
 * `Coupon.deleteMany()` with no filter and then inserted the file — so importing a
 * file of three coupons deleted the tenant's other forty, from a button labelled
 * "add all". It now posts to the ordinary bulk-create route: the file's rows are
 * added, and nothing else is touched.
 *
 * The coupon drawer still posts MNM's older `couponCode` and
 * `discountType: { type, value }`; the server translates both, so the form did not
 * have to change with the route.
 */
import requests from './httpService';

const CouponServices = {
  addCoupon: async (body) => {
    return requests.post('/admin/coupons', body);
  },
  addAllCoupon: async (body) => {
    return requests.post('/admin/coupons/bulk', Array.isArray(body) ? body : body?.items);
  },
  getAllCoupons: async () => {
    return requests.get('/coupon');
  },
  getCouponById: async (id) => {
    return requests.get(`/coupon/${id}`);
  },
  updateCoupon: async (id, body) => {
    return requests.patch(`/admin/coupons/${id}`, body);
  },
  updateManyCoupons: async (body) => {
    return requests.patch('/admin/coupons/bulk', body);
  },
  updateStatus: async (id, body) => {
    return requests.patch(`/admin/coupons/${id}`, body);
  },
  deleteCoupon: async (id) => {
    return requests.delete(`/admin/coupons/${id}`);
  },
  deleteManyCoupons: async (body) => {
    return requests.delete('/admin/coupons/bulk', body);
  },
};

export default CouponServices;
