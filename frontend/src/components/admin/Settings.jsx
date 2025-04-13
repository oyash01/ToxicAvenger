import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../context/SnackbarContext';
import adminService from '../../services/adminService';

const Settings = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState('');

  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true
    },
    moderation: {
      autoModeration: true,
      moderationThreshold: 0.8,
      flagThreshold: 3,
      allowGuestComments: false,
      requireApproval: true
    },
    notifications: {
      emailNotifications: true,
      adminEmailAddress: '',
      notifyOnFlag: true,
      notifyOnNewUser: true,
      notifyOnError: true
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 60,
      passwordMinLength: 8,
      requirePasswordChange: 90
    },
    api: {
      groqApiKey: '',
      groqEndpoint: '',
      rateLimitRequests: 100,
      rateLimitInterval: 60
    }
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      showSnackbar('Settings saved successfully', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field) => (event) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
      }
    }));
  };

  const handleCreateBackup = async () => {
    try {
      await adminService.createBackup();
      showSnackbar('Backup created successfully', 'success');
      fetchBackups();
    } catch (error) {
      showSnackbar(error.message || 'Error creating backup', 'error');
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;

    try {
      await adminService.restoreFromBackup(selectedBackup);
      showSnackbar('System restored successfully', 'success');
      setRestoreDialogOpen(false);
      fetchSettings();
    } catch (error) {
      showSnackbar(error.message || 'Error restoring system', 'error');
    }
  };

  const fetchBackups = async () => {
    try {
      const backupList = await adminService.getBackups();
      setBackups(backupList);
    } catch (error) {
      showSnackbar(error.message || 'Error fetching backups', 'error');
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

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
        <Typography variant="h5">System Settings</Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="General Settings"
              action={
                <Tooltip title="Basic system configuration">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                label="Site Name"
                value={settings.general.siteName}
                onChange={handleInputChange('general', 'siteName')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Site Description"
                value={settings.general.siteDescription}
                onChange={handleInputChange('general', 'siteDescription')}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onChange={handleInputChange('general', 'maintenanceMode')}
                  />
                }
                label="Maintenance Mode"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.allowRegistration}
                    onChange={handleInputChange('general', 'allowRegistration')}
                  />
                }
                label="Allow Registration"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.general.requireEmailVerification}
                    onChange={handleInputChange('general', 'requireEmailVerification')}
                  />
                }
                label="Require Email Verification"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Moderation Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Moderation Settings"
              action={
                <Tooltip title="Comment moderation configuration">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.moderation.autoModeration}
                    onChange={handleInputChange('moderation', 'autoModeration')}
                  />
                }
                label="Auto Moderation"
              />
              <TextField
                fullWidth
                type="number"
                label="Moderation Threshold"
                value={settings.moderation.moderationThreshold}
                onChange={handleInputChange('moderation', 'moderationThreshold')}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Flag Threshold"
                value={settings.moderation.flagThreshold}
                onChange={handleInputChange('moderation', 'flagThreshold')}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.moderation.allowGuestComments}
                    onChange={handleInputChange('moderation', 'allowGuestComments')}
                  />
                }
                label="Allow Guest Comments"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.moderation.requireApproval}
                    onChange={handleInputChange('moderation', 'requireApproval')}
                  />
                }
                label="Require Approval"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* API Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="API Settings"
              action={
                <Tooltip title="API configuration and rate limiting">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                label="GROQ API Key"
                value={settings.api.groqApiKey}
                onChange={handleInputChange('api', 'groqApiKey')}
                type="password"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="GROQ Endpoint"
                value={settings.api.groqEndpoint}
                onChange={handleInputChange('api', 'groqEndpoint')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Rate Limit Requests"
                value={settings.api.rateLimitRequests}
                onChange={handleInputChange('api', 'rateLimitRequests')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Rate Limit Interval (seconds)"
                value={settings.api.rateLimitInterval}
                onChange={handleInputChange('api', 'rateLimitInterval')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Security Settings"
              action={
                <Tooltip title="Security and authentication settings">
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <TextField
                fullWidth
                type="number"
                label="Max Login Attempts"
                value={settings.security.maxLoginAttempts}
                onChange={handleInputChange('security', 'maxLoginAttempts')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Lockout Duration (minutes)"
                value={settings.security.lockoutDuration}
                onChange={handleInputChange('security', 'lockoutDuration')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Session Timeout (minutes)"
                value={settings.security.sessionTimeout}
                onChange={handleInputChange('security', 'sessionTimeout')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Minimum Password Length"
                value={settings.security.passwordMinLength}
                onChange={handleInputChange('security', 'passwordMinLength')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Password Change Interval (days)"
                value={settings.security.requirePasswordChange}
                onChange={handleInputChange('security', 'requirePasswordChange')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Backup and Restore */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Backup and Restore" />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  onClick={() => setBackupDialogOpen(true)}
                >
                  Create Backup
                </Button>
                <Button
                  startIcon={<UploadIcon />}
                  variant="outlined"
                  onClick={() => setRestoreDialogOpen(true)}
                >
                  Restore System
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Backup Dialog */}
      <Dialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
      >
        <DialogTitle>Create System Backup</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a complete backup of the system including all settings,
            user data, and comments. The backup will be stored securely and can be
            used to restore the system if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateBackup}
            variant="contained"
            color="primary"
          >
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Restore System</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Warning: Restoring from a backup will replace all current data.
            This action cannot be undone.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Backup</InputLabel>
            <Select
              value={selectedBackup}
              onChange={(e) => setSelectedBackup(e.target.value)}
              label="Select Backup"
            >
              {backups.map((backup) => (
                <MenuItem key={backup.id} value={backup.id}>
                  {backup.name} - {new Date(backup.created).toLocaleString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRestore}
            variant="contained"
            color="error"
            disabled={!selectedBackup}
          >
            Restore System
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;