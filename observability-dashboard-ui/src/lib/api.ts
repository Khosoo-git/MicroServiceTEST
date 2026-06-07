import axios from 'axios';

/** Browser: use NEXT_PUBLIC_API_URL or localhost. Docker UI uses service-registry-api hostname. */
export function getApiBase(): string {
  // Build-time override (e.g. local dev)
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  // Runtime override in the browser:
  // - When served behind nginx (:80/:443), nginx proxies `/api/*` → service-registry-api,
  //   so same-origin requests avoid CORS/mixed-content issues.
  // - When served directly on :3002 (docker port mapping), API is on :8085.
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    if (port === '3002') {
      return `${protocol}//${hostname}:8085`;
    }
    return origin;
  }

  // Server-side fallback
  return 'http://localhost:8085';
}

const api = axios.create({
  baseURL: getApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service API
export const serviceApi = {
  getAll: async () => {
    const response = await api.get('/api/services');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/services/${id}`);
    return response.data;
  },

  create: async (data: {
    serviceName: string;
    serviceType: string;
    port: number;
    host: string;
    description?: string;
    owner?: string;
    metricsEndpoint?: string;
    healthCheckEndpoint?: string;
    metricsEnabled?: boolean;
    logsEnabled?: boolean;
    tracingEnabled?: boolean;
  }) => {
    const response = await api.post('/api/services', data);
    return response.data;
  },

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

  delete: async (id: number) => {
    const response = await api.delete(`/api/services/${id}`);
    return response.data;
  },

  refreshConfigs: async () => {
    const response = await api.post('/api/services/refresh-configs');
    return response.data;
  },
};

export const alertApi = {
  getActive: async () => {
    const response = await api.get('/api/alerts');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/alerts/history');
    return response.data;
  },
};

export const statsApi = {
  getDashboard: async () => {
    const response = await api.get('/api/stats/dashboard');
    return response.data;
  },
};

export const incidentApi = {
  getAll: async (activeOnly = false) => {
    const response = await api.get(`/api/incidents${activeOnly ? '?activeOnly=true' : ''}`);
    return response.data;
  },
  create: async (data: {
    title: string;
    description?: string;
    severity?: string;
    serviceName: string;
    assignee?: string;
  }) => {
    const response = await api.post('/api/incidents', data);
    return response.data;
  },
  update: async (id: number, data: { status?: string; assignee?: string; severity?: string; title?: string; description?: string }) => {
    const response = await api.patch(`/api/incidents/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/incidents/${id}`);
  },
};

export const activityApi = {
  getRecent: async (limit = 50) => {
    const response = await api.get(`/api/activities?limit=${limit}`);
    return response.data;
  },
};

export default api;
