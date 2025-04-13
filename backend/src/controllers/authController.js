const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // Create new user
    user = await User.create({
      username,
      email,
      password
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    // TODO: Implement email sending functionality
    // This would typically integrate with an email service
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email',
      html: `Please click <a href="${verificationUrl}">here</a> to verify your email.`
    });

    // Generate auth token
    const token = generateToken(user);

    logger.info(`New user registered: ${username}`, 'USER_CREATE', user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    logger.error(`Registration error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error in registration'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account is disabled'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    logger.info(`User logged in: ${user.username}`, 'USER_LOGIN', user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error in login'
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error getting user data'
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.username}`, 'USER_UPDATE', user._id);

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    logger.error(`Update password error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error updating password'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send password reset email
    // This would typically integrate with an email service

    logger.info(`Password reset requested for user: ${user.username}`, 'USER_PASSWORD_RESET', user._id);

    res.json({
      message: 'Password reset instructions sent to email'
    });

  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error processing password reset request'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        message: 'Token and password are required'
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for user: ${user.username}`, 'USER_PASSWORD_RESET', user._id);

    res.json({
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    logger.error(`Reset password error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error resetting password'
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const token = generateToken(user);

    res.json({ token });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Invalid or expired refresh token'
      });
    }
    
    logger.error(`Refresh token error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error refreshing token'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // In a real implementation, you might want to invalidate the token
    // This could involve adding it to a blacklist or clearing client-side storage
    
    logger.info(`User logged out: ${req.user.username}`, 'USER_LOGOUT', req.user._id);
    
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error during logout'
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    // If this middleware is reached, the token is valid
    // and req.user is already set
    res.json({
      valid: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified
      }
    });
  } catch (error) {
    logger.error(`Verify token error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error verifying token'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.username}`, 'USER_UPDATE', user._id);

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error(`Change password error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error changing password'
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        message: 'Verification token is required'
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and valid expiry
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.username}`, 'USER_VERIFY', user._id);

    res.json({
      message: 'Email verified successfully'
    });

  } catch (error) {
    logger.error(`Email verification error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error verifying email'
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    // User is already authenticated at this point
    const user = await User.findById(req.user.id);
    
    if (user.isVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }
    
    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email',
      html: `Please click <a href="${verificationUrl}">here</a> to verify your email.`
    });
    
    logger.info(`Verification email resent to user: ${user.username}`, 'USER_VERIFY', user._id);
    
    res.json({
      message: 'Verification email has been sent'
    });
    
  } catch (error) {
    logger.error(`Resend verification error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error sending verification email'
    });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // TODO: Verify Google token and extract user info
    // This would typically use the Google OAuth API
    
    // For now, we'll simulate with a placeholder
    const googleUser = {
      email: 'google-user@example.com',
      name: 'Google User'
    };
    
    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      // Create new user if not exists
      user = await User.create({
        username: googleUser.name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        email: googleUser.email,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        isVerified: true // OAuth users are considered verified
      });
    }
    
    // Generate token
    const authToken = generateToken(user);
    
    logger.info(`User authenticated via Google: ${user.username}`, 'USER_OAUTH_LOGIN', user._id);
    
    res.json({
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    logger.error(`Google auth error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error authenticating with Google'
    });
  }
};

exports.githubAuth = async (req, res) => {
  try {
    const { code } = req.body;
    
    // TODO: Exchange code for GitHub token and get user info
    // This would typically use the GitHub OAuth API
    
    // For now, we'll simulate with a placeholder
    const githubUser = {
      email: 'github-user@example.com',
      login: 'github-user'
    };
    
    // Check if user exists
    let user = await User.findOne({ email: githubUser.email });
    
    if (!user) {
      // Create new user if not exists
      user = await User.create({
        username: githubUser.login + Math.floor(Math.random() * 1000),
        email: githubUser.email,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        isVerified: true // OAuth users are considered verified
      });
    }
    
    // Generate token
    const authToken = generateToken(user);
    
    logger.info(`User authenticated via GitHub: ${user.username}`, 'USER_OAUTH_LOGIN', user._id);
    
    res.json({
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    logger.error(`GitHub auth error: ${error.message}`, 'AUTH');
    res.status(500).json({
      message: 'Error authenticating with GitHub'
    });
  }
};