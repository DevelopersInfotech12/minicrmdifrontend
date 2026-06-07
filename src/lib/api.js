import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const getToken = () => typeof window === 'undefined' ? null : localStorage.getItem('crm_token');

export const saveToken = (token) => {
  if (typeof window === 'undefined' || !token) return;
  localStorage.setItem('crm_token', token);
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
};

export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('crm_token');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=none';
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // AUTH DISABLED — comment out redirect below
    // if (error.response?.status === 401) {
    //   clearToken();
    //   if (typeof window !== 'undefined' && !window.location.pathname.includes('/login'))
    //     window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    const token = res.data?.data?.token;
    if (token) saveToken(token);
    return res;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    const token = res.data?.data?.token;
    if (token) saveToken(token);
    return res;
  },
  logout: async () => { try { await api.post('/auth/logout', {}); } catch { } clearToken(); },
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const clientsApi = {
  getAll: (params = {}) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  getProfile: (id) => api.get(`/clients/${id}/profile`), // ← ADDED
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  toggleStatus: (id) => api.patch(`/clients/${id}/toggle-status`),
};

export const projectsApi = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getRecurringDue: () => api.get('/projects/recurring/due'),
  getRecurringByClient: () => api.get('/projects/recurring/clients'),
  getClientRecurring:   () => api.get('/projects/recurring/clients'),
};

export const leadsApi = {
  getAll: (params = {}) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  getPipeline: () => api.get('/leads/pipeline'),
  convert: (id, data) => api.post(`/leads/${id}/convert`, data),
  addActivity: (id, data) => api.post(`/leads/${id}/activity`, data),
};

export const notesApi = {
  getAll: (params = {}) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  getByProject: (projectId) => api.get(`/notes/project/${projectId}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const paymentsApi = {
  getAll: (params = {}) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const milestonesApi = {
  getByProject: (projectId) => api.get(`/milestones/project/${projectId}`),
  create: (data) => api.post('/milestones', data),
  update: (id, data) => api.put(`/milestones/${id}`, data),
  delete: (id) => api.delete(`/milestones/${id}`),
  addPayment: (id, data) => api.post(`/milestones/${id}/payment`, data),
};

export const invoicesApi = {
  getByProject: (projectId) => api.get(`/invoices/project/${projectId}`),
  upload: (formData) => api.post('/invoices/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id) => api.delete(`/invoices/${id}`),
};

export const tasksApi = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getOverdue: () => api.get('/tasks/overdue'),
};

export const meetingsApi = {
  getAll: (params = {}) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  getToday: () => api.get('/meetings/today'),
  getUpcoming: () => api.get('/meetings/upcoming'),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  updateStatus: (id, status) => api.patch(`/meetings/${id}/status`, { status }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

export const employeesApi = {
  getAll: (params = {}) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  toggleStatus: (id) => api.patch(`/employees/${id}/toggle`),
};

export const payrollApi = {
  getAll:       (params = {}) => api.get('/payroll', { params }),
  getStats:     (year)        => api.get('/payroll/stats', { params: { year } }),
  getById:      (id)          => api.get(`/payroll/${id}`),
  create:       (data)        => api.post('/payroll', data),
  bulkGenerate: (data)        => api.post('/payroll/bulk', data),
  update:       (id, data)    => api.put(`/payroll/${id}`, data),
  markAsPaid:   (id, data)    => api.patch(`/payroll/${id}/pay`, data),
  delete:       (id)          => api.delete(`/payroll/${id}`),
};

export const activityApi = {
  getByProject: (projectId, params = {}) => api.get(`/activity/project/${projectId}`, { params }),
  getByClient:  (clientId,  params = {}) => api.get(`/activity/client/${clientId}`,   { params }),
  getByPage:    (pageName,  params = {}) => api.get(`/activity/page/${pageName}`,      { params }),
  getAll:       (params = {})            => api.get('/activity/all',                   { params }),
};

export default api;