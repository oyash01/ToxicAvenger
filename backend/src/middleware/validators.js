const { check, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

exports.validateRegistration = [
  check('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, dashes and underscores'),
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
];

exports.validateLogin = [
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('password')
    .notEmpty()
    .withMessage('Password is required'),
];

exports.validateApiKey = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('API key name is required')
    .isLength({ max: 100 })
    .withMessage('API key name must not exceed 100 characters'),
  check('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

exports.validateMongoUrl = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('MongoDB URL name is required')
    .isLength({ max: 100 })
    .withMessage('MongoDB URL name must not exceed 100 characters'),
  check('url')
    .trim()
    .notEmpty()
    .withMessage('MongoDB URL is required')
    .matches(/^mongodb(\+srv)?:\/\//)
    .withMessage('Invalid MongoDB URL format'),
  check('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

exports.validateComment = [
  check('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 5000 })
    .withMessage('Comment must not exceed 5000 characters'),
  check('source')
    .optional()
    .isIn(['website', 'mobile', 'api'])
    .withMessage('Invalid source'),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(', ');
    throw new AppError(message, 400);
  }
  next();
};