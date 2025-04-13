import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  CheckCircleOutline as CheckCircleIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';

const ForgotPassword = () => {
  const theme = useTheme();
  const { resetPassword } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setSuccess(true);
      showSnackbar('Password reset email sent successfully', 'success');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email');
      showSnackbar('Failed to send password reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: theme.palette.background.default
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 480,
          position: 'relative'
        }}
      >
        {/* Back Button */}
        <IconButton
          component={RouterLink}
          to="/login"
          sx={{
            position: 'absolute',
            top: theme.spacing(2),
            left: theme.spacing(2)
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Logo and Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: 40,
              marginBottom: theme.spacing(2)
            }}
          />
          <Typography variant="h4" gutterBottom>
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Enter your email address and we'll send you instructions to reset your password
          </Typography>
        </Box>

        {success ? (
          // Success State
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon
              sx={{
                fontSize: 64,
                color: 'success.main',
                mb: 2
              }}
            />
            <Typography variant="h6" gutterBottom>
              Check Your Email
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              paragraph
              sx={{ mb: 4 }}
            >
              We've sent password reset instructions to:
              <br />
              <strong>{email}</strong>
            </Typography>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{ mr: 2 }}
            >
              Back to Login
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              Resend Email
            </Button>
          </Box>
        ) : (
          // Form State
          <>
            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <EmailIcon
                      sx={{
                        mr: 1,
                        color: theme.palette.text.secondary
                      }}
                    />
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>

              <Box
                sx={{
                  mt: 3,
                  textAlign: 'center',
                  borderTop: `1px solid ${theme.palette.divider}`,
                  pt: 3
                }}
              >
                <Typography variant="body2">
                  Remember your password?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    color="primary"
                    underline="hover"
                  >
                    Back to login
                  </Link>
                </Typography>
              </Box>
            </form>
          </>
        )}

        {/* Help Text */}
        <Typography
          variant="caption"
          color="textSecondary"
          align="center"
          sx={{ mt: 4, display: 'block' }}
        >
          If you're having trouble, please contact{' '}
          <Link href="mailto:support@example.com" underline="hover">
            support@example.com
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;