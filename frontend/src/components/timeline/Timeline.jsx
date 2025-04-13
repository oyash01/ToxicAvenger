import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  FormControl,
  Select,
  MenuItem,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import MuiTimeline from '@mui/lab/Timeline';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Today as TodayIcon,
  Assignment as TaskIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  Attachment as AttachmentIcon,
  Star as StarIcon,
  Label as LabelIcon,
  Done as DoneIcon,
  Schedule as PendingIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useTimeline } from '../../hooks/useTimeline';
import { useSnackbar } from '../../context/SnackbarContext';
import LoadingScreen from '../common/LoadingScreen';
import EmptyState from '../common/EmptyState';

const eventTypes = {
  TASK_CREATED: {
    icon: TaskIcon,
    color: 'primary',
    label: 'Task Created'
  },
  TASK_UPDATED: {
    icon: EditIcon,
    color: 'info',
    label: 'Task Updated'
  },
  TASK_COMPLETED: {
    icon: DoneIcon,
    color: 'success',
    label: 'Task Completed'
  },
  COMMENT_ADDED: {
    icon: CommentIcon,
    color: 'secondary',
    label: 'Comment Added'
  },
  MEMBER_JOINED: {
    icon: PersonIcon,
    color: 'success',
    label: 'Member Joined'
  },
  MEMBER_LEFT: {
    icon: PersonIcon,
    color: 'error',
    label: 'Member Left'
  },
  FILE_UPLOADED: {
    icon: AttachmentIcon,
    color: 'info',
    label: 'File Uploaded'
  },
  STATUS_CHANGED: {
    icon: LabelIcon,
    color: 'warning',
    label: 'Status Changed'
  }
};

const filterOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'comments', label: 'Comments' },
  { value: 'members', label: 'Team Members' },
  { value: 'files', label: 'Files' }
];

const Timeline = ({ projectId }) => {
  const theme = useTheme();
  const { events, loading, error, fetchEvents, deleteEvent } = useTimeline(projectId);
  const { showSnackbar } = useSnackbar();

  // State
  const [filterBy, setFilterBy] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [projectId]);

  const handleFilterChange = (event) => {
    setFilterBy(event.target.value);
  };

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(selectedEvent.id);
      showSnackbar('Event deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete event', 'error');
    }
    setDeleteDialogOpen(false);
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter(event => {
    if (filterBy === 'all') return true;
    if (filterBy === 'tasks') {
      return ['TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED'].includes(event.type);
    }
    if (filterBy === 'comments') {
      return event.type === 'COMMENT_ADDED';
    }
    if (filterBy === 'members') {
      return ['MEMBER_JOINED', 'MEMBER_LEFT'].includes(event.type);
    }
    if (filterBy === 'files') {
      return event.type === 'FILE_UPLOADED';
    }
    return true;
  });

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Timeline"
        description={error.message}
        action={
          <Button
            variant="contained"
            onClick={fetchEvents}
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filterBy}
            onChange={handleFilterChange}
            displayEmpty
            startAdornment={
              <FilterIcon color="action" sx={{ mr: 1 }} />
            }
          >
            {filterOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<TodayIcon />}
          onClick={() => window.scrollTo(0, 0)}
        >
          Today
        </Button>
      </Box>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description={
            filterBy !== 'all'
              ? "No events match the selected filter"
              : "No activity has been recorded yet"
          }
          icon={TodayIcon}
        />
      ) : (
        <MuiTimeline>
          {filteredEvents.map((event, index) => {
            const EventIcon = eventTypes[event.type]?.icon || TaskIcon;
            const eventColor = eventTypes[event.type]?.color || 'default';

            return (
              <TimelineItem key={event.id}>
                <TimelineOppositeContent sx={{ flex: 0.2 }}>
                  <Typography variant="caption" color="textSecondary">
                    {format(new Date(event.timestamp), 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {format(new Date(event.timestamp), 'HH:mm')}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot color={eventColor}>
                    <EventIcon />
                  </TimelineDot>
                  {index < filteredEvents.length - 1 && <TimelineConnector />}
                </TimelineSeparator>

                <TimelineContent>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {eventTypes[event.type]?.label || 'Event'}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(event)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" gutterBottom>
                      {event.description}
                    </Typography>

                    {event.metadata && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {event.metadata.labels?.map((label, i) => (
                          <Chip
                            key={i}
                            size="small"
                            label={label}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    )}

                    {event.user && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                        <Avatar
                          src={event.user.avatar}
                          alt={event.user.name}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {event.user.name}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </MuiTimeline>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
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

export default Timeline;