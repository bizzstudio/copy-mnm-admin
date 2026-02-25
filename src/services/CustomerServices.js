// src/services/CustomerServices.js
import requests from "./httpService";

const CustomerServices = {
  getAllMainCustomers: async () => {
    return requests.get(`/customer/all/main`);
  },

  getMainCustomer: async (id) => {
    return requests.get(`/customer/main/${id}`);
  },

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

  importPermittedBarcodes: async (id, body, mode = "replace") => {
    return requests.post(`/customer/admin/${id}/permitted-barcodes/import?mode=${encodeURIComponent(mode)}`, body);
  },

  getPermittedProducts: async (id) => {
    return requests.get(`/customer/admin/${id}/permitted-products`);
  },

  addPermittedProduct: async (id, body) => {
    return requests.post(`/customer/admin/${id}/permitted-products/add`, body);
  },

  removePermittedProduct: async (id, body) => {
    return requests.post(`/customer/admin/${id}/permitted-products/remove`, body);
  },

  createCustomerByAdmin: async (body) => {
    return requests.post(`/customer/admin/create`, body);
  },

  deleteMainCustomer: async (id) => {
    return requests.delete(`/customer/admin/main/${id}`);
  },

  // משיכת מסמכים מריווחית
  getRivhitDocuments: async (customerId, from, to, scope = 'sub') => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (scope) params.append('scope', scope); // 'sub' או 'main'
    const queryString = params.toString();
    return requests.get(`/rivhit/customers/${customerId}/documents${queryString ? `?${queryString}` : ''}`);
  },

  // קבלת רשימת שיטות תשלום מריווחית
  getPaymentTypes: async () => {
    return requests.get('/rivhit/payment-types');
  },

  // הנפקת חשבונית מס קבלה ידנית (על הזמנות בהקפה)
  issueInvoiceReceipt: async (body) => {
    return requests.post('/rivhit/manual/invoice-receipt', body);
  },

  // הנפקת חשבונית מס רגילה (ללא תשלום)
  issueInvoice: async (body) => {
    return requests.post('/rivhit/manual/invoice', body);
  },

  // הנפקת קבלה על חשבונית מס קיימת
  issueReceipt: async (body) => {
    return requests.post('/rivhit/manual/receipt', body);
  },

  // הנפקת תעודת משלוח ידנית
  issueDeliveryNote: async (body) => {
    return requests.post('/rivhit/manual/delivery-note', body);
  },

  // הנפקת חשבונית מס זיכוי על חשבונית/חשבונית מס קבלה קיימת מריווחית
  issueCreditInvoice: async (body) => {
    return requests.post('/rivhit/manual/credit-invoice', body);
  },
};

export default CustomerServices;
