import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  BarChart,
  PieChart,
  Timeline,
  Report
} from '@mui/icons-material';
import commentService from '../../services/commentService';
import { useTheme } from '@mui/material/styles';

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {icon}
          </Grid>
          <Grid item xs>
            <Typography variant="h6" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await commentService.getUserStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {localStorage.getItem('toxiguard_user') ? JSON.parse(localStorage.getItem('toxiguard_user')).username : 'User'}
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Last updated: {new Date().toLocaleString()}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Comments"
            value={stats?.totalComments || 0}
            icon={<BarChart sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toxic Comments"
            value={stats?.toxicComments || 0}
            icon={<Report sx={{ fontSize: 40, color: theme.palette.error.main }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clean Comments"
            value={stats?.cleanComments || 0}
            icon={<Timeline sx={{ fontSize: 40, color: theme.palette.success.main }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Accuracy Rate"
            value={`${stats?.accuracyRate || 0}%`}
            icon={<PieChart sx={{ fontSize: 40, color: theme.palette.info.main }} />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {stats?.recentActivity?.map((activity, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {new Date(activity.timestamp).toLocaleString()}
                </Typography>
                <Typography>
                  {activity.action} - {activity.details}
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Average Response Time
                </Typography>
                <Typography variant="h6">
                  {stats?.avgResponseTime || '0'}ms
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Success Rate
                </Typography>
                <Typography variant="h6">
                  {stats?.successRate || '0'}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Total Processed Today
                </Typography>
                <Typography variant="h6">
                  {stats?.todayProcessed || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  API Usage
                </Typography>
                <Typography variant="h6">
                  {stats?.apiUsage || '0'}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;