import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Description as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Code as CodeIcon,
  Archive as ZipIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { formatDistance, formatBytes } from '../../utils/format';
import { useFiles } from '../../hooks/useFiles';
import { useSnackbar } from '../../context/SnackbarContext';
import FileUpload from './FileUpload';
import LoadingScreen from '../common/LoadingScreen';
import EmptyState from '../common/EmptyState';

const fileTypeIcons = {
  image: ImageIcon,
  video: VideoIcon,
  audio: AudioIcon,
  code: CodeIcon,
  archive: ZipIcon,
  document: FileIcon
};

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Upload Date' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' }
];

const filterOptions = [
  { value: 'all', label: 'All Files' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
  { value: 'code', label: 'Code Files' },
  { value: 'archive', label: 'Archives' }
];

const FileList = ({ projectId }) => {
  const theme = useTheme();
  const { files, loading, error, fetchFiles, deleteFile, downloadFile } = useFiles(projectId);
  const { showSnackbar } = useSnackbar();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleMenuOpen = (event, file) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedFile(null);
  };

  const handleSortMenuOpen = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.id);
      showSnackbar('File download started', 'success');
    } catch (error) {
      showSnackbar('Failed to download file', 'error');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await deleteFile(selectedFile.id);
      showSnackbar('File deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete file', 'error');
    }
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      if (filterBy === 'all') return true;
      return file.type === filterBy;
    })
    .filter(file => {
      if (!searchQuery) return true;
      return (
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
    });

  const getFileIcon = (type) => {
    const Icon = fileTypeIcons[type] || FileIcon;
    return <Icon />;
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <EmptyState
        title="Error Loading Files"
        description={error.message}
        action={
          <Button
            variant="contained"
            onClick={fetchFiles}
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
          placeholder="Search files..."
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
            startIcon={<UploadIcon />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload
          </Button>
        </Box>
      </Box>

      {/* Active Filters */}
      {(filterBy !== 'all' || searchQuery) && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filterBy !== 'all' && (
            <Chip
              label={`Type: ${filterOptions.find(option => option.value === filterBy)?.label}`}
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

      {/* File Grid */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          title="No Files Found"
          description={
            searchQuery
              ? "No files match your search criteria"
              : "Get started by uploading your first file"
          }
          action={
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setIsUploadOpen(true)}
            >
              Upload Files
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {filteredFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
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
                {/* File Icon/Preview */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 120,
                    mb: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }}
                >
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </Box>

                {/* File Info */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {file.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, file)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="caption" color="textSecondary" display="block">
                    {formatBytes(file.size)}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar
                      src={file.uploadedBy.avatar}
                      alt={file.uploadedBy.name}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {formatDistance(new Date(file.uploadedAt), new Date(), { addSuffix: true })}
                    </Typography>
                  </Box>
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
        <MenuItem onClick={() => handleDownload(selectedFile)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          Download
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedFile?.name}"? This action cannot be undone.
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

      {/* File Upload Dialog */}
      <FileUpload
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        projectId={projectId}
      />
    </Box>
  );
};

export default FileList;