import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userJson = localStorage.getItem('easyshop_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, clear user
      // localStorage.removeItem('easyshop_user');
    }
    return Promise.reject(error);
  }
);

export default api;
