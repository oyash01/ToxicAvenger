import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Comment as CommentIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [projectStats, setProjectStats] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Mock API calls
        // Analytics data
        const mockAnalyticsData = {
          visitors: {
            total: 15234,
            change: 12.5,
            data: Array.from({ length: 7 }, (_, i) => ({
              date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'MMM dd'),
              value: Math.floor(Math.random() * 1000)
            })).reverse()
          },
          engagement: {
            total: 8567,
            change: -2.3,
            data: Array.from({ length: 7 }, (_, i) => ({
              date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'MMM dd'),
              value: Math.floor(Math.random() * 500)
            })).reverse()
          }
        };

        // Project stats
        const mockProjectStats = {
          totalProjects: 12,
          activeProjects: 5,
          completedTasks: 67,
          pendingTasks: 23
        };

        // Recent activities
        const mockActivities = [
          {
            id: 1,
            type: 'comment',
            user: {
              name: 'John Doe',
              avatar: 'https://mui.com/static/images/avatar/1.jpg'
            },
            action: 'commented on',
            target: 'Project Alpha',
            timestamp: new Date(Date.now() - 1000 * 60 * 30)
          },
          {
            id: 2,
            type: 'task',
            user: {
              name: 'Alice Smith',
              avatar: 'https://mui.com/static/images/avatar/2.jpg'
            },
            action: 'completed task',
            target: 'Update Documentation',
            timestamp: new Date(Date.now() - 1000 * 60 * 60)
          },
          // Add more mock activities
        ];

        setAnalyticsData(mockAnalyticsData);
        setProjectStats(mockProjectStats);
        setRecentActivities(mockActivities);
      } catch (err) {
        setError('Failed to load dashboard data');
        showSnackbar('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showSnackbar]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your projects today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h4">
                {projectStats.totalProjects}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(projectStats.activeProjects / projectStats.totalProjects) * 100}
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {projectStats.activeProjects} active projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Tasks
              </Typography>
              <Typography variant="h4">
                {projectStats.completedTasks}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(projectStats.completedTasks / (projectStats.completedTasks + projectStats.pendingTasks)) * 100}
                color="success"
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {projectStats.pendingTasks} tasks pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Visitors
              </Typography>
              <Typography variant="h4">
                {analyticsData.visitors.total.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon
                  color={analyticsData.visitors.change > 0 ? 'success' : 'error'}
                  sx={{ mr: 1 }}
                />
                <Typography
                  variant="body2"
                  color={analyticsData.visitors.change > 0 ? 'success.main' : 'error.main'}
                >
                  {analyticsData.visitors.change}% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Engagement Rate
              </Typography>
              <Typography variant="h4">
                {analyticsData.engagement.total.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon
                  color={analyticsData.engagement.change > 0 ? 'success' : 'error'}
                  sx={{ mr: 1 }}
                />
                <Typography
                  variant="body2"
                  color={analyticsData.engagement.change > 0 ? 'success.main' : 'error.main'}
                >
                  {analyticsData.engagement.change}% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Visitor Analytics</Typography>
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.visitors.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Engagement</Typography>
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.engagement.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={activity.user.avatar}>
                        {activity.user.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {activity.user.name} {activity.action}{' '}
                          <Typography
                            component="span"
                            variant="body2"
                            color="primary"
                          >
                            {activity.target}
                          </Typography>
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                color="primary"
                onClick={() => navigate('/activity')}
              >
                View All Activity
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/projects/new')}
                >
                  New Project
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/team')}
                >
                  Manage Team
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CommentIcon />}
                  onClick={() => navigate('/messages')}
                >
                  Messages
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<StarIcon />}
                  onClick={() => navigate('/tasks')}
                >
                  Tasks
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <AssessmentIcon sx={{ mr: 1 }} /> Generate Report
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Dashboard;