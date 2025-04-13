/**
 * Utility functions for handling token storage and retrieval
 */

// Key for storing the authentication token in localStorage
const TOKEN_KEY = 'toxiguard_token';

// Key for storing the refresh token in localStorage
const REFRESH_TOKEN_KEY = 'toxiguard_refresh_token';

// Key for storing user data in localStorage
const USER_KEY = 'toxiguard_user';

/**
 * Store authentication token in localStorage
 * @param {string} token - JWT token
 */
export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Retrieve authentication token from localStorage
 * @returns {string|null} - JWT token or null if not found
 */
export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token from localStorage
 */
export const removeStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Store refresh token in localStorage
 * @param {string} token - Refresh token
 */
export const setStoredRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

/**
 * Retrieve refresh token from localStorage
 * @returns {string|null} - Refresh token or null if not found
 */
export const getStoredRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Remove refresh token from localStorage
 */
export const removeStoredRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Store user data in localStorage
 * @param {Object} user - User data object
 */
export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Retrieve user data from localStorage
 * @returns {Object|null} - User data object or null if not found
 */
export const getStoredUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Remove user data from localStorage
 */
export const removeStoredUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthStorage = () => {
  removeStoredToken();
  removeStoredRefreshToken();
  removeStoredUser();
};