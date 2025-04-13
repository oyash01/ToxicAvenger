import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        open={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
      />
      
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: { sm: `calc(100% - ${isSidebarOpen ? 240 : 0}px)` }
      }}>
        <Navbar onSidebarToggle={handleSidebarToggle} />
        
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: 3,
          bgcolor: 'background.default',
          overflow: 'auto'
        }}>
          {children}
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;