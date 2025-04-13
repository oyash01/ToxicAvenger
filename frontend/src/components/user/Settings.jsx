import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useThemeMode } from '../../hooks/useTheme';
import { useSnackbar } from '../../context/SnackbarContext';

const Settings = () => {
  const { user, updateSettings, deleteAccount } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [error, setError] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    mentionNotifications: true,
    commentNotifications: true,

    // Appearance Settings
    theme: mode,
    fontSize: 'medium',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Privacy Settings
    profileVisibility: 'public',
    activityVisibility: 'followers',
    emailVisibility: 'private',

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  // Load user settings
  useEffect(() => {
    if (user?.settings) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...user.settings
      }));
    }
  }, [user]);

  // Handle settings change
  const handleSettingChange = (section, setting) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');

    try {
      await updateSettings(settings);
      showSnackbar('Settings saved successfully', 'success');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
      showSnackbar('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (confirmDelete !== user.email) {
      setError('Please enter your email correctly to confirm deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAccount();
      showSnackbar('Account deleted successfully', 'success');
      // Redirect to home page will be handled by auth state change
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      showSnackbar('Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <NotificationsIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Notification Settings</Typography>
            </Box>

            <List>
              <ListItem>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive email notifications for important updates"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange('notifications', 'emailNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Push Notifications"
                  secondary="Receive push notifications in your browser"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.pushNotifications}
                    onChange={handleSettingChange('notifications', 'pushNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Marketing Emails"
                  secondary="Receive updates about new features and promotions"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.marketingEmails}
                    onChange={handleSettingChange('notifications', 'marketingEmails')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Weekly Digest"
                  secondary="Receive a weekly summary of activity"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.weeklyDigest}
                    onChange={handleSettingChange('notifications', 'weeklyDigest')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PaletteIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Appearance Settings</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={handleSettingChange('appearance', 'theme')}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={settings.fontSize}
                    onChange={handleSettingChange('appearance', 'fontSize')}
                    label="Font Size"
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Localization Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LanguageIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Localization Settings</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={handleSettingChange('localization', 'language')}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="pt">Português</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.timezone}
                    onChange={handleSettingChange('localization', 'timezone')}
                    label="Timezone"
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="Europe/London">London</MenuItem>
                    <MenuItem value="Europe/Paris">Paris</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Security Settings</Typography>
            </Box>

            <List>
              <ListItem>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.twoFactorAuth}
                    onChange={handleSettingChange('security', 'twoFactorAuth')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Login Alerts"
                  secondary="Get notified of new sign-ins to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.loginAlerts}
                    onChange={handleSettingChange('security', 'loginAlerts')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Session Timeout"
                  secondary="Automatically log out after period of inactivity"
                />
                <ListItemSecondaryAction>
                  <FormControl sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.sessionTimeout}
                      onChange={handleSettingChange('security', 'sessionTimeout')}
                      size="small"
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={120}>2 hours</MenuItem>
                      <MenuItem value={240}>4 hours</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Privacy Settings</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={settings.profileVisibility}
                    onChange={handleSettingChange('privacy', 'profileVisibility')}
                    label="Profile Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="followers">Followers Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Activity Visibility</InputLabel>
                  <Select
                    value={settings.activityVisibility}
                    onChange={handleSettingChange('privacy', 'activityVisibility')}
                    label="Activity Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="followers">Followers Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
            <Typography variant="h6" sx={{ color: 'error.contrastText', mb: 2 }}>
              Danger Zone
            </Typography>
            <Typography variant="body2" sx={{ color: 'error.contrastText', mb: 2 }}>
              Once you delete your account, there is no going back. Please be certain.
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body1" paragraph>
            This action cannot be undone. This will permanently delete your account
            and remove all of your data from our servers.
          </Typography>
          <Typography variant="body2" paragraph>
            Please type your email <strong>{user?.email}</strong> to confirm.
          </Typography>
          <TextField
            fullWidth
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder="Enter your email"
            error={confirmDelete !== '' && confirmDelete !== user?.email}
            helperText={
              confirmDelete !== '' && confirmDelete !== user?.email
                ? "Email doesn't match"
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDeleteAccount}
            disabled={confirmDelete !== user?.email || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;