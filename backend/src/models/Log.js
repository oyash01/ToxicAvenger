const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  actionType: {
    type: String,
    enum: [
      'COMMENT_CHECK',
      'USER_LOGIN',
      'API_KEY_FAILOVER',
      'COMMENT_DELETE',
      'USER_CREATE',
      'SYSTEM',
      'DATABASE',
      'AUTH'
    ],
    required: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
});

// Index for efficient querying
logSchema.index({ timestamp: -1, actionType: 1 });

module.exports = mongoose.model('Log', logSchema);