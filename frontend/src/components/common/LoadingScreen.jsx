import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  keyframes,
  alpha
} from '@mui/material';

// Define animations
const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const LoadingScreen = ({ message = 'Loading...', fullScreen = true }) => {
  const theme = useTheme();

  // Base styles for both full screen and inline loading
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: alpha(theme.palette.background.default, 0.8),
    transition: 'all 0.3s',
  };

  // Additional styles for full screen mode
  const fullScreenStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.modal + 1,
    backdropFilter: 'blur(4px)',
  };

  // Inline mode styles
  const inlineStyles = {
    minHeight: 200,
    width: '100%',
    borderRadius: theme.shape.borderRadius,
  };

  return (
    <Box
      sx={{
        ...containerStyles,
        ...(fullScreen ? fullScreenStyles : inlineStyles),
      }}
    >
      {/* Loading Spinner */}
      <CircularProgress
        size={40}
        thickness={4}
        sx={{
          mb: 2,
          color: theme.palette.primary.main,
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      />

      {/* Loading Message */}
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;