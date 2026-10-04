import axios from 'axios';

// Accepts either VITE_API_BASE_URL or VITE_API_URL
const rawUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

// Automatically removes any trailing slash or /api to prevent duplicates
const cleanBaseUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

const API = axios.create({
  baseURL: `${cleanBaseUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer Auth Token from localStorage if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;