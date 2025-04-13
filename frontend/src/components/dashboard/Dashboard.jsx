import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import userService from '../../services/userService';
import commentService from '../../services/commentService';
import { formatDate } from '../../utils/helpers';
import StatCard from './StatCard';
import CommentChart from './CommentChart';

const Dashboard = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  });
  const [recentComments, setRecentComments] = useState([]);
  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statistics = await userService.getStatistics(timeframe);
      setStats(statistics);

      // Fetch recent comments
      const comments = await commentService.getRecentComments();
      setRecentComments(comments);

      // Fetch chart data
      const analyticsData = await commentService.getAnalytics(timeframe);
      setChartData(analyticsData);

    } catch (error) {
      showSnackbar(error.message || 'Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      case 'flagged':
        return <WarningIcon color="warning" />;
      default:
        return <ScheduleIcon color="info" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Welcome back, {user?.firstName || user?.username}
        </Typography>
        <Box>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            size="small"
            sx={{ mr: 2 }}
          >
            <MenuItem value="day">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
          <IconButton onClick={fetchDashboardData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Comments"
              value={stats.total}
              icon={<CommentIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={<CheckCircleIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<ErrorIcon />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={<ScheduleIcon />}
              color="warning"
            />
          </Grid>

          {/* Analytics Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comment Analytics
              </Typography>
              <CommentChart data={chartData} />
            </Paper>
          </Grid>

          {/* Recent Comments */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Recent Comments"
                action={
                  <Button
                    size="small"
                    onClick={() => navigate('/comments')}
                  >
                    View All
                  </Button>
                }
              />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Content</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentComments.map((comment) => (
                        <TableRow key={comment._id}>
                          <TableCell>
                            {getStatusIcon(comment.status)}
                          </TableCell>
                          <TableCell>
                            {comment.content.substring(0, 50)}...
                          </TableCell>
                          <TableCell>
                            {formatDate(comment.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;