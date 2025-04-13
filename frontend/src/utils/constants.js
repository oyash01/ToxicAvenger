export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
};

export const ACTION_TYPES = {
  COMMENT_CHECK: 'COMMENT_CHECK',
  USER_LOGIN: 'USER_LOGIN',
  API_KEY_FAILOVER: 'API_KEY_FAILOVER',
  COMMENT_DELETE: 'COMMENT_DELETE',
  USER_CREATE: 'USER_CREATE',
  SYSTEM: 'SYSTEM',
  DATABASE: 'DATABASE',
  AUTH: 'AUTH',
};

export const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COMMENTS: '/comments',
  PROFILE: '/profile',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    API_KEYS: '/admin/api-keys',
    MONGO_URLS: '/admin/mongo-urls',
    LOGS: '/admin/logs',
  },
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

export const DATE_FORMATS = {
  DISPLAY: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

export const API_TIMEOUT = 30000; // 30 seconds

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'toxiguard_token',
  USER: 'toxiguard_user',
  THEME: 'toxiguard_theme',
  SETTINGS: 'toxiguard_settings',
};

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
};