import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Check if running inside mobile capacitor wrapper
    const isCapacitor =
      window.location.protocol === 'capacitor:' ||
      (typeof window.Capacitor !== 'undefined' && window.Capacitor?.isNativePlatform?.());
    if (isCapacitor) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
    }
    // In web browser: use same-origin /api (proxied seamlessly by Next.js to backend port 5000)
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
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
