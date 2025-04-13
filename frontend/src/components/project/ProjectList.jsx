import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Menu,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../common/PageHeader';
import EmptyState from '../common/EmptyState';
import LoadingScreen from '../common/LoadingScreen';

const sortOptions = [
  { value: 'updated', label: 'Last Updated' },
  { value: 'created', label: 'Created Date' },
  { value: 'name', label: 'Project Name' },
  { value: 'status', label: 'Status' }
];

const filterOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' }
];

const ProjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, error, fetchProjects } = useProjects();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle menu actions
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

  const handleSortChange = (value) => {
    setSortBy(value);
    handleSortMenuClose();
  };

  const handleFilterChange = (value) => {
    setFilterBy(value);
    handleFilterMenuClose();
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      if (filterBy === 'all') return true;
      return project.status === filterBy;
    })
    .filter(project => {
      if (!searchQuery) return true;
      return (
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Projects"
        description={error.message}
        action={
          <Button
            variant="contained"
            onClick={fetchProjects}
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
      <PageHeader
        title="Projects"
        description="Manage and track all your projects"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            New Project
          </Button>
        }
      />

      {/* Filters and Controls */}
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
          placeholder="Search projects..."
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
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: { xs: 'space-between', sm: 'flex-end' }
          }}
        >
          {/* Filter Button */}
          <Button
            startIcon={<FilterIcon />}
            onClick={handleFilterMenuOpen}
            color="inherit"
            sx={{ minWidth: 120 }}
          >
            {filterOptions.find(option => option.value === filterBy)?.label}
          </Button>

          {/* Sort Button */}
          <Button
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            color="inherit"
            sx={{ minWidth: 120 }}
          >
            Sort by: {sortOptions.find(option => option.value === sortBy)?.label}
          </Button>

          {/* View Toggle */}
          <IconButton
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            color="inherit"
          >
            {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterMenuClose}
        >
          {filterOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              selected={filterBy === option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Sort Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleSortMenuClose}
        >
          {sortOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              selected={sortBy === option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
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

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No Projects Found"
          description={
            searchQuery
              ? "No projects match your search criteria"
              : "Get started by creating your first project"
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/projects/new')}
            >
              Create Project
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid
              item
              key={project.id}
              xs={12}
              sm={viewMode === 'grid' ? 6 : 12}
              md={viewMode === 'grid' ? 4 : 12}
              lg={viewMode === 'grid' ? 3 : 12}
            >
              <ProjectCard
                project={project}
                viewMode={viewMode}
                onEdit={() => navigate(`/projects/${project.id}/edit`)}
                onDelete={() => handleDeleteProject(project.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProjectList;