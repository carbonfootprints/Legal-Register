import axios from 'axios';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

logger.log('API Base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    logger.log('Making request to:', config.baseURL + config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    logger.error('Response error:', error);
    if (error.response) {
      // Server responded with error status
      logger.error('Error response:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Unauthorized - clear local state and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      logger.error('No response received:', error.request);
      logger.error('Error code:', error.code);
      logger.error('Error message:', error.message);
    } else {
      // Error in request configuration
      logger.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
