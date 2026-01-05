import api from './api';

const legalRegisterService = {
  // Get all legal registers with pagination, search, and filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/legal-registers?${queryString}`);
    return response.data;
  },

  // Get single legal register by ID
  getById: async (id) => {
    const response = await api.get(`/legal-registers/${id}`);
    return response.data;
  },

  // Create new legal register
  create: async (data) => {
    const response = await api.post('/legal-registers', data);
    return response.data;
  },

  // Update legal register
  update: async (id, data) => {
    const response = await api.put(`/legal-registers/${id}`, data);
    return response.data;
  },

  // Delete legal register
  delete: async (id) => {
    const response = await api.delete(`/legal-registers/${id}`);
    return response.data;
  },

  // Get expiry alerts for dashboard
  getExpiryAlerts: async () => {
    const response = await api.get('/legal-registers/alerts/expiry');
    return response.data;
  },

  // Get statistics for dashboard
  getStatistics: async () => {
    const response = await api.get('/legal-registers/stats/summary');
    return response.data;
  },
};

export default legalRegisterService;
