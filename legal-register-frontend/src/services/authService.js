import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      // Token is set as httpOnly cookie by server; store only non-sensitive profile data
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      // Token is set as httpOnly cookie by server; store only non-sensitive profile data
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Logout user — clear server cookie then local state
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // ignore network errors on logout
    }
    localStorage.clear();
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Get user from local storage
  getUserFromStorage: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Token is in httpOnly cookie — not accessible from JS
  getToken: () => {
    return null;
  },

  // Check if user is authenticated (presence of stored user profile)
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Forgot password - request reset email
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
};

export default authService;
