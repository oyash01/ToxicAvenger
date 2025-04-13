const mongoose = require('mongoose');
const crypto = require('crypto');

const mongoUrlSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true
  },
  urlHash: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastConnectionStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  lastChecked: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Encrypt URL before saving
mongoUrlSchema.pre('save', function(next) {
  if (this.isModified('urlHash')) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
    let encrypted = cipher.update(this.urlHash, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.urlHash = encrypted;
  }
  next();
});

module.exports = mongoose.model('MongoUrl', mongoUrlSchema);