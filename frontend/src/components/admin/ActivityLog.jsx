import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';

const ActivityLog = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalActivities, setTotalActivities] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: '',
    level: '',
    user: '',
    dateFrom: null,
    dateTo: null,
    searchTerm: ''
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await adminService.getActivityLogs({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      setActivities(response.activities);
      setTotalActivities(response.total);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, rowsPerPage, filters]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (field) => (date) => {
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      level: '',
      user: '',
      dateFrom: null,
      dateTo: null,
      searchTerm: ''
    });
    setFilterDialogOpen(false);
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportActivityLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showSnackbar(error.message || 'Error exporting activity logs', 'error');
    }
  };

  const getLevelIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      default:
        return null;
    }
  };

  const getTypeChip = (type) => {
    const typeColors = {
      auth: 'primary',
      user: 'secondary',
      comment: 'success',
      system: 'warning',
      api: 'info'
    };

    return (
      <Chip
        label={type}
        color={typeColors[type.toLowerCase()] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Activity Log</Typography>
        <Box>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchActivities}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Level</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {getLevelIcon(activity.level)}
                    </TableCell>
                    <TableCell>
                      {getTypeChip(activity.type)}
                    </TableCell>
                    <TableCell>
                      {activity.description.substring(0, 100)}
                      {activity.description.length > 100 && '...'}
                    </TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.ipAddress}</TableCell>
                    <TableCell>{formatDate(activity.timestamp)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedActivity(activity);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalActivities}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Paper>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Activity Log</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={handleFilterChange('type')}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="auth">Authentication</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="comment">Comment</MenuItem>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="api">API</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.level}
                onChange={handleFilterChange('level')}
                label="Level"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="User"
              value={filters.user}
              onChange={handleFilterChange('user')}
              sx={{ mb: 2 }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="From Date"
                value={filters.dateFrom}
                onChange={handleDateChange('dateFrom')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />

              <DateTimePicker
                label="To Date"
                value={filters.dateTo}
                onChange={handleDateChange('dateTo')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Search"
              value={filters.searchTerm}
              onChange={handleFilterChange('searchTerm')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button
            onClick={() => setFilterDialogOpen(false)}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Activity Details</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Description
              </Typography>
              <Typography paragraph>{selectedActivity.description}</Typography>

              <Typography variant="subtitle2" color="textSecondary">
                Additional Data
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(selectedActivity.data, null, 2)}
              </pre>

              <Typography variant="subtitle2" color="textSecondary">
                Metadata
              </Typography>
              <Typography>Type: {selectedActivity.type}</Typography>
              <Typography>Level: {selectedActivity.level}</Typography>
              <Typography>User: {selectedActivity.user}</Typography>
              <Typography>IP Address: {selectedActivity.ipAddress}</Typography>
              <Typography>User Agent: {selectedActivity.userAgent}</Typography>
              <Typography>Timestamp: {formatDate(selectedActivity.timestamp)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivityLog;