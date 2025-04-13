import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  VpnKey as VpnKeyIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';
import StatCard from '../dashboard/StatCard';
import SystemHealthCard from './SystemHealthCard';
import PerformanceMetrics from './PerformanceMetrics';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    comments: 0,
    apiKeys: 0,
    mongoUrls: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, activity] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity()
      ]);
      
      setStats(dashboardStats);
      setRecentActivity(activity);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleAction = async (action) => {
    handleMenuClose();
    if (!selectedItem) return;

    try {
      switch (action) {
        case 'view':
          navigate(`/admin/${selectedItem.type}/${selectedItem.id}`);
          break;
        case 'delete':
          await adminService.deleteItem(selectedItem.type, selectedItem.id);
          showSnackbar('Item deleted successfully', 'success');
          fetchDashboardData();
          break;
        default:
          break;
      }
    } catch (error) {
      showSnackbar(error.message || 'Error performing action', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.users}
              icon={<GroupIcon />}
              color="primary"
              onClick={() => navigate('/admin/users')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Comments"
              value={stats.comments}
              icon={<AssignmentIcon />}
              color="success"
              onClick={() => navigate('/admin/comments')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="API Keys"
              value={stats.apiKeys}
              icon={<VpnKeyIcon />}
              color="warning"
              onClick={() => navigate('/admin/api-keys')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="MongoDB URLs"
              value={stats.mongoUrls}
              icon={<StorageIcon />}
              color="error"
              onClick={() => navigate('/admin/mongo-urls')}
            />
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={6}>
            <SystemHealthCard />
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <PerformanceMetrics />
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.details}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, activity)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>View Details</MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminDashboard;