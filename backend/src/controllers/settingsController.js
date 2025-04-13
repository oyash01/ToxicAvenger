import Settings from '../models/Settings.js';
import nodemailer from 'nodemailer';

// Get current settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Error retrieving settings' });
  }
};

// Update email verification settings
export const updateEmailVerificationSettings = async (req, res) => {
  try {
    const { enabled, smtpConfig, fromEmail } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.emailVerification = {
      enabled,
      smtpConfig,
      fromEmail
    };

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};

// Test SMTP configuration
export const testSmtpConfig = async (req, res) => {
  try {
    const { smtpConfig, fromEmail } = req.body;
    
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      }
    });

    await transporter.verify();
    
    const testEmail = {
      from: fromEmail,
      to: fromEmail,
      subject: 'SMTP Configuration Test',
      text: 'This is a test email to verify your SMTP configuration is working correctly.'
    };

    await transporter.sendMail(testEmail);
    res.json({ message: 'SMTP configuration test successful' });
  } catch (error) {
    console.error('Error testing SMTP configuration:', error);
    res.status(500).json({ message: 'Error testing SMTP configuration', error: error.message });
  }
}; 