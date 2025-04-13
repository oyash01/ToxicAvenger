import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
  CheckCircleOutline as CheckCircleIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';

const steps = ['Verify Token', 'Reset Password', 'Complete'];

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();
  const { confirmPasswordReset, verifyResetToken } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  const [tokenValid, setTokenValid] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  // Password requirements
  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'At least one uppercase letter', regex: /[A-Z]/ },
    { label: 'At least one lowercase letter', regex: /[a-z]/ },
    { label: 'At least one number', regex: /\d/ },
    { label: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset token');
        setLoading(false);
        return;
      }

      try {
        await verifyResetToken(token);
        setTokenValid(true);
        setActiveStep(1);
      } catch (err) {
        setError('Invalid or expired reset token');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, verifyResetToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassword = () => {
    const { password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const failedRequirements = passwordRequirements.filter(
      req => !req.regex.test(password)
    );

    if (failedRequirements.length > 0) {
      setError(`Password must contain: ${failedRequirements.map(r => r.label.toLowerCase()).join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(token, formData.password);
      setResetComplete(true);
      setActiveStep(2);
      showSnackbar('Password successfully reset', 'success');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      showSnackbar('Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              Verifying reset token...
            </Typography>
          </Box>
        );

      case 1:
        return (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              name="password"
              type={showPassword.password ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(prev => ({
                        ...prev,
                        password: !prev.password
                      }))}
                      edge="end"
                    >
                      {showPassword.password ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword.confirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(prev => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword
                      }))}
                      edge="end"
                    >
                      {showPassword.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Requirements */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Password must contain:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {passwordRequirements.map((req, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    display="block"
                    color={req.regex.test(formData.password) ? 'success.main' : 'text.secondary'}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {req.regex.test(formData.password) ? '✓' : '○'} {req.label}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </form>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon
              sx={{
                fontSize: 64,
                color: 'success.main',
                mb: 2
              }}
            />
            <Typography variant="h6" gutterBottom>
              Password Reset Complete
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              paragraph
            >
              Your password has been successfully reset.
              You can now log in with your new password.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Box>
        );

      default:
        return null;
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
            Reset Password
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create a new strong password for your account
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        {renderStepContent(activeStep)}

        {/* Help Text */}
        {!resetComplete && (
          <Typography
            variant="caption"
            color="textSecondary"
            align="center"
            sx={{ mt: 4, display: 'block' }}
          >
            Need help?{' '}
            <Link href="mailto:support@example.com" underline="hover">
              Contact Support
            </Link>
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;