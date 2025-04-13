import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import adminService from '../../services/adminService';

const MongoUrlManager = () => {
  const [mongoUrls, setMongoUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadMongoUrls();
  }, []);

  const loadMongoUrls = async () => {
    try {
      setLoading(true);
      const response = await adminService.getMongoUrls();
      setMongoUrls(response.data);
    } catch (err) {
      setError('Failed to load MongoDB URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (url = null) => {
    if (url) {
      setEditingUrl(url);
      setFormData({
        name: url.name,
        description: url.description,
        url: ''
      });
    } else {
      setEditingUrl(null);
      setFormData({
        name: '',
        url: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUrl(null);
    setFormData({
      name: '',
      url: '',
      description: ''
    });
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const response = await adminService.testMongoConnection(formData.url);
      if (response.data.success) {
        alert('Connection successful!');
      } else {
        alert('Connection failed!');
      }
    } catch (err) {
      alert('Connection failed: ' + err.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUrl) {
        await adminService.updateMongoUrl(editingUrl._id, formData);
      } else {
        await adminService.addMongoUrl(formData);
      }
      handleCloseDialog();
      loadMongoUrls();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this MongoDB URL?')) {
      try {
        await adminService.deleteMongoUrl(id);
        loadMongoUrls();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">MongoDB URL Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadMongoUrls}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New URL
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Checked</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mongoUrls.map((url) => (
              <TableRow key={url._id}>
                <TableCell>{url.name}</TableCell>
                <TableCell>{url.description}</TableCell>
                <TableCell>
                  <Chip
                    icon={url.lastConnectionStatus === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                    label={url.lastConnectionStatus}
                    color={url.lastConnectionStatus === 'success' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {url.lastChecked
                    ? new Date(url.lastChecked).toLocaleString()
                    : 'Never'}
                </TableCell>
                <TableCell>{url.createdBy?.username}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => handleOpenDialog(url)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(url._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingUrl ? 'Edit MongoDB URL' : 'Add New MongoDB URL'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            {!editingUrl && (
              <TextField
                fullWidth
                label="MongoDB URL"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                margin="normal"
                required
                type="password"
              />
            )}
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            {!editingUrl && (
              <Button
                onClick={handleTestConnection}
                disabled={!formData.url || testingConnection}
              >
                {testingConnection ? (
                  <CircularProgress size={24} />
                ) : (
                  'Test Connection'
                )}
              </Button>
            )}
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingUrl ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MongoUrlManager;