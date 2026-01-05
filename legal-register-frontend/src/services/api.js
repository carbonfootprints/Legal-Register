import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    console.log('Request data:', config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error response:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    } else {
      // Error in request configuration
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
