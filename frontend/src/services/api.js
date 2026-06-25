import axios from 'axios';

let apiURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
if (apiURL && !apiURL.startsWith('http://') && !apiURL.startsWith('https://')) {
  if (!apiURL.includes('.')) {
    apiURL = `https://${apiURL}.onrender.com/api`;
  } else {
    apiURL = `https://${apiURL}/api`;
  }
}

const api = axios.create({
  baseURL: apiURL,
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request JWT Token:', token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear(); // keep mirror in sync
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
