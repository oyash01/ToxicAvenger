const express = require('express');
const { validate } = require('../middleware/validators');
const authController = require('../controllers/authController');
const { validateLogin, validateRegistration } = require('../middleware/validators');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, validate, authController.register);
router.post('/login', validateLogin, validate, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(authenticateToken);
router.post('/logout', authController.logout);
router.get('/verify-token', authController.verifyToken);
router.post('/change-password', authController.changePassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// OAuth routes
router.post('/oauth/google', authController.googleAuth);
router.post('/oauth/github', authController.githubAuth);

module.exports = router;