// src/services/ReportServices.js
import requests from "./httpService";

const ReportServices = {
  /**
   * דוח רווחיות — אותם מספרים כמו בדשבורד, בחתך שנבחר.
   *
   * `groupBy`: product | category | channel | source | customer
   */
  getProfitReport: async ({
    startDate,
    endDate,
    groupBy = "product",
    priceList,
    agent,
    branch,
    channel,
    limit = 50,
  } = {}) => {
    const params = new URLSearchParams();
    params.set("groupBy", groupBy);
    params.set("limit", limit);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (priceList) params.set("priceList", priceList);
    if (agent) params.set("agent", agent);
    if (branch) params.set("branch", branch);
    if (channel) params.set("channel", channel);
    return requests.get(`/admin/reports/profit?${params.toString()}`);
  },

  /** ערוצי המכירה של הלקוח — פנימיים וחיצוניים, עם מצב החיבור של כל אחד. */
  getSalesChannels: async () => requests.get("/admin/channels"),

  /** המסמכים החשבונאיים שהופקו, מכל ההזמנות. */
  getAccountingDocuments: async ({ type, startDate, endDate, search, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (type) params.set("type", type);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (search) params.set("search", search);
    return requests.get(`/admin/accounting/documents?${params.toString()}`);
  },
};

export default ReportServices;
