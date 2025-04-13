import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Chip,
  Avatar,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Group as TeamIcon,
  AttachMoney as BudgetIcon,
  Flag as PriorityIcon,
  Label as LabelIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import { useTeam } from '../../hooks/useTeam';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import LoadingScreen from '../common/LoadingScreen';
import PageHeader from '../common/PageHeader';

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' }
];

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' }
];

const initialFormState = {
  name: '',
  description: '',
  status: 'planning',
  priority: 'medium',
  startDate: null,
  endDate: null,
  team: [],
  budget: '',
  labels: [],
  isPrivate: false,
  enableNotifications: true
};

const ProjectForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const {
    project,
    loading,
    error,
    createProject,
    updateProject,
    fetchProject
  } = useProject(projectId);
  const { teamMembers, fetchTeamMembers } = useTeam();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const isEditMode = Boolean(projectId);

  // Fetch project data for edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProject();
    }
    fetchTeamMembers();
  }, [projectId]);

  // Set form data when project is loaded
  useEffect(() => {
    if (project && isEditMode) {
      setFormData({
        ...project,
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null
      });
    }
  }, [project]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget && isNaN(formData.budget)) {
      newErrors.budget = 'Budget must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleTeamChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      team: newValue
    }));
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleDeleteLabel = (labelToDelete) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToDelete)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await updateProject(formData);
        showSnackbar('Project updated successfully', 'success');
      } else {
        await createProject(formData);
        showSnackbar('Project created successfully', 'success');
      }
      navigate('/projects');
    } catch (error) {
      showSnackbar(error.message || 'Failed to save project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (JSON.stringify(formData) !== JSON.stringify(initialFormState)) {
      setDiscardDialogOpen(true);
    } else {
      navigate('/projects');
    }
  };

  if (loading && isEditMode) return <LoadingScreen />;

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title={isEditMode ? 'Edit Project' : 'Create Project'}
        description={isEditMode ? 'Update project details' : 'Create a new project'}
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: isEditMode ? 'Edit Project' : 'New Project' }
        ]}
      />

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={Boolean(errors.description)}
                helperText={errors.description}
                required
              />
            </Grid>

            {/* Dates and Priority */}
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={Boolean(errors.startDate)}
                    helperText={errors.startDate}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={Boolean(errors.endDate)}
                    helperText={errors.endDate}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {priorityOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityIcon color={option.color} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Team and Budget */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team and Budget
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <Autocomplete
                multiple
                options={teamMembers}
                getOptionLabel={(option) => option.name}
                value={formData.team}
                onChange={handleTeamChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Team Members"
                    placeholder="Add team members"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      avatar={<Avatar alt={option.name} src={option.avatar} />}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                error={Boolean(errors.budget)}
                helperText={errors.budget}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BudgetIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Labels */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Labels
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add a label"
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={handleAddLabel}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.labels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    onDelete={() => handleDeleteLabel(label)}
                    icon={<LabelIcon />}
                  />
                ))}
              </Box>
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPrivate}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'isPrivate',
                        value: e.target.checked
                      }
                    })}
                  />
                }
                label="Private Project"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableNotifications}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'enableNotifications',
                        value: e.target.checked
                      }
                    })}
                  />
                }
                label="Enable Notifications"
              />
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleDiscard}
                  startIcon={<CloseIcon />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={<SaveIcon />}
                >
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Discard Changes Dialog */}
      <Dialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to discard your changes? All unsaved changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardDialogOpen(false)}>
            Continue Editing
          </Button>
          <Button
            onClick={() => navigate('/projects')}
            color="error"
          >
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectForm;