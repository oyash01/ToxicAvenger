import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import authService from './authService';

const api = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const userService = {
  // Get current user's profile
  getCurrentUser: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Get user's comment history
  getCommentHistory: async (params) => {
    const response = await api.get('/comments', { params });
    return response.data;
  },

  // Get user's activity log
  getActivityLog: async (params) => {
    const response = await api.get('/activity', { params });
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },

  // Get user statistics
  getStatistics: async (timeframe = 'week') => {
    const response = await api.get(`/statistics?timeframe=${timeframe}`);
    return response.data;
  },

  // Request email verification
  requestEmailVerification: async () => {
    const response = await api.post('/request-verification');
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token) => {
    const response = await api.post('/verify-email', { token });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/request-password-reset', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await api.delete('/account', {
      data: { password }
    });
    return response.data;
  },

  // Export user data
  exportUserData: async () => {
    const response = await api.get('/export-data', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    const response = await api.put('/notifications', preferences);
    return response.data;
  },

  // Link social account
  linkSocialAccount: async (provider, code) => {
    const response = await api.post('/link-social', {
      provider,
      code
    });
    return response.data;
  },

  // Unlink social account
  unlinkSocialAccount: async (provider) => {
    const response = await api.delete(`/unlink-social/${provider}`);
    return response.data;
  }
};

export default userService;