const User = require('../models/User');
const Comment = require('../models/Comment');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { generateToken } = require('../utils/helpers');

const userController = {
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .select('-password -refreshToken')
        .populate('settings');
      
      res.json(user);
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw new AppError('Error fetching user profile', 500);
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const allowedUpdates = ['username', 'email', 'firstName', 'lastName', 'avatar'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -refreshToken');

      res.json(user);
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw new AppError('Error updating user profile', 500);
    }
  },

  // Delete user profile
  async deleteProfile(req, res) {
    try {
      await Comment.deleteMany({ user: req.user.id });
      await User.findByIdAndDelete(req.user.id);
      
      res.json({ message: 'User account deleted successfully' });
    } catch (error) {
      logger.error('Error deleting user profile:', error);
      throw new AppError('Error deleting user profile', 500);
    }
  },

  // Get user comments
  async getUserComments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const query = { user: req.user.id };
      if (status) query.status = status;

      const comments = await Comment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username email');

      const total = await Comment.countDocuments(query);

      res.json({
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching user comments:', error);
      throw new AppError('Error fetching user comments', 500);
    }
  },

  // Create comment
  async createComment(req, res) {
    try {
      const comment = new Comment({
        ...req.body,
        user: req.user.id
      });

      await comment.save();
      
      res.status(201).json(comment);
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw new AppError('Error creating comment', 500);
    }
  },

  // Update comment
  async updateComment(req, res) {
    try {
      const comment = await Comment.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!comment) {
        throw new AppError('Comment not found or unauthorized', 404);
      }

      res.json(comment);
    } catch (error) {
      logger.error('Error updating comment:', error);
      throw new AppError('Error updating comment', 500);
    }
  },

  // Delete comment
  async deleteComment(req, res) {
    try {
      const comment = await Comment.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

      if (!comment) {
        throw new AppError('Comment not found or unauthorized', 404);
      }

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      logger.error('Error deleting comment:', error);
      throw new AppError('Error deleting comment', 500);
    }
  },

  // Get user statistics
  async getStatistics(req, res) {
    try {
      const stats = await Comment.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json(stats);
    } catch (error) {
      logger.error('Error fetching user statistics:', error);
      throw new AppError('Error fetching user statistics', 500);
    }
  },

  // Get user activity log
  async getActivityLog(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const logs = await Log.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Log.countDocuments({ user: req.user.id });

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching activity log:', error);
      throw new AppError('Error fetching activity log', 500);
    }
  },

  // Export user data
  async exportUserData(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password -refreshToken');
      const comments = await Comment.find({ user: req.user.id });
      
      const userData = {
        profile: user,
        comments,
        exportDate: new Date()
      };

      res.json(userData);
    } catch (error) {
      logger.error('Error exporting user data:', error);
      throw new AppError('Error exporting user data', 500);
    }
  }
};

module.exports = userController;