import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  PersonAdd as PersonAddIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';

// TabPanel component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`notifications-tabpanel-${index}`}
    aria-labelledby={`notifications-tab-${index}`}
    {...other}
  >
    {value === index && children}
  </div>
);

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [error, setError] = useState('');

  // Mock notification types and their corresponding icons
  const notificationTypes = {
    comment: <CommentIcon />,
    mention: <StarIcon />,
    follow: <PersonAddIcon />,
    like: <FavoriteIcon />,
    share: <ShareIcon />,
    success: <CheckCircleIcon color="success" />,
    warning: <WarningIcon color="warning" />,
    code: <CodeIcon />,
    update: <UpdateIcon />
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Mock API call
        const mockNotifications = [
          {
            id: 1,
            type: 'comment',
            title: 'New Comment',
            message: 'John Doe commented on your post',
            user: {
              id: 1,
              name: 'John Doe',
              avatar: 'https://mui.com/static/images/avatar/1.jpg'
            },
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            link: '/posts/1#comment-1'
          },
          {
            id: 2,
            type: 'mention',
            title: 'Mention',
            message: 'Alice mentioned you in a discussion',
            user: {
              id: 2,
              name: 'Alice Smith',
              avatar: 'https://mui.com/static/images/avatar/2.jpg'
            },
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            link: '/discussions/1'
          },
          // Add more mock notifications as needed
        ];
        setNotifications(mockNotifications);
      } catch (err) {
        setError('Failed to load notifications');
        showSnackbar('Failed to load notifications', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [showSnackbar]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    navigate(notification.link);
  };

  // Handle menu open
  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      // Mock API call
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      showSnackbar('Failed to mark notification as read', 'error');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Mock API call
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      showSnackbar('All notifications marked as read', 'success');
    } catch (err) {
      showSnackbar('Failed to mark all notifications as read', 'error');
    }
  };

  // Delete notification
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      // Mock API call
      setNotifications(prev =>
        prev.filter(notification => notification.id !== selectedNotification.id)
      );
      showSnackbar('Notification deleted', 'success');
    } catch (err) {
      showSnackbar('Failed to delete notification', 'error');
    } finally {
      handleMenuClose();
      setDeleteDialog(false);
    }
  };

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter(notification => {
    switch (selectedTab) {
      case 0: // All
        return true;
      case 1: // Unread
        return !notification.read;
      case 2: // Mentions
        return notification.type === 'mention';
      default:
        return true;
    }
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Notifications
        </Typography>
        <Button
          variant="outlined"
          onClick={markAllAsRead}
          disabled={!notifications.some(n => !n.read)}
        >
          Mark All as Read
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                All
                <Chip
                  size="small"
                  label={notifications.length}
                  sx={{ ml: 1 }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Unread
                <Chip
                  size="small"
                  label={notifications.filter(n => !n.read).length}
                  sx={{ ml: 1 }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Mentions
                <Chip
                  size="small"
                  label={notifications.filter(n => n.type === 'mention').length}
                  sx={{ ml: 1 }}
                />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Notifications List */
        <Paper>
          <List>
            {filteredNotifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary="You're all caught up!"
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ) : (
              filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'inherit' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="primary"
                        variant="dot"
                        invisible={notification.read}
                      >
                        <Avatar src={notification.user.avatar}>
                          {notification.user.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 'bold'
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="textPrimary"
                            component="span"
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            component="div"
                          >
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true
                            })}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, notification)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            markAsRead(selectedNotification?.id);
            handleMenuClose();
          }}
          disabled={selectedNotification?.read}
        >
          <ListItemIcon>
            <DoneIcon fontSize="small" />
          </ListItemIcon>
          Mark as read
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialog(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this notification?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteNotification}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;