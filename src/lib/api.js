import axios from 'axios';

// Dev: vite proxy forwards /api → backend. Prod: set VITE_API_URL to backend origin.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cafe_member_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cafe_member_token');
      localStorage.removeItem('cafe_member_user');
    }
    return Promise.reject(err);
  }
);

export default api;
