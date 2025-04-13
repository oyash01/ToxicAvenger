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
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FileCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';

const ApiKeyManagement = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showSecret, setShowSecret] = useState({});
  
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    description: '',
    scopes: [],
    expiresIn: '30'
  });

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await adminService.getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching API keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreateKey = async () => {
    try {
      const newKey = await adminService.createApiKey(newKeyForm);
      setApiKeys([...apiKeys, newKey]);
      setCreateDialogOpen(false);
      setSelectedKey(newKey);
      showSnackbar('API key created successfully', 'success');
      setNewKeyForm({
        name: '',
        description: '',
        scopes: [],
        expiresIn: '30'
      });
    } catch (error) {
      showSnackbar(error.message || 'Error creating API key', 'error');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        await adminService.deleteApiKey(keyId);
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
        showSnackbar('API key deleted successfully', 'success');
      } catch (error) {
        showSnackbar(error.message || 'Error deleting API key', 'error');
      }
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key)
      .then(() => showSnackbar('API key copied to clipboard', 'success'))
      .catch(() => showSnackbar('Failed to copy API key', 'error'));
  };

  const toggleKeyVisibility = (keyId) => {
    setShowSecret(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getExpirationStatus = (expiresAt) => {
    const now = new Date();
    const expDate = new Date(expiresAt);
    const daysUntilExpiration = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    if (daysUntilExpiration < 7) {
      return <Chip label={`Expires in ${daysUntilExpiration} days`} color="warning" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">API Key Management</Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchApiKeys}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Key
          </Button>
        </Box>
      </Box>

      {selectedKey && (
        <Alert
          severity="success"
          onClose={() => setSelectedKey(null)}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2">
            New API Key Created Successfully
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1
              }}
            >
              {selectedKey.secret}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleCopyKey(selectedKey.secret)}
            >
              <CopyIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
            Make sure to copy your API key now. You won't be able to see it again!
          </Typography>
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Scopes</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
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
                apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: 'monospace',
                            width: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {showSecret[key.id] ? key.key : '••••••••••••••••'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {showSecret[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyKey(key.key)}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {key.scopes.map((scope) => (
                        <Chip
                          key={scope}
                          label={scope}
                          size="small"
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {getExpirationStatus(key.expiresAt)}
                    </TableCell>
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
                    <TableCell>{formatDate(key.expiresAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteKey(key.id)}
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
      </Paper>

      {/* Create API Key Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newKeyForm.name}
              onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={newKeyForm.description}
              onChange={(e) => setNewKeyForm({ ...newKeyForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Scopes</InputLabel>
              <Select
                multiple
                value={newKeyForm.scopes}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, scopes: e.target.value })}
                label="Scopes"
              >
                <MenuItem value="read:comments">Read Comments</MenuItem>
                <MenuItem value="write:comments">Write Comments</MenuItem>
                <MenuItem value="moderate:comments">Moderate Comments</MenuItem>
                <MenuItem value="read:users">Read Users</MenuItem>
                <MenuItem value="write:users">Write Users</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Expires In</InputLabel>
              <Select
                value={newKeyForm.expiresIn}
                onChange={(e) => setNewKeyForm({ ...newKeyForm, expiresIn: e.target.value })}
                label="Expires In"
              >
                <MenuItem value="30">30 Days</MenuItem>
                <MenuItem value="90">90 Days</MenuItem>
                <MenuItem value="180">180 Days</MenuItem>
                <MenuItem value="365">1 Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateKey}
            variant="contained"
            disabled={!newKeyForm.name || !newKeyForm.scopes.length}
          >
            Create Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeyManagement;