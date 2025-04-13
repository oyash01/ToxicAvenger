import React, { Component } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to your error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <ErrorDisplay {...this.state} {...this} />;
  }
}

// Separate functional component for the error display
const ErrorDisplay = ({
  error,
  errorInfo,
  showDetails,
  handleReload,
  handleGoHome,
  toggleDetails
}) => {
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 600,
            textAlign: 'center'
          }}
        >
          {/* Error Icon */}
          <BugReportIcon
            sx={{
              fontSize: 64,
              color: 'error.main',
              mb: 2
            }}
          />

          {/* Error Title */}
          <Typography variant="h4" gutterBottom color="error">
            Oops! Something went wrong
          </Typography>

          {/* Error Message */}
          <Typography variant="body1" color="textSecondary" paragraph>
            We apologize for the inconvenience. Please try refreshing the page or
            return to the homepage.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleReload}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
            >
              Go to Homepage
            </Button>
          </Box>

          {/* Error Details Section */}
          <Box sx={{ mt: 4, textAlign: 'left' }}>
            <Button
              onClick={toggleDetails}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: showDetails ? 'rotate(180deg)' : 'rotate(0)',
                    transition: theme.transitions.create('transform')
                  }}
                />
              }
              sx={{ mb: 1 }}
            >
              Technical Details
            </Button>
            <Collapse in={showDetails}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.grey[50],
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Error: {error?.message}
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  {errorInfo?.componentStack}
                </Typography>
              </Paper>
            </Collapse>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorBoundary;