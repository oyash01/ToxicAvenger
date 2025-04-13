import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';

const EmailVerificationSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    smtpConfig: {
      host: '',
      port: '',
      secure: true,
      auth: {
        user: '',
        pass: ''
      }
    },
    fromEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      if (response.data.emailVerification) {
        setSettings(response.data.emailVerification);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('smtpConfig.')) {
      const [parent, child, grandchild] = name.split('.');
      setSettings(prev => ({
        ...prev,
        smtpConfig: {
          ...prev.smtpConfig,
          [child]: grandchild ? {
            ...prev.smtpConfig[child],
            [grandchild]: value
          } : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('/api/settings/email-verification', settings);
      setSuccess('Settings saved successfully');
      showNotification('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Error saving settings');
      showNotification('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/settings/test-smtp', settings);
      setSuccess('SMTP configuration test successful');
      showNotification('SMTP configuration test successful', 'success');
    } catch (error) {
      console.error('Error testing SMTP:', error);
      setError('Error testing SMTP configuration');
      showNotification('Error testing SMTP configuration', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Email Verification Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography>Enable Email Verification</Typography>
                <Switch
                  checked={settings.enabled}
                  onChange={handleChange}
                  name="enabled"
                  color="primary"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  SMTP Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      name="smtpConfig.host"
                      value={settings.smtpConfig.host}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      name="smtpConfig.port"
                      value={settings.smtpConfig.port}
                      onChange={handleChange}
                      type="number"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="SMTP Username"
                      name="smtpConfig.auth.user"
                      value={settings.smtpConfig.auth.user}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="SMTP Password"
                      name="smtpConfig.auth.pass"
                      value={settings.smtpConfig.auth.pass}
                      onChange={handleChange}
                      type="password"
                      required
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="From Email"
                name="fromEmail"
                value={settings.fromEmail}
                onChange={handleChange}
                type="email"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleTestSmtp}
                  disabled={testing}
                >
                  {testing ? 'Testing...' : 'Test SMTP Configuration'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationSettings; 