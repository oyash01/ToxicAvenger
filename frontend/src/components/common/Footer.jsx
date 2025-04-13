import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="/">
          ToxiGuard
        </Link>{' '}
        {new Date().getFullYear()}
        {'. All rights reserved.'}
      </Typography>
      <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
        Version 1.0.0 | Last updated: 2025-04-12
      </Typography>
    </Box>
  );
};

export default Footer;