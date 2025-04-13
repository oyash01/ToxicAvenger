import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 74;

const MainLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Reset sidebar state when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Calculate content margin based on sidebar state
  const getContentMargin = () => {
    if (isMobile) return 0;
    if (isCollapsed) return COLLAPSED_DRAWER_WIDTH;
    return isSidebarOpen ? DRAWER_WIDTH : 0;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Navbar */}
      <Navbar
        onDrawerToggle={handleDrawerToggle}
        drawerWidth={isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}
      />

      {/* Sidebar */}
      <Sidebar
        open={isSidebarOpen}
        onClose={handleDrawerToggle}
        collapsed={isCollapsed}
        onCollapse={handleSidebarCollapse}
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_DRAWER_WIDTH}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: getContentMargin(),
          marginTop: '64px', // Navbar height
          p: {
            xs: 2,
            sm: 3,
            md: 4
          },
        }}
      >
        {/* Page Content */}
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;