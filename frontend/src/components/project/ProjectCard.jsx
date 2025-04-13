import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Assignment as TaskIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ProjectCard = ({
  project,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onArchive,
  onStar
}) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isStarred, setIsStarred] = useState(project.isStarred);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleAction = (action) => (event) => {
    event.stopPropagation();
    handleMenuClose();
    
    switch (action) {
      case 'edit':
        onEdit(project.id);
        break;
      case 'delete':
        onDelete(project.id);
        break;
      case 'archive':
        onArchive(project.id);
        break;
      case 'star':
        setIsStarred(!isStarred);
        onStar?.(project.id, !isStarred);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.info.main;
      case 'on_hold':
        return theme.palette.warning.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Card
      component={Link}
      to={`/projects/${project.id}`}
      sx={{
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      {viewMode === 'list' ? (
        // List View
        <Box sx={{ display: 'flex', width: '100%' }}>
          <CardContent sx={{ flex: 1, display: 'flex', gap: 2 }}>
            {/* Project Info */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" noWrap>
                  {project.name}
                </Typography>
                {isStarred && (
                  <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                )}
              </Box>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {project.description}
              </Typography>
            </Box>

            {/* Project Stats */}
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{ width: 100 }}
                  />
                  <Typography variant="body2">
                    {project.progress}%
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary">
                  Tasks
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TaskIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {project.completedTasks}/{project.totalTasks}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="textSecondary">
                  Team
                </Typography>
                <AvatarGroup
                  max={3}
                  sx={{
                    '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' }
                  }}
                >
                  {project.team.map((member) => (
                    <Tooltip key={member.id} title={member.name}>
                      <Avatar alt={member.name} src={member.avatar} />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              </Box>
            </Box>
          </CardContent>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 1
            }}
          >
            <IconButton
              onClick={handleMenuOpen}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      ) : (
        // Grid View
        <>
          <CardContent sx={{ flex: 1 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {project.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    size="small"
                    label={project.status}
                    sx={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}
                  />
                  <Chip
                    size="small"
                    label={project.priority}
                    sx={{ backgroundColor: getPriorityColor(project.priority) + '20', color: getPriorityColor(project.priority) }}
                  />
                </Box>
              </Box>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 1 }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {project.description}
            </Typography>

            {/* Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="textSecondary">
                  Progress
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {project.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={project.progress}
              />
            </Box>

            {/* Team */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AvatarGroup
                max={4}
                sx={{
                  '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.875rem' }
                }}
              >
                {project.team.map((member) => (
                  <Tooltip key={member.id} title={member.name}>
                    <Avatar alt={member.name} src={member.avatar} />
                  </Tooltip>
                ))}
              </AvatarGroup>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="textSecondary">
                  {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          </CardContent>

          <Divider />

          {/* Actions */}
          <CardActions sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View Details">
                <IconButton size="small">
                  <ViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={isStarred ? 'Unstar' : 'Star'}>
                <IconButton
                  size="small"
                  onClick={handleAction('star')}
                >
                  {isStarred ? (
                    <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">
                {project.totalTasks} tasks
              </Typography>
            </Box>
          </CardActions>
        </>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleAction('share')}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleAction('archive')}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          Archive
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleAction('delete')}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ProjectCard;