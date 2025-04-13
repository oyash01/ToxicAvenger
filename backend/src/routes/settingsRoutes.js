import express from 'express';
import { 
  getSettings, 
  updateEmailVerificationSettings, 
  testSmtpConfig 
} from '../controllers/settingsController.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get current settings
router.get('/', getSettings);

// Update email verification settings (admin only)
router.put('/email-verification', isAdmin, updateEmailVerificationSettings);

// Test SMTP configuration (admin only)
router.post('/test-smtp', isAdmin, testSmtpConfig);

export default router; 