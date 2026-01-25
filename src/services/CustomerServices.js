import requests from "./httpService";

const CustomerServices = {
  getAllCustomers: async ({ searchText = "" }) => {
    return requests.get(`/customer?searchText=${searchText}`);
  },

  addAllCustomers: async (body) => {
    return requests.post("/customer/add/all", body);
  },
  // user create
  createCustomer: async (body) => {
    return requests.post(`/customer/create`, body);
  },

  filterCustomer: async (email) => {
    return requests.post(`/customer/filter/${email}`);
  },

  getCustomerById: async (id) => {
    return requests.get(`/customer/${id}`);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  deleteCustomer: async (id) => {
    return requests.delete(`/customer/${id}`);
  },

  toggleCashier: async (id, body) => {
    return requests.put(`/customer/toggle-cashier/${id}`, body);
  },

  updateCustomerByAdmin: async (id, body) => {
    return requests.put(`/customer/admin/${id}`, body);
  },

  createCustomerByAdmin: async (body) => {
    return requests.post(`/customer/admin/create`, body);
  },

  // משיכת מסמכים מריווחית
  getRivhitDocuments: async (customerId, from, to) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const queryString = params.toString();
    return requests.get(`/rivhit/customers/${customerId}/documents${queryString ? `?${queryString}` : ''}`);
  },
};

export default CustomerServices;
