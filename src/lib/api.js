import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // send cookies with every request
});

export const clientsApi = {
  getAll:       (params = {}) => api.get('/clients', { params }),
  getById:      (id) => api.get(`/clients/${id}`),
  getProfile:   (id) => api.get(`/clients/${id}/profile`),
  create:       (data) => api.post('/clients', data),
  update:       (id, data) => api.put(`/clients/${id}`, data),
  delete:       (id) => api.delete(`/clients/${id}`),
  toggleStatus: (id) => api.patch(`/clients/${id}/toggle-status`),
};

export const projectsApi = {
  getAll:                 (params = {}) => api.get('/projects', { params }),
  getById:                (id) => api.get(`/projects/${id}`),
  getByClient:            (clientId) => api.get(`/projects/client/${clientId}`),
  getMeta:                () => api.get('/projects/meta'),
  getRecurringDue:        () => api.get('/projects/recurring/due'),
  getClientRecurring:     () => api.get('/projects/recurring/clients'),
  create:                 (data) => api.post('/projects', data),
  update:                 (id, data) => api.put(`/projects/${id}`, data),
  delete:                 (id) => api.delete(`/projects/${id}`),
};

export const notesApi = {
  getByProject: (projectId) => api.get(`/notes/project/${projectId}`),
  getById:      (id) => api.get(`/notes/${id}`),
  create:       (data) => api.post('/notes', data),
  update:       (id, data) => api.put(`/notes/${id}`, data),
  delete:       (id) => api.delete(`/notes/${id}`),
};

export const paymentsApi = {
  getAll:       (params = {}) => api.get('/payments', { params }),
  getById:      (id) => api.get(`/payments/${id}`),
  getByProject: (projectId) => api.get(`/payments/project/${projectId}`),
  create:       (data) => api.post('/payments', data),
  update:       (id, data) => api.put(`/payments/${id}`, data),
  delete:       (id) => api.delete(`/payments/${id}`),
};

export const milestoneApi = {
  getByProject: (projectId) => api.get(`/milestones/project/${projectId}`),
  getAlerts:    () => api.get('/milestones/alerts'),
  create:       (data) => api.post('/milestones', data),
  update:       (id, data) => api.put(`/milestones/${id}`, data),
  delete:       (id) => api.delete(`/milestones/${id}`),
  markPaid:     (id) => api.patch(`/milestones/${id}/mark-paid`),
};

export const invoiceApi = {
  getByProject: (projectId) => api.get(`/invoices/project/${projectId}`),
  upload:       (formData) => api.post('/invoices/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  download:     (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
  delete:       (id) => api.delete(`/invoices/${id}`),
};

export const leadsApi = {
  getAll:       (params = {}) => api.get('/leads', { params }),
  getPipeline:  () => api.get('/leads/pipeline'),
  getMeta:      () => api.get('/leads/meta'),
  getById:      (id) => api.get(`/leads/${id}`),
  create:       (data) => api.post('/leads', data),
  update:       (id, data) => api.put(`/leads/${id}`, data),
  delete:       (id) => api.delete(`/leads/${id}`),
  addActivity:  (id, note) => api.post(`/leads/${id}/activity`, { note }),
  convert:      (id) => api.post(`/leads/${id}/convert`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

export default api;

export const tasksApi = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  getOverdue:   () => api.get('/tasks/overdue'),
  create:       (data) => api.post('/tasks', data),
  update:       (id, data) => api.put(`/tasks/${id}`, data),
  toggle:       (id) => api.patch(`/tasks/${id}/toggle`),
  delete:       (id) => api.delete(`/tasks/${id}`),
};

export const authApi = {
  login:    (data) => api.post('/auth/login', data, { withCredentials: true }),
  register: (data) => api.post('/auth/register', data, { withCredentials: true }),
  logout:   () => api.post('/auth/logout', {}, { withCredentials: true }),
  me:       () => api.get('/auth/me', { withCredentials: true }),
  googleLogin: () => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1','')}/api/v1/auth/google`; },
};
