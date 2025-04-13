import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Avatar,
  AvatarGroup,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Assignment as TaskIcon,
  MoreVert as MoreVertIcon,
  Flag as PriorityIcon,
  DateRange as DateIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';
import { useSnackbar } from '../../context/SnackbarContext';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';
import LoadingScreen from '../common/LoadingScreen';
import EmptyState from '../common/EmptyState';

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'success'
};

const sortOptions = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'assignee', label: 'Assignee' }
];

const filterOptions = [
  { value: 'all', label: 'All Tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' }
];

const TaskList = ({ projectId }) => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTask,
    deleteTask
  } = useTasks(projectId);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [taskMenuAnchorEl, setTaskMenuAnchorEl] = useState(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleSortMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTaskMenuOpen = (event, task) => {
    event.stopPropagation();
    setTaskMenuAnchorEl(event.currentTarget);
    setSelectedTaskForMenu(task);
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchorEl(null);
    setSelectedTaskForMenu(null);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
    handleTaskMenuClose();
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      showSnackbar('Task deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete task', 'error');
    }
    handleTaskMenuClose();
  };

  const handleToggleStatus = async (task) => {
    try {
      await updateTask({
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed',
        completedAt: task.status === 'completed' ? null : new Date().toISOString()
      });
    } catch (error) {
      showSnackbar('Failed to update task status', 'error');
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filterBy === 'all') return true;
      if (filterBy === 'overdue') {
        return new Date(task.dueDate) < new Date() && task.status !== 'completed';
      }
      return task.status === filterBy;
    })
    .filter(task => {
      if (!searchQuery) return true;
      return (
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          return b.priority.localeCompare(a.priority);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'assignee':
          return (a.assignee?.name || '').localeCompare(b.assignee?.name || '');
        default:
          return 0;
      }
    });

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Tasks"
        description={error.message}
        action={
          <Button
            variant="contained"
            onClick={fetchTasks}
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
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between'
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: { sm: 1 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FilterIcon />}
            onClick={handleFilterMenuOpen}
            color="inherit"
          >
            Filter
          </Button>
          <Button
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            color="inherit"
          >
            Sort
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {/* Active Filters */}
      {(filterBy !== 'all' || searchQuery) && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filterBy !== 'all' && (
            <Chip
              label={`Status: ${filterOptions.find(option => option.value === filterBy)?.label}`}
              onDelete={() => setFilterBy('all')}
              color="primary"
              variant="outlined"
            />
          )}
          {searchQuery && (
            <Chip
              label={`Search: ${searchQuery}`}
              onDelete={() => setSearchQuery('')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No Tasks Found"
          description={
            searchQuery
              ? "No tasks match your search criteria"
              : "Get started by creating your first task"
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTask}
            >
              Create Task
            </Button>
          }
        />
      ) : (
        <Paper>
          <List>
            {filteredTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {index > 0 && <Divider />}
                <ListItem
                  button
                  onClick={() => handleViewTask(task)}
                  sx={{
                    opacity: task.status === 'completed' ? 0.7 : 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.status === 'completed'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(task);
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={task.priority}
                          color={priorityColors[task.priority]}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DateIcon fontSize="small" color="action" />
                          <Typography variant="caption">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {task.assignee && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Avatar
                              alt={task.assignee.name}
                              src={task.assignee.avatar}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography variant="caption">
                              {task.assignee.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => handleTaskMenuOpen(e, task)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Menus */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSortMenuClose}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              setSortBy(option.value);
              handleSortMenuClose();
            }}
            selected={sortBy === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        {filterOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              setFilterBy(option.value);
              handleFilterMenuClose();
            }}
            selected={filterBy === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={taskMenuAnchorEl}
        open={Boolean(taskMenuAnchorEl)}
        onClose={handleTaskMenuClose}
      >
        <MenuItem onClick={() => handleEditTask(selectedTaskForMenu)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTask(selectedTaskForMenu?.id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Task Form Dialog */}
      <TaskForm
        open={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        task={selectedTask}
        projectId={projectId}
      />

      {/* Task Details Dialog */}
      <TaskDetails
        open={isTaskDetailsOpen}
        onClose={() => setIsTaskDetailsOpen(false)}
        task={selectedTask}
        onEdit={() => {
          setIsTaskDetailsOpen(false);
          setIsTaskFormOpen(true);
        }}
      />
    </Box>
  );
};

export default TaskList;