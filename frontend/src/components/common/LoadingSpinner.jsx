import React from 'react';
import {
  Box,
  CircularProgress,
  Typography
} from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;