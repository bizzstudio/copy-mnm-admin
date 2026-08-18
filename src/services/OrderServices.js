// src/services/OrderServices.js
import requests from "./httpService";

const OrderServices = {
  /**
   * THE order list — every channel, one call.
   *
   * `source` is what replaced the separate `/cashier-orders` and
   * `/admin/orders/agent-orders` screens: empty means all channels, and a value
   * narrows to one. The server unions the cashier collection in, so a caller
   * never has to know that it is still a collection of its own.
   *
   * Built with `URLSearchParams` rather than string concatenation — the old form
   * sent `customerName=null` as the literal text "null" whenever the search box
   * was cleared, and a name containing `&` truncated the query.
   */
  getAllOrders: async ({
    body,
    headers,
    customerName,
    statuses,
    page = 1,
    limit = 8,
    day,
    source,
    method,
    startDate,
    endDate,
    cities,
  } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (customerName) params.set("customerName", customerName);
    if (day) params.set("day", day);
    if (source) params.set("source", source);
    if (method) params.set("method", method);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (statuses?.length) params.set("statuses", statuses.join(","));
    if (cities?.length) params.set("cities", cities.join(","));

    return requests.get(`/admin/orders?${params.toString()}`, body, headers);
  },

  getAllCashierOrders: async ({
    body,
    headers,
    customerName,
    page = 1,
    limit = 8,
    day,
    startDate,
    endDate,
  }) => {
    const searchName = customerName !== null ? customerName : "";
    const searchDay = day !== null ? day : "";
    const startD = startDate !== null ? startDate : "";
    const endD = endDate !== null ? endDate : "";

    return requests.get(
      `/cashier-orders?customerName=${searchName}&day=${searchDay}&page=${page}&limit=${limit}&startDate=${startD}&endDate=${endD}`,
      body,
      headers
    );
  },

  getAllAgentOrders: async ({
    customerName,
    page = 1,
    limit = 100,
    startDate,
    endDate,
    type,
  } = {}) => {
    const params = new URLSearchParams();
    if (customerName) params.set("customerName", customerName);
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (type) params.set("type", type);
    return requests.get(`/admin/orders/agent-orders?${params.toString()}`);
  },

  /**
   * `getAllOrdersTwo` and `getRecentOrders` were here, calling `/orders/all` and
   * `/orders/recent`. No component used either, and NEITHER ENDPOINT HAS EVER
   * EXISTED — there is no such route in the server, before or after the move.
   * Removed rather than repointed: a service method reads as an available
   * capability, and the next person to want "recent orders" would have called it
   * and spent the afternoon on a 404.
   */
  getOrderCustomer: async (id, body) => {
    return requests.get(`/admin/orders/customer/${id}`, body);
  },

  getOrderById: async (id, body) => {
    return requests.get(`/admin/orders/${id}`, body);
  },

  getCashierOrderById: async (id, body) => {
    return requests.get(`/cashier-orders/${id}`, body);
  },

  updateOrder: async (id, body, headers) => {
    return requests.put(`/admin/orders/${id}`, body, headers);
  },

  deleteOrder: async (id) => {
    return requests.delete(`/admin/orders/${id}`);
  },

  getDashboardOrdersData: async ({
    page = 1,
    limit = 8,
    endDate = "23:59",
  }) => {
    return requests.get(
      `/admin/orders/dashboard?page=${page}&limit=${limit}&endDate=${endDate}`
    );
  },

  getDashboardAmount: async () => {
    return requests.get("/admin/orders/dashboard-amount");
  },

  getDashboardCount: async () => {
    return requests.get("/admin/orders/dashboard-count");
  },

  getDashboardRecentOrder: async ({ page = 1, limit = 8 }) => {
    return requests.get(
      `/admin/orders/dashboard-recent-order?page=${page}&limit=${limit}`
    );
  },

  getBestSellerProductChart: async () => {
    return requests.get("/admin/orders/best-seller/chart");
  },

  // כל נתוני דשבורד המכירות בקריאה אחת
  getSalesDashboard: async ({
    startDate,
    endDate,
    priceList,
    agent,
    branch,
    channel,
  } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (priceList) params.set("priceList", priceList);
    if (agent) params.set("agent", agent);
    if (branch) params.set("branch", branch);
    if (channel) params.set("channel", channel);
    return requests.get(`/admin/orders/sales-dashboard?${params.toString()}`);
  },
};

export default OrderServices;