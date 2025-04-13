import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
  Avatar,
  AvatarGroup,
  Menu,
  MenuItem,
  LinearProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as TasksIcon,
  Group as TeamIcon,
  Timeline as TimelineIcon,
  Attachment as FilesIcon,
  Comment as CommentsIcon,
  Settings as SettingsIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import LoadingScreen from '../common/LoadingScreen';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import TaskList from '../tasks/TaskList';
import TeamMembers from '../team/TeamMembers';
import Timeline from '../timeline/Timeline';
import FileList from '../files/FileList';
import Comments from '../comments/Comments';
import ProjectSettings from './ProjectSettings';

const ProjectDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const {
    project,
    loading,
    error,
    fetchProject,
    updateProject,
    deleteProject
  } = useProject(projectId);

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Fetch project data on component mount
  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    navigate(`/projects/${projectId}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await deleteProject();
      showSnackbar('Project deleted successfully', 'success');
      navigate('/projects');
    } catch (error) {
      showSnackbar('Failed to delete project', 'error');
    }
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleArchive = async () => {
    try {
      await updateProject({ ...project, status: 'archived' });
      showSnackbar('Project archived successfully', 'success');
      fetchProject();
    } catch (error) {
      showSnackbar('Failed to archive project', 'error');
    }
    handleMenuClose();
  };

  const handleStar = async () => {
    setIsStarred(!isStarred);
    // Implement star functionality
    handleMenuClose();
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Project"
        description={error.message}
        action={
          <Button
            variant="contained"
            onClick={fetchProject}
          >
            Retry
          </Button>
        }
      />
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="The project you're looking for doesn't exist or you don't have access to it."
        action={
          <Button
            variant="contained"
            onClick={() => navigate('/projects')}
          >
            View All Projects
          </Button>
        }
      />
    );
  }

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title={project.name}
        description={project.description}
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.name }
        ]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleStar}>
              {isStarred ? <StarIcon color="warning" /> : <StarBorderIcon />}
            </IconButton>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Project
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        }
      />

      {/* Project Overview */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={project.status}
                color={
                  project.status === 'active' ? 'success' :
                  project.status === 'completed' ? 'info' :
                  'default'
                }
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={project.progress}
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2">
                  {project.progress}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Team
              </Typography>
              <AvatarGroup max={5}>
                {project.team.map((member) => (
                  <Avatar
                    key={member.id}
                    alt={member.name}
                    src={member.avatar}
                  />
                ))}
              </AvatarGroup>
            </Box>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center' }}
                >
                  <Typography variant="h4">
                    {project.tasksCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tasks
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center' }}
                >
                  <Typography variant="h4">
                    {project.completedTasks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<TasksIcon />} label="Tasks" />
          <Tab icon={<TeamIcon />} label="Team" />
          <Tab icon={<TimelineIcon />} label="Timeline" />
          <Tab icon={<FilesIcon />} label="Files" />
          <Tab icon={<CommentsIcon />} label="Comments" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ mb: 3 }}>
        {activeTab === 0 && (
          <TaskList projectId={projectId} />
        )}
        {activeTab === 1 && (
          <TeamMembers projectId={projectId} />
        )}
        {activeTab === 2 && (
          <Timeline projectId={projectId} />
        )}
        {activeTab === 3 && (
          <FileList projectId={projectId} />
        )}
        {activeTab === 4 && (
          <Comments projectId={projectId} />
        )}
        {activeTab === 5 && (
          <ProjectSettings project={project} onUpdate={fetchProject} />
        )}
      </Box>

      {/* More Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Project
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share Project
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          Archive Project
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete Project
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;