import React, { useEffect, useState } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  useTheme,
  keyframes,
  alpha
} from '@mui/material';

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const PageLoader = ({
  loading = true,
  children,
  delay = 500,
  minHeight = '200px',
  message = 'Loading content...',
  showContent = false
}) => {
  const theme = useTheme();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, delay]);

  if (!loading) {
    return (
      <Box
        sx={{
          animation: `${fadeIn} 0.3s ease-in-out`,
          minHeight
        }}
      >
        {children}
      </Box>
    );
  }

  if (!showLoader) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        animation: `${fadeIn} 0.3s ease-in-out`
      }}
    >
      {/* Loading Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1
        }}
      >
        <LinearProgress />
      </Box>

      {/* Loading Content */}
      <Box
        sx={{
          textAlign: 'center',
          p: 3,
          animation: `${slideUp} 0.5s ease-out`,
          zIndex: 2
        }}
      >
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ mb: 2 }}
        >
          {message}
        </Typography>

        {/* Optional Subtext */}
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: 'block',
            opacity: 0.7
          }}
        >
          This may take a few moments
        </Typography>
      </Box>

      {/* Show content behind loader if specified */}
      {showContent && (
        <Box
          sx={{
            opacity: 0.3,
            filter: 'blur(2px)',
            pointerEvents: 'none'
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

export default PageLoader;