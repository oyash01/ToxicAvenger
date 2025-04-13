import { api } from '../utils/api';

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent activity logs
   */
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get(`/admin/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system-health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const response = await api.get('/admin/performance');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get users with pagination and filters
   */
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      
      const response = await api.get(`/admin/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a user
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get comments with pagination and filters
   */
  async getComments(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      
      const response = await api.get(`/admin/comments?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId, commentData) {
    try {
      const response = await api.put(`/admin/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/admin/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get API keys
   */
  async getApiKeys() {
    try {
      const response = await api.get('/admin/api-keys');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new API key
   */
  async createApiKey(keyData) {
    try {
      const response = await api.post('/admin/api-keys', keyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(keyId) {
    try {
      const response = await api.delete(`/admin/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get MongoDB URLs
   */
  async getMongoUrls() {
    try {
      const response = await api.get('/admin/mongo-urls');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a new MongoDB URL
   */
  async addMongoUrl(urlData) {
    try {
      const response = await api.post('/admin/mongo-urls', urlData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a MongoDB URL
   */
  async deleteMongoUrl(urlId) {
    try {
      const response = await api.delete(`/admin/mongo-urls/${urlId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic method to delete an item by type and ID
   */
  async deleteItem(type, id) {
    switch (type) {
      case 'users':
        return this.deleteUser(id);
      case 'comments':
        return this.deleteComment(id);
      case 'apiKeys':
        return this.deleteApiKey(id);
      case 'mongoUrls':
        return this.deleteMongoUrl(id);
      default:
        throw new Error('Invalid item type');
    }
  }

  /**
   * Handle API errors
   */
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

export default new AdminService();