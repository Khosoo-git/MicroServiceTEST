import axios from 'axios';

// Use relative path - nginx will proxy to backend
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (credentials) => api.post('/auth/register', credentials),
};

// Server APIs
export const serverAPI = {
  getAll: () => api.get('/servers'),
  getById: (id) => api.get(`/servers/${id}`),
  add: (server) => api.post('/servers', server),
  delete: (id) => api.delete(`/servers/${id}`),
};

// Observability APIs
export const observabilityAPI = {
  // Loki
  getLogs: (params) => api.get('/observability/loki/logs', { params }),
  getLokiLabels: () => api.get('/observability/loki/labels'),
  getLokiLabelValues: (label) => api.get(`/observability/loki/label/${label}/values`),
  
  // Prometheus
  getMetrics: (query) => api.get('/observability/prometheus/query', { params: { query } }),
  getMetricsRange: (params) => api.get('/observability/prometheus/query_range', { params }),
  getPrometheusMetrics: () => api.get('/observability/prometheus/metrics'),
  getPrometheusTargets: () => api.get('/observability/prometheus/targets'),
  
  // Tempo
  searchTraces: (params) => api.get('/observability/tempo/search', { params }),
  getTraceById: (traceId) => api.get(`/observability/tempo/trace/${traceId}`),
  getTempoTags: () => api.get('/observability/tempo/tags'),
  getTempoTagValues: (tag) => api.get(`/observability/tempo/tag/${tag}/values`),
};

export default api;
