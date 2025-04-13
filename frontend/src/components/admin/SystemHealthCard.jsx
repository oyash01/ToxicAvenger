import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';

const SystemHealthCard = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState({
    database: { status: 'checking', latency: 0 },
    api: { status: 'checking', latency: 0 },
    cache: { status: 'checking', latency: 0 },
    groq: { status: 'checking', latency: 0 }
  });

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemHealth();
      setHealthData(data);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching system health', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // Set up polling interval
    const interval = setInterval(fetchHealthData, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const getLatencyColor = (latency) => {
    if (latency < 100) return 'success.main';
    if (latency < 300) return 'warning.main';
    return 'error.main';
  };

  const HealthItem = ({ name, data }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="body2"
            sx={{ color: getLatencyColor(data.latency), mr: 1 }}
          >
            {data.latency}ms
          </Typography>
          {getStatusIcon(data.status)}
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min((data.latency / 500) * 100, 100)}
        color={
          data.status === 'healthy'
            ? 'success'
            : data.status === 'warning'
            ? 'warning'
            : 'error'
        }
        sx={{ height: 6, borderRadius: 1 }}
      />
    </Box>
  );

  return (
    <Card>
      <CardHeader
        title="System Health"
        action={
          <Tooltip title="Refresh">
            <IconButton onClick={fetchHealthData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <HealthItem name="Database" data={healthData.database} />
            <HealthItem name="API" data={healthData.api} />
            <HealthItem name="Cache" data={healthData.cache} />
            <HealthItem name="GROQ" data={healthData.groq} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;