import axios from 'axios';

const getBaseUrl = () => {
  const defaultUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(defaultUrl);
      if (window.location.hostname && window.location.hostname !== 'localhost') {
        if (url.hostname === 'localhost') {
          url.hostname = window.location.hostname;
          return url.toString().replace(/\/$/, '');
        }
      }
    } catch (e) {}
  }
  return defaultUrl;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token from localStorage to every outbound request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('veyra_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear stored session if unauthorized
        const isAuthRoute =
          window.location.pathname === '/login' ||
          window.location.pathname === '/signup' ||
          window.location.pathname === '/';
        if (!isAuthRoute) {
          localStorage.removeItem('veyra_token');
          localStorage.removeItem('veyra_user');
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
