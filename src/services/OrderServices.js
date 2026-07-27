// src/services/OrderServices.js
import requests from "./httpService";

const OrderServices = {
  getAllOrders: async ({
    body,
    headers,
    customerName,
    statuses,
    page = 1,
    limit = 8,
    day,
    // source,
    method,
    startDate,
    endDate,
    cities,
    // download = "",
  }) => {
    const searchName = customerName !== null ? customerName : "";
    const searchDay = day !== null ? day : "";
    // const searchSource = source !== null ? source : "";
    const searchMethod = method !== null ? method : "";
    const startD = startDate !== null ? startDate : "";
    const endD = endDate !== null ? endDate : "";
    const searchStatuses = statuses && statuses.length > 0 ? statuses.join(",") : "";
    const searchCities = cities && cities.length > 0 ? cities.join(",") : "";

    return requests.get(
      `/orders?customerName=${searchName}&statuses=${searchStatuses}&day=${searchDay}&page=${page}&limit=${limit}&startDate=${startD}&endDate=${endD}&method=${searchMethod}&cities=${searchCities}`,
      body,
      headers
    );
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
    return requests.get(`/orders/agent-orders?${params.toString()}`);
  },

  getAllOrdersTwo: async ({ invoice, body, headers }) => {
    const searchInvoice = invoice !== null ? invoice : "";
    return requests.get(`/orders/all?invoice=${searchInvoice}`, body, headers);
  },

  getRecentOrders: async ({
    page = 1,
    limit = 8,
    startDate = "1:00",
    endDate = "23:59",
  }) => {
    return requests.get(
      `/orders/recent?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`
    );
  },

  getOrderCustomer: async (id, body) => {
    return requests.get(`/orders/customer/${id}`, body);
  },

  getOrderById: async (id, body) => {
    return requests.get(`/orders/${id}`, body);
  },

  getCashierOrderById: async (id, body) => {
    return requests.get(`/cashier-orders/${id}`, body);
  },

  updateOrder: async (id, body, headers) => {
    return requests.put(`/orders/${id}`, body, headers);
  },

  deleteOrder: async (id) => {
    return requests.delete(`/orders/${id}`);
  },

  getDashboardOrdersData: async ({
    page = 1,
    limit = 8,
    endDate = "23:59",
  }) => {
    return requests.get(
      `/orders/dashboard?page=${page}&limit=${limit}&endDate=${endDate}`
    );
  },

  getDashboardAmount: async () => {
    return requests.get("/orders/dashboard-amount");
  },

  getDashboardCount: async () => {
    return requests.get("/orders/dashboard-count");
  },

  getDashboardRecentOrder: async ({ page = 1, limit = 8 }) => {
    return requests.get(
      `/orders/dashboard-recent-order?page=${page}&limit=${limit}`
    );
  },

  getBestSellerProductChart: async () => {
    return requests.get("/orders/best-seller/chart");
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
    return requests.get(`/orders/sales-dashboard?${params.toString()}`);
  },
};

export default OrderServices;