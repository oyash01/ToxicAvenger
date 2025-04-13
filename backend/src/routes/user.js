const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validators');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/profile', userController.deleteProfile);

// Comments routes
router.get('/comments', userController.getUserComments);
router.post('/comments', validate, userController.createComment);
router.put('/comments/:id', validate, userController.updateComment);
router.delete('/comments/:id', userController.deleteComment);

// Settings routes
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

// Statistics routes
router.get('/statistics', userController.getStatistics);
router.get('/activity', userController.getActivityLog);

// Notification preferences
router.get('/notifications', userController.getNotificationPreferences);
router.put('/notifications', userController.updateNotificationPreferences);

// Data export
router.get('/export', userController.exportUserData);

// Social accounts
router.post('/social/link', userController.linkSocialAccount);
router.delete('/social/unlink/:provider', userController.unlinkSocialAccount);
router.get('/social/accounts', userController.getSocialAccounts);

module.exports = router;