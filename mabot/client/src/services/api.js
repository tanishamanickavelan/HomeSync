import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mabot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mabot_token');
      localStorage.removeItem('mabot_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// ── Family ───────────────────────────────────────────────────────────────────
export const familyAPI = {
  get: () => api.get('/family'),
  update: (data) => api.put('/family', data),
  join: (code) => api.post('/family/join', { invite_code: code }),
  removeMember: (userId) => api.delete(`/family/members/${userId}`)
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard')
};

// ── Tasks ────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`)
};

// ── Groceries ────────────────────────────────────────────────────────────────
export const groceriesAPI = {
  getAll: (params) => api.get('/groceries', { params }),
  getStats: () => api.get('/groceries/stats'),
  create: (data) => api.post('/groceries', data),
  update: (id, data) => api.put(`/groceries/${id}`, data),
  delete: (id) => api.delete(`/groceries/${id}`),
  markAllPurchased: () => api.put('/groceries/mark-all-purchased')
};

// ── Bills ────────────────────────────────────────────────────────────────────
export const billsAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getStats: () => api.get('/bills/stats'),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`)
};

// ── Services ─────────────────────────────────────────────────────────────────
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export default api;
