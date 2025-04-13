import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Typography,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Generate breadcrumbs based on current location
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const pathnames = location.pathname.split('/').filter((x) => x);
      const breadcrumbItems = [];
      
      let currentPath = '';
      pathnames.forEach((name, index) => {
        currentPath += `/${name}`;
        const isLast = index === pathnames.length - 1;
        
        // Convert path to readable text
        const text = name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        breadcrumbItems.push({
          text,
          path: currentPath,
          isLast
        });
      });

      setBreadcrumbs(breadcrumbItems);
    };

    generateBreadcrumbs();
  }, [location]);

  // Check if user is admin
  if (!isLoading && (!user || !user.isAdmin)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Loading state
  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Admin Sidebar */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Admin Navbar */}
        <Navbar
          drawerWidth={DRAWER_WIDTH}
          handleDrawerToggle={handleDrawerToggle}
        />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            py: 3,
            px: { xs: 2, sm: 3 },
            bgcolor: 'background.default'
          }}
        >
          <Container maxWidth="lg">
            {/* Environment Banner */}
            {process.env.NODE_ENV !== 'production' && (
              <Alert 
                severity="warning" 
                sx={{ mb: 3 }}
              >
                You are currently in {process.env.NODE_ENV} environment
              </Alert>
            )}

            {/* Breadcrumbs */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: 'background.paper',
                display: !isMobile ? 'block' : 'none'
              }}
            >
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
              >
                <Link
                  component={RouterLink}
                  to="/admin"
                  color="inherit"
                  underline="hover"
                >
                  Admin
                </Link>
                {breadcrumbs.map((breadcrumb, index) => {
                  if (breadcrumb.isLast) {
                    return (
                      <Typography
                        key={index}
                        color="text.primary"
                      >
                        {breadcrumb.text}
                      </Typography>
                    );
                  }

                  return (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={breadcrumb.path}
                      color="inherit"
                      underline="hover"
                    >
                      {breadcrumb.text}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            </Paper>

            {/* Main Content Area */}
            <Box sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: theme.shadows[1],
              p: { xs: 2, sm: 3 }
            }}>
              <Outlet />
            </Box>
          </Container>
        </Box>

        {/* Admin Footer */}
        <Footer />
      </Box>

      {/* Admin Context Providers could be added here */}
    </Box>
  );
};

export default AdminLayout;