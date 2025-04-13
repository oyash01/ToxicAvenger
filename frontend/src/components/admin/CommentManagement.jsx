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
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';

const CommentManagement = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalComments, setTotalComments] = useState(0);
  const [selectedComment, setSelectedComment] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getComments({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      setComments(response.comments);
      setTotalComments(response.total);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, rowsPerPage, filters]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      await adminService.updateCommentStatus(commentId, newStatus);
      showSnackbar(`Comment ${newStatus} successfully`, 'success');
      fetchComments();
    } catch (error) {
      showSnackbar(error.message || 'Error updating comment status', 'error');
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await adminService.deleteComment(commentId);
        showSnackbar('Comment deleted successfully', 'success');
        fetchComments();
      } catch (error) {
        showSnackbar(error.message || 'Error deleting comment', 'error');
      }
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
    setFilterDialogOpen(false);
  };

  const getStatusChip = (status) => {
    const statusConfigs = {
      approved: { color: 'success', icon: <ApproveIcon /> },
      rejected: { color: 'error', icon: <RejectIcon /> },
      flagged: { color: 'warning', icon: <FlagIcon /> },
      pending: { color: 'default', icon: null }
    };

    const config = statusConfigs[status] || statusConfigs.pending;
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Comment Management</Typography>
        <Button
          startIcon={<FilterIcon />}
          variant="outlined"
          onClick={() => setFilterDialogOpen(true)}
        >
          Filter
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Content</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => (
                  <TableRow key={comment._id}>
                    <TableCell>
                      {comment.content.substring(0, 100)}
                      {comment.content.length > 100 && '...'}
                    </TableCell>
                    <TableCell>{comment.user.username}</TableCell>
                    <TableCell>{getStatusChip(comment.status)}</TableCell>
                    <TableCell>{formatDate(comment.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedComment(comment);
                            setViewDialogOpen(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(comment._id, 'approved')}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(comment._id, 'rejected')}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(comment._id)}
                        >
                          <DeleteIcon />
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
          count={totalComments}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

      {/* View Comment Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Comment Details</DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Content
              </Typography>
              <Typography paragraph>{selectedComment.content}</Typography>

              <Typography variant="subtitle2" color="textSecondary">
                User Information
              </Typography>
              <Typography>Username: {selectedComment.user.username}</Typography>
              <Typography>Email: {selectedComment.user.email}</Typography>

              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                Metadata
              </Typography>
              <Typography>Created: {formatDate(selectedComment.createdAt)}</Typography>
              <Typography>Status: {selectedComment.status}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
      >
        <DialogTitle>Filter Comments</DialogTitle>
        <DialogContent>
          <Box sx={{ width: 300, mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={handleFilterChange('status')}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="flagged">Flagged</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Search"
              value={filters.searchTerm}
              onChange={handleFilterChange('searchTerm')}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Date From"
              type="date"
              value={filters.dateFrom}
              onChange={handleFilterChange('dateFrom')}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Date To"
              type="date"
              value={filters.dateTo}
              onChange={handleFilterChange('dateTo')}
              InputLabelProps={{ shrink: true }}
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
    </Box>
  );
};

export default CommentManagement;