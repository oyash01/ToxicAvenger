import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';

const RegisterSteps = [
  'Account Details',
  'Personal Information',
  'Preferences'
];

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { register, loginWithGoogle, loginWithGitHub } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Account Details
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Information
    firstName: '',
    lastName: '',
    username: '',
    
    // Preferences
    receiveUpdates: true,
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        break;
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.username) {
          setError('Please fill in all fields');
          return false;
        }
        break;
      case 2:
        if (!formData.acceptTerms) {
          setError('You must accept the terms and conditions');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      await register(formData);
      showSnackbar('Registration successful! Please verify your email.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to register');
      showSnackbar('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider) => {
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'github') {
        await loginWithGitHub();
      }
      showSnackbar(`Successfully registered with ${provider}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(`Failed to register with ${provider}`);
      showSnackbar(`Failed to register with ${provider}`, 'error');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />
          </>
        );
      
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
          </>
        );
      
      case 2:
        return (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  name="receiveUpdates"
                  checked={formData.receiveUpdates}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Receive updates about products and services"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  color="primary"
                  required
                />
              }
              label={
                <Typography variant="body2">
                  I accept the{' '}
                  <Link href="/terms" target="_blank">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" target="_blank">
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          </>
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
            Create Account
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Fill in the details to create your account
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ mb: 4 }}
        >
          {RegisterSteps.map((label) => (
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ mt: 4, mb: 2, display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                disabled={loading}
              >
                Back
              </Button>
            )}
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              variant="contained"
              onClick={activeStep === RegisterSteps.length - 1 ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === RegisterSteps.length - 1 ? (
                'Create Account'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </form>

        {/* Social Registration */}
        {activeStep === 0 && (
          <>
            <Box sx={{ mt: 3, mb: 3 }}>
              <Divider>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ px: 2 }}
                >
                  Or register with
                </Typography>
              </Divider>

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  gap: 2,
                  flexDirection: isMobile ? 'column' : 'row'
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={() => handleSocialRegister('google')}
                  disabled={loading}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  onClick={() => handleSocialRegister('github')}
                  disabled={loading}
                >
                  GitHub
                </Button>
              </Box>
            </Box>

            {/* Login Link */}
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 3 }}
            >
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                color="primary"
                underline="hover"
              >
                Sign in here
              </Link>
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Register;