import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { getStoredToken, setStoredToken, removeStoredToken, clearAuthStorage } from '../utils/storage';
import LoadingScreen from '../components/common/LoadingScreen';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/verify-token');
      setUser(response.data.user);
    } catch (error) {
      removeStoredToken();
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      setStoredToken(token);
      setUser(userData);
      setError(null);
      
      api.setAuthToken(token);
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser } = response.data;
      
      setStoredToken(token);
      setUser(newUser);
      setError(null);
      
      api.setAuthToken(token);
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthStorage();
      setUser(null);
      api.removeAuthToken();
      navigate('/login');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return { success: false, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      await api.post('/auth/reset-password', { email });
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset failed');
      return { success: false, error };
    }
  };

  const confirmPasswordReset = async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, password: newPassword });
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset confirmation failed');
      return { success: false, error };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await api.post('/auth/verify-email', { token });
      // Update user verification status
      if (user) {
        setUser({ ...user, isVerified: true });
      }
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Email verification failed');
      return { success: false, error };
    }
  };

  const resendVerification = async () => {
    try {
      await api.post('/auth/resend-verification');
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend verification email');
      return { success: false, error };
    }
  };

  const verifyResetToken = async (token) => {
    try {
      await api.post('/auth/verify-token', { token });
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid or expired token');
      return { success: false, error };
    }
  };

  const loginWithGoogle = async (token) => {
    try {
      const response = await api.post('/auth/oauth/google', { token });
      const { token: authToken, user: userData } = response.data;
      
      setStoredToken(authToken);
      setUser(userData);
      setError(null);
      
      api.setAuthToken(authToken);
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Google login failed');
      return { success: false, error };
    }
  };

  const loginWithGitHub = async (code) => {
    try {
      const response = await api.post('/auth/oauth/github', { code });
      const { token: authToken, user: userData } = response.data;
      
      setStoredToken(authToken);
      setUser(userData);
      setError(null);
      
      api.setAuthToken(authToken);
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'GitHub login failed');
      return { success: false, error };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    confirmPasswordReset,
    verifyEmail,
    resendVerification,
    verifyResetToken,
    loginWithGoogle,
    loginWithGitHub,
    setError,
    isAuthenticated,
    isAdmin
  };

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};