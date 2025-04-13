import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class CommentService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/comments`
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async analyzeComment(commentData) {
    try {
      const response = await this.api.post('/analyze', commentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getComments(filters = {}) {
    try {
      const response = await this.api.get('/', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCommentStatus(commentId, status, override = false) {
    try {
      const response = await this.api.patch(`/${commentId}`, { status, override });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      return new Error(error.response.data.message || 'An error occurred');
    }
    if (error.request) {
      // No response received
      return new Error('No response from server');
    }
    // Something else went wrong
    return new Error('Request failed');
  }
}

export default new CommentService();