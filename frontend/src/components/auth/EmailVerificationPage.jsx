import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Container
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, updateUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [resendTimeout, setResendTimeout] = useState(0);

  useEffect(() => {
    // Get email from location state or local storage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem('pendingVerificationEmail', emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    }

    // Check for verification token in URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      verifyEmailToken(token);
    } else {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimeout > 0) {
      const timer = setTimeout(() => {
        setResendTimeout(resendTimeout - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimeout]);

  const verifyEmailToken = async (token) => {
    setVerifying(true);
    setError('');

    try {
      await verifyEmail(token);
      setVerified(true);
      updateUser({ isVerified: true });
      showSnackbar('Email verified successfully!', 'success');
      localStorage.removeItem('pendingVerificationEmail');
    } catch (err) {
      setError(err.message || 'Failed to verify email. Please try again.');
      showSnackbar('Email verification failed', 'error');
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setError('');

    try {
      await resendVerification(email);
      showSnackbar('Verification email has been resent', 'success');
      setResendTimeout(60); // Set 60 seconds cooldown
    } catch (err) {
      setError(err.message || 'Failed to resend verification email. Please try again.');
      showSnackbar('Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  if (loading || verifying) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        {verified ? (
          <>
            <CheckCircleIcon
              color="success"
              sx={{ fontSize: 64 }}
            />
            <Typography variant="h5" align="center">
              Email Verified!
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              Your email has been successfully verified. You can now access all features of your account.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/dashboard')}
            >
              Continue to Dashboard
            </Button>
          </>
        ) : (
          <>
            {error ? (
              <ErrorOutlineIcon
                color="error"
                sx={{ fontSize: 64 }}
              />
            ) : (
              <EmailIcon
                color="primary"
                sx={{ fontSize: 64 }}
              />
            )}

            <Typography variant="h5" align="center">
              Verify Your Email
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            <Typography variant="body1" align="center" color="textSecondary">
              We've sent a verification email to:
            </Typography>
            
            <Typography variant="subtitle1" align="center" fontWeight="bold">
              {email}
            </Typography>

            <Typography variant="body2" align="center" color="textSecondary">
              Please check your email and click the verification link to activate your account.
              If you don't see the email, check your spam folder.
            </Typography>

            <Stack spacing={2} width="100%">
              <Button
                variant="outlined"
                fullWidth
                onClick={handleResendVerification}
                disabled={resending || resendTimeout > 0}
              >
                {resending
                  ? 'Sending...'
                  : resendTimeout > 0
                  ? `Resend in ${resendTimeout}s`
                  : 'Resend Verification Email'}
              </Button>

              <Button
                variant="text"
                fullWidth
                component={RouterLink}
                to="/support"
              >
                Need Help?
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default EmailVerificationPage;