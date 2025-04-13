import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import adminService from '../../services/adminService';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    level: '',
    actionType: '',
    search: ''
  });
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    log: null
  });

  useEffect(() => {
    loadLogs();
  }, [page, rowsPerPage, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getLogs({
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString()
      });
      setLogs(response.data.logs);
      setTotalLogs(response.data.total);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleExport = async (format) => {
    try {
      const response = await adminService.exportLogs(format, filters);
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-export-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      error: 'error',
      warn: 'warning',
      info: 'info',
      debug: 'default'
    };
    return colors[level] || 'default';
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">System Logs</Typography>
        <Box>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('csv')}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('json')}
            sx={{ mr: 1 }}
          >
            Export JSON
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            variant="contained"
            onClick={loadLogs}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                label="Level"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warn">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="debug">Debug</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Action Type</InputLabel>
              <Select
                value={filters.actionType}
                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                label="Action Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="COMMENT_CHECK">Comment Check</MenuItem>
                <MenuItem value="USER_LOGIN">User Login</MenuItem>
                <MenuItem value="API_KEY_FAILOVER">API Key Failover</MenuItem>
                <MenuItem value="COMMENT_DELETE">Comment Delete</MenuItem>
                <MenuItem value="USER_CREATE">User Create</MenuItem>
                <MenuItem value="SYSTEM">System</MenuItem>
                <MenuItem value="DATABASE">Database</MenuItem>
                <MenuItem value="AUTH">Authentication</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Action Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.level}
                    color={getLevelColor(log.level)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.actionType}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.userId?.username || 'System'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => setDetailDialog({ open: true, log })}
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, log: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          {detailDialog.log && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Timestamp
              </Typography>
              <Typography paragraph>
                {new Date(detailDialog.log.timestamp).toLocaleString()}
              </Typography>

              <Typography variant="subtitle2" color="textSecondary">
                Level
              </Typography>
              <Typography paragraph>
                <Chip
                  label={detailDialog.log.level}
                  color={getLevelColor(detailDialog.log.level)}
                />
              </Typography>

              <Typography variant="subtitle2" color="textSecondary">
                Action Type
              </Typography>
              <Typography paragraph>
                {detailDialog.log.actionType}
              </Typography>

              <Typography variant="subtitle2" color="textSecondary">
                Message
              </Typography>
              <Typography paragraph>
                {detailDialog.log.message}
              </Typography>

              <Typography variant="subtitle2" color="textSecondary">
                Metadata
              </Typography>
              <Typography
                component="pre"
                sx={{
                  backgroundColor: 'background.default',
                  p: 2,
                  borderRadius: 1,
                  overflowX: 'auto'
                }}
              >
                {JSON.stringify(detailDialog.log.metadata, null, 2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, log: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogViewer;