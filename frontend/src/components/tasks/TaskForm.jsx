import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Avatar,
  Typography,
  IconButton,
  InputAdornment,
  FormHelperText,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Flag as PriorityIcon,
  DateRange as DateIcon,
  AttachFile as AttachmentIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useTasks } from '../../hooks/useTasks';
import { useTeam } from '../../hooks/useTeam';
import { useSnackbar } from '../../context/SnackbarContext';

const priorities = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' }
];

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' }
];

const initialFormState = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: null,
  assignee: null,
  attachments: [],
  labels: []
};

const TaskForm = ({
  open,
  onClose,
  task = null,
  projectId
}) => {
  const theme = useTheme();
  const { createTask, updateTask } = useTasks(projectId);
  const { teamMembers, fetchTeamMembers } = useTeam();
  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const isEditMode = Boolean(task);

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Set form data when task is provided (edit mode)
  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null
      });
      setFiles(task.attachments || []);
    } else {
      setFormData(initialFormState);
      setFiles([]);
    }
    setErrors({});
  }, [task]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
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

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = {
        ...formData,
        projectId,
        attachments: files
      };

      if (isEditMode) {
        await updateTask(formPayload);
        showSnackbar('Task updated successfully', 'success');
      } else {
        await createTask(formPayload);
        showSnackbar('Task created successfully', 'success');
      }
      handleClose();
    } catch (error) {
      showSnackbar(error.message || 'Failed to save task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setErrors({});
    setFiles([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isEditMode ? 'Edit Task' : 'Create Task'}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Title */}
            <TextField
              fullWidth
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={Boolean(errors.title)}
              helperText={errors.title}
              required
            />

            {/* Description */}
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

            {/* Priority and Status */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityIcon color={priority.color} />
                        {priority.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Due Date */}
            <DateTimePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(date) => {
                setFormData(prev => ({ ...prev, dueDate: date }));
                setErrors(prev => ({ ...prev, dueDate: '' }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={Boolean(errors.dueDate)}
                  helperText={errors.dueDate}
                  required
                />
              )}
            />

            {/* Assignee */}
            <Autocomplete
              options={teamMembers}
              getOptionLabel={(option) => option.name}
              value={formData.assignee}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  assignee: newValue
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assignee"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar
                    src={option.avatar}
                    alt={option.name}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  {option.name}
                </Box>
              )}
            />

            {/* Labels */}
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.labels}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  labels: newValue
                }));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Labels"
                  placeholder="Add labels"
                />
              )}
            />

            {/* Attachments */}
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachmentIcon />}
                sx={{ mb: 2 }}
              >
                Add Attachments
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>

              {files.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover'
                      }}
                    >
                      <AttachmentIcon fontSize="small" />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;