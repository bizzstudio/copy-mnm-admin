import requests from "./httpService";

const AgentServices = {
  getAllAgents: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return requests.get(`/admin/agents${qs ? `?${qs}` : ""}`);
  },
  getAgentById: async (id) => {
    return requests.get(`/admin/agents/${id}`);
  },
  addAgent: async (body) => {
    return requests.post(`/admin/agents`, body);
  },
  updateAgent: async (id, body) => {
    return requests.put(`/admin/agents/${id}`, body);
  },
  deleteAgent: async (id) => {
    return requests.delete(`/admin/agents/${id}`);
  },
  getAgentPerformance: async (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return requests.get(`/admin/agents/${id}/performance${qs ? `?${qs}` : ""}`);
  },
  getOverview: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return requests.get(`/admin/agents/overview/all${qs ? `?${qs}` : ""}`);
  },

  // ייבוא אקסל מחירי סוכן — body: { rows: [...], dryRun? }
  importAgentPricing: async (body, options = {}) => {
    const qs = options?.dryRun ? "?dryRun=true" : "";
    return requests.post(`/admin/agents/pricing-import${qs}`, body);
  },
};

export default AgentServices;
