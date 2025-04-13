import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';

const Analytics = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [data, setData] = useState({
    userActivity: [],
    commentStats: [],
    moderationMetrics: [],
    userGrowth: [],
    performanceMetrics: []
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await adminService.getAnalytics(timeframe);
      setData(analyticsData);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleExport = async () => {
    try {
      const blob = await adminService.exportAnalytics(timeframe);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeframe}-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showSnackbar(error.message || 'Error exporting analytics', 'error');
    }
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main
  ];

  const chartCommonProps = {
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    style: { fontSize: '0.75rem' }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Analytics Dashboard</Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
              size="small"
            >
              <MenuItem value="day">Last 24 Hours</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchAnalytics}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* User Activity Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="User Activity"
              action={
                <Tooltip title="Shows active users and registration trends">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data.userActivity} {...chartCommonProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active Users"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="newRegistrations"
                      name="New Registrations"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Comment Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Comment Statistics"
              action={
                <Tooltip title="Distribution of comment moderation results">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.commentStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.commentStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Moderation Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Moderation Metrics"
              action={
                <Tooltip title="Performance metrics of the moderation system">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.moderationMetrics} {...chartCommonProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar
                      dataKey="accuracy"
                      name="Accuracy"
                      fill={theme.palette.success.main}
                    />
                    <Bar
                      dataKey="falsePositives"
                      name="False Positives"
                      fill={theme.palette.warning.main}
                    />
                    <Bar
                      dataKey="falseNegatives"
                      name="False Negatives"
                      fill={theme.palette.error.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="System Performance"
              action={
                <Tooltip title="System response times and resource usage">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data.performanceMetrics} {...chartCommonProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      name="Response Time (ms)"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      name="CPU Usage (%)"
                      stroke={theme.palette.warning.main}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      name="Memory Usage (%)"
                      stroke={theme.palette.error.main}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;