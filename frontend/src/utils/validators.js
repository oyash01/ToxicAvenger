// Validation utilities for form inputs and data

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  // Alphanumeric, underscore, hyphen, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateComment = (comment) => {
  // Basic comment validation
  return comment && comment.trim().length > 0 && comment.length <= 1000;
};

export const validateApiKey = (apiKey) => {
  // Basic API key validation
  return apiKey && apiKey.trim().length > 0;
};

export const validateMongoUrl = (url) => {
  // Basic MongoDB URL validation
  const mongoUrlRegex = /^mongodb(\+srv)?:\/\//;
  return mongoUrlRegex.test(url);
};

// Form validation helpers
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !value) {
      errors[field] = 'This field is required';
    } else if (value) {
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `Minimum length is ${fieldRules.minLength} characters`;
      }
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `Maximum length is ${fieldRules.maxLength} characters`;
      }
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || 'Invalid format';
      }
    }
  });
  
  return errors;
}; 