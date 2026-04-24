import axios from 'axios';

const api = axios.create({
  // In production (Vercel), VITE_API_URL must be set to your Render backend URL
  // e.g. https://sres-36ja.onrender.com
  // In local dev, Vite proxy handles /api so we fall back to '/api'
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sres_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/admin/login');
      if (!isAuthRoute) {
        localStorage.removeItem('sres_token');
        localStorage.removeItem('sres_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
