import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  emailVerification: {
    enabled: {
      type: Boolean,
      default: false
    },
    smtpConfig: {
      host: String,
      port: Number,
      secure: Boolean,
      auth: {
        user: String,
        pass: String
      }
    },
    fromEmail: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings; 