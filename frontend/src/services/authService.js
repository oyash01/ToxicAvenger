import axios from 'axios';
import { 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken, 
  getStoredUser, 
  setStoredUser, 
  removeStoredUser,
  clearAuthStorage 
} from '../utils/storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/auth`
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email, password) {
    try {
      const response = await this.api.post('/login', { email, password });
      setStoredToken(response.data.token);
      setStoredUser(response.data.user);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(username, email, password) {
    try {
      const response = await this.api.post('/register', {
        username,
        email,
        password
      });
      setStoredToken(response.data.token);
      setStoredUser(response.data.user);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get('/me');
      setStoredUser(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.post('/update-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    clearAuthStorage();
    // Redirect to login page
    window.location.href = '/login';
  }

  getToken() {
    return getStoredToken();
  }

  setToken(token) {
    setStoredToken(token);
  }

  getUser() {
    return getStoredUser();
  }

  setUser(user) {
    setStoredUser(user);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'An error occurred');
    }
    if (error.request) {
      return new Error('No response from server');
    }
    return new Error('Request failed');
  }
}

export default new AuthService();