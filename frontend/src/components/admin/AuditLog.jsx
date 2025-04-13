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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import JsonDiffViewer from '../common/JsonDiffViewer';

const AuditLog = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    user: '',
    dateFrom: null,
    dateTo: null,
    searchTerm: ''
  });

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAuditLogs({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      setAuditLogs(response.logs);
      setTotalLogs(response.total);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
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
      action: '',
      entity: '',
      user: '',
      dateFrom: null,
      dateTo: null,
      searchTerm: ''
    });
    setFilterDialogOpen(false);
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportAuditLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showSnackbar(error.message || 'Error exporting audit logs', 'error');
    }
  };

  const getActionChip = (action) => {
    const actionColors = {
      create: 'success',
      update: 'primary',
      delete: 'error',
      read: 'default'
    };

    return (
      <Chip
        label={action}
        color={actionColors[action.toLowerCase()] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Audit Log</Typography>
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
            onClick={fetchAuditLogs}
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
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getActionChip(log.action)}</TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      {log.description.substring(0, 100)}
                      {log.description.length > 100 && '...'}
                    </TableCell>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      {log.changes && (
                        <Tooltip title="View Changes">
                          <IconButton size="small">
                            <CompareIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalLogs}
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
        <DialogTitle>Filter Audit Log</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={filters.action}
                onChange={handleFilterChange('action')}
                label="Action"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Entity</InputLabel>
              <Select
                value={filters.entity}
                onChange={handleFilterChange('entity')}
                label="Entity"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="comment">Comment</MenuItem>
                <MenuItem value="setting">Setting</MenuItem>
                <MenuItem value="api_key">API Key</MenuItem>
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
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Description
              </Typography>
              <Typography paragraph>{selectedLog.description}</Typography>

              {selectedLog.changes && (
                <>
                  <Typography variant="subtitle2" color="textSecondary">
                    Changes
                  </Typography>
                  <JsonDiffViewer
                    oldData={selectedLog.changes.before}
                    newData={selectedLog.changes.after}
                  />
                </>
              )}

              <Typography variant="subtitle2" color="textSecondary">
                Metadata
              </Typography>
              <Typography>Action: {selectedLog.action}</Typography>
              <Typography>Entity: {selectedLog.entity}</Typography>
              <Typography>User: {selectedLog.user}</Typography>
              <Typography>IP Address: {selectedLog.ipAddress}</Typography>
              <Typography>User Agent: {selectedLog.userAgent}</Typography>
              <Typography>Timestamp: {formatDate(selectedLog.timestamp)}</Typography>
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

export default AuditLog;