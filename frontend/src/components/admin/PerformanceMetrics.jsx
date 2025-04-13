import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip
} from 'recharts';
import {
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';

const PerformanceMetrics = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('day');
  const [metrics, setMetrics] = useState([]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPerformanceMetrics(timeframe);
      setMetrics(data);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching performance metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeframe]);

  return (
    <Card>
      <CardHeader
        title="Performance Metrics"
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              size="small"
              sx={{ mr: 1 }}
            >
              <MenuItem value="hour">Last Hour</MenuItem>
              <MenuItem value="day">Last 24 Hours</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
            </Select>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchMetrics} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Performance metrics show system response times and resource usage">
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={metrics}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.75rem' }}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Bar
                  dataKey="responseTime"
                  name="Response Time (ms)"
                  fill={theme.palette.primary.main}
                />
                <Bar
                  dataKey="cpuUsage"
                  name="CPU Usage (%)"
                  fill={theme.palette.warning.main}
                />
                <Bar
                  dataKey="memoryUsage"
                  name="Memory Usage (%)"
                  fill={theme.palette.error.main}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;