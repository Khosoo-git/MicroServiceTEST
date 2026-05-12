import axios from 'axios';

const API_BASE = 'http://localhost:8085';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service API
export const serviceApi = {
  // Get all services
  getAll: async () => {
    const response = await api.get('/api/services');
    return response.data;
  },

  // Get service by ID
  getById: async (id: number) => {
    const response = await api.get(`/api/services/${id}`);
    return response.data;
  },

  // Create new service
  create: async (data: {
    serviceName: string;
    serviceType: string;
    port: number;
    host: string;
    description?: string;
    owner?: string;
    metricsEnabled?: boolean;
    logsEnabled?: boolean;
    tracingEnabled?: boolean;
  }) => {
    const response = await api.post('/api/services', data);
    return response.data;
  },

  // Update service
  update: async (
    id: number,
    data: {
      serviceName?: string;
      serviceType?: string;
      port?: number;
      host?: string;
      description?: string;
      owner?: string;
      metricsEnabled?: boolean;
      logsEnabled?: boolean;
      tracingEnabled?: boolean;
    }
  ) => {
    const response = await api.put(`/api/services/${id}`, data);
    return response.data;
  },

  // Delete service
  delete: async (id: number) => {
    const response = await api.delete(`/api/services/${id}`);
    return response.data;
  },

  // Refresh configs
  refreshConfigs: async () => {
    const response = await api.post('/api/services/refresh-configs');
    return response.data;
  },
};

// Alert API
export const alertApi = {
  // Get active alerts
  getActive: async () => {
    const response = await api.get('/api/alerts');
    return response.data;
  },

  // Get alert history
  getHistory: async () => {
    const response = await api.get('/api/alerts/history');
    return response.data;
  },
};

// Stats API
export const statsApi = {
  // Get dashboard stats
  getDashboard: async () => {
    const response = await api.get('/api/stats/dashboard');
    return response.data;
  },
};

// Activity API
export const activityApi = {
  // Get recent activities
  getRecent: async (limit = 50) => {
    const response = await api.get(`/api/activities?limit=${limit}`);
    return response.data;
  },
};

export default api;
