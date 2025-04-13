import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Work as RoleIcon
} from '@mui/icons-material';
import { useTeam } from '../../hooks/useTeam';
import { useSnackbar } from '../../context/SnackbarContext';
import TeamMemberForm from './TeamMemberForm';
import LoadingScreen from '../common/LoadingScreen';
import EmptyState from '../common/EmptyState';

const TeamMembers = ({ projectId }) => {
  const theme = useTheme();
  const { teamMembers, loading, error, fetchTeamMembers, removeTeamMember } = useTeam(projectId);
  const { showSnackbar } = useSnackbar();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMemberForMenu, setSelectedMemberForMenu] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  const handleMenuOpen = (event, member) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedMemberForMenu(member);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMemberForMenu(null);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await removeTeamMember(memberId);
      showSnackbar('Team member removed successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to remove team member', 'error');
    }
    handleMenuClose();
  };

  // Filter members
  const filteredMembers = teamMembers
    .filter(member => {
      if (filterBy === 'all') return true;
      return member.role === filterBy;
    })
    .filter(member => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower)
      );
    });

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Team Members"
        description={error.message}
        action={
          <Button
            variant="contained"
            onClick={fetchTeamMembers}
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
          placeholder="Search team members..."
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
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMember}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {/* Active Filters */}
      {filterBy !== 'all' && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Role: ${filterBy}`}
            onDelete={() => setFilterBy('all')}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          title="No Team Members Found"
          description={
            searchQuery
              ? "No team members match your search criteria"
              : "Get started by adding team members"
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMember}
            >
              Add Member
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {filteredMembers.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={member.avatar}
                    alt={member.name}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="h6" noWrap>
                      {member.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={member.role}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, member)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Contact Info */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MailIcon fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {member.email}
                    </Typography>
                  </Box>
                  {member.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {member.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Stats */}
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="caption" color="textSecondary">
                    Tasks Assigned: {member.tasksCount || 0}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menus */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditMember(selectedMemberForMenu)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteMember(selectedMemberForMenu?.id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">
            Remove
          </Typography>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem
          onClick={() => {
            setFilterBy('all');
            handleFilterMenuClose();
          }}
          selected={filterBy === 'all'}
        >
          All Roles
        </MenuItem>
        <Divider />
        {['Developer', 'Designer', 'Manager', 'QA'].map((role) => (
          <MenuItem
            key={role}
            onClick={() => {
              setFilterBy(role);
              handleFilterMenuClose();
            }}
            selected={filterBy === role}
          >
            {role}
          </MenuItem>
        ))}
      </Menu>

      {/* Team Member Form Dialog */}
      <TeamMemberForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        member={selectedMember}
        projectId={projectId}
      />
    </Box>
  );
};

export default TeamMembers;