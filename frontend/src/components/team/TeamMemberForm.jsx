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
  Avatar,
  IconButton,
  Typography,
  Autocomplete,
  Chip,
  FormHelperText,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  AddPhotoAlternate as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTeam } from '../../hooks/useTeam';
import { useSnackbar } from '../../context/SnackbarContext';

const roles = [
  'Developer',
  'Designer',
  'Manager',
  'QA',
  'Product Owner',
  'Scrum Master',
  'Tech Lead'
];

const skills = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'UI/UX',
  'DevOps',
  'Project Management',
  'Testing',
  'Database',
  'Cloud',
  'Mobile Development'
];

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  role: '',
  skills: [],
  avatar: null,
  department: '',
  title: '',
  startDate: null,
  workHours: '',
  timeZone: '',
  slackUsername: '',
  githubUsername: ''
};

const TeamMemberForm = ({
  open,
  onClose,
  member = null,
  projectId
}) => {
  const theme = useTheme();
  const { addTeamMember, updateTeamMember } = useTeam(projectId);
  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const isEditMode = Boolean(member);

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        skills: member.skills || []
      });
      setAvatarPreview(member.avatar);
    } else {
      setFormData(initialFormState);
      setAvatarPreview(null);
    }
    setErrors({});
  }, [member]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setFormData(prev => ({
      ...prev,
      avatar: null
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
        await updateTeamMember(formData);
        showSnackbar('Team member updated successfully', 'success');
      } else {
        await addTeamMember(formData);
        showSnackbar('Team member added successfully', 'success');
      }
      handleClose();
    } catch (error) {
      showSnackbar(error.message || 'Failed to save team member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setErrors({});
    setAvatarPreview(null);
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
          {isEditMode ? 'Edit Team Member' : 'Add Team Member'}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Avatar Upload */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={avatarPreview}
                alt={formData.name}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>
                {avatarPreview && (
                  <IconButton
                    onClick={handleRemoveAvatar}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Basic Information */}
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.role)}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                  >
                    {roles.map(role => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && (
                    <FormHelperText>{errors.role}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Typography variant="subtitle1" gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* Skills */}
            <Autocomplete
              multiple
              options={skills}
              value={formData.skills}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  skills: newValue
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
                  label="Skills"
                  placeholder="Add skills"
                />
              )}
            />

            {/* Social/Work Information */}
            <Typography variant="subtitle1" gutterBottom>
              Work Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Slack Username"
                  name="slackUsername"
                  value={formData.slackUsername}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub Username"
                  name="githubUsername"
                  value={formData.githubUsername}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Zone"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Work Hours"
                  name="workHours"
                  value={formData.workHours}
                  onChange={handleChange}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </Grid>
            </Grid>
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
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Member' : 'Add Member'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamMemberForm;