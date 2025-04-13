const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateApiKey, validateMongoUrl } = require('../middleware/validators');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/recent-activity', adminController.getRecentActivity);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);

// API key management
router.get('/api-keys', adminController.getApiKeys);
router.post('/api-keys', validateApiKey, adminController.createApiKey);
router.put('/api-keys/:id', validateApiKey, adminController.updateApiKey);
router.delete('/api-keys/:id', adminController.deleteApiKey);
router.post('/api-keys/:id/rotate', adminController.rotateApiKey);

// MongoDB URL management
router.get('/mongo-urls', adminController.getMongoUrls);
router.post('/mongo-urls', validateMongoUrl, adminController.createMongoUrl);
router.put('/mongo-urls/:id', validateMongoUrl, adminController.updateMongoUrl);
router.delete('/mongo-urls/:id', adminController.deleteMongoUrl);
router.post('/mongo-urls/:id/test', adminController.testMongoUrl);

// System logs
router.get('/logs', adminController.getLogs);
router.get('/logs/export', adminController.exportLogs);
router.delete('/logs', adminController.clearLogs);

// System settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// Comment moderation
router.get('/comments', adminController.getCommentsForModeration);
router.put('/comments/:id/moderate', adminController.moderateComment);
router.post('/comments/bulk-moderate', adminController.bulkModerateComments);

// Analytics
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/comments', adminController.getCommentAnalytics);
router.get('/analytics/moderation', adminController.getModerationAnalytics);
router.get('/analytics/performance', adminController.getPerformanceMetrics);

// Backup and restore
router.post('/backup', adminController.createBackup);
router.get('/backups', adminController.getBackups);
router.post('/restore/:backupId', adminController.restoreFromBackup);

module.exports = router;