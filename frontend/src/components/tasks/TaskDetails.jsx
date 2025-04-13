import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  LinearProgress,
  Grid,
  useTheme,
  Link
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as PriorityIcon,
  Assignment as TaskIcon,
  DateRange as DateIcon,
  Person as AssigneeIcon,
  Label as LabelIcon,
  AttachFile as AttachmentIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { useSnackbar } from '../../context/SnackbarContext';

const TaskDetails = ({
  open,
  onClose,
  task,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { updateTask } = useTasks();
  const { showSnackbar } = useSnackbar();

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'comments' | 'history'

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask({
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      });
      showSnackbar('Task status updated', 'success');
    } catch (error) {
      showSnackbar('Failed to update task status', 'error');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await updateTask({
        ...task,
        comments: [
          ...(task.comments || []),
          {
            id: Date.now(),
            text: comment,
            user: {
              id: user.id,
              name: user.displayName,
              avatar: user.photoURL
            },
            createdAt: new Date().toISOString()
          }
        ]
      });
      setComment('');
      showSnackbar('Comment added', 'success');
    } catch (error) {
      showSnackbar('Failed to add comment', 'error');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <Typography variant="h6" component="div">
            Task Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={onEdit} size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVertIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left Column - Task Details */}
          <Grid item xs={12} md={8}>
            {/* Title and Status */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {task.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={task.status === 'completed' ? <CompletedIcon /> : <PendingIcon />}
                  label={task.status}
                  color={task.status === 'completed' ? 'success' : 'default'}
                />
                <Chip
                  icon={<PriorityIcon />}
                  label={task.priority}
                  sx={{
                    color: getPriorityColor(task.priority),
                    borderColor: getPriorityColor(task.priority)
                  }}
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Description */}
            <Typography variant="body1" sx={{ mb: 3 }}>
              {task.description}
            </Typography>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Labels
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {task.labels.map((label, index) => (
                    <Chip
                      key={index}
                      label={label}
                      size="small"
                      icon={<LabelIcon />}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments
                </Typography>
                <List dense>
                  {task.attachments.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          <AttachmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.name}
                        secondary={file.size}
                      />
                      <IconButton component={Link} href={file.url} download>
                        <DownloadIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Comments */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Comments
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                  >
                    Add Comment
                  </Button>
                </Box>
              </Box>
              <List>
                {task.comments?.map((comment) => (
                  <ListItem
                    key={comment.id}
                    alignItems="flex-start"
                    sx={{ px: 0 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={comment.user.avatar} alt={comment.user.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {comment.user.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.text}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Right Column - Task Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Due Date */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Due Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateIcon color="action" />
                  <Typography>
                    {format(new Date(task.dueDate), 'PPP')}
                  </Typography>
                </Box>
              </Box>

              {/* Assignee */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Assignee
                </Typography>
                {task.assignee ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography>
                      {task.assignee.name}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No assignee
                  </Typography>
                )}
              </Box>

              {/* Progress */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress || 0}
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body2">
                    {task.progress || 0}%
                  </Typography>
                </Box>
              </Box>

              {/* Created/Updated Info */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
              {task.updatedAt && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Close
        </Button>
        <Button
          variant="contained"
          color={task.status === 'completed' ? 'error' : 'success'}
          onClick={() => handleStatusChange(task.status === 'completed' ? 'pending' : 'completed')}
        >
          {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
        </Button>
      </DialogActions>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={onEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Task
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share Task
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={onDelete}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete Task
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default TaskDetails;