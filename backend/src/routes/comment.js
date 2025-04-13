const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');
const { validateComment } = require('../middleware/validators');

const router = express.Router();

// Public routes
router.get('/public', commentController.getPublicComments);

// Protected routes
router.use(authenticateToken);

// CRUD operations
router.post('/', validateComment, commentController.createComment);
router.get('/', commentController.getComments);
router.get('/:id', commentController.getComment);
router.put('/:id', validateComment, commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

// Moderation
router.post('/:id/approve', commentController.approveComment);
router.post('/:id/reject', commentController.rejectComment);
router.post('/:id/flag', commentController.flagComment);
router.post('/:id/unflag', commentController.unflagComment);

// Analysis
router.post('/analyze', commentController.analyzeComment);
router.get('/analysis/:id', commentController.getCommentAnalysis);

// Bulk operations
router.post('/bulk/analyze', commentController.bulkAnalyzeComments);
router.post('/bulk/moderate', commentController.bulkModerateComments);

// Statistics
router.get('/stats', commentController.getCommentStats);
router.get('/trends', commentController.getCommentTrends);

// Reporting
router.post('/:id/report', commentController.reportComment);
router.get('/reports', commentController.getReportedComments);

module.exports = router;