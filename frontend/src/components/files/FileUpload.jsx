import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Code as CodeIcon,
  Archive as ZipIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useFiles } from '../../hooks/useFiles';
import { useSnackbar } from '../../context/SnackbarContext';
import { formatBytes } from '../../utils/format';

const fileTypeIcons = {
  'image/*': ImageIcon,
  'video/*': VideoIcon,
  'audio/*': AudioIcon,
  'text/plain': FileIcon,
  'text/css': CodeIcon,
  'text/html': CodeIcon,
  'application/json': CodeIcon,
  'application/javascript': CodeIcon,
  'application/zip': ZipIcon,
  'application/x-rar-compressed': ZipIcon,
  'application/pdf': FileIcon,
  'application/msword': FileIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileIcon,
  'application/vnd.ms-excel': FileIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileIcon,
  'application/vnd.ms-powerpoint': FileIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileIcon
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = Object.keys(fileTypeIcons);

const FileUpload = ({ open, onClose, projectId }) => {
  const theme = useTheme();
  const { uploadFiles } = useFiles(projectId);
  const { showSnackbar } = useSnackbar();

  // State
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileDescriptions, setFileDescriptions] = useState({});

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        let errorMessage = 'File rejected: ';
        errors.forEach(error => {
          switch (error.code) {
            case 'file-too-large':
              errorMessage += `File is larger than ${formatBytes(MAX_FILE_SIZE)}`;
              break;
            case 'file-invalid-type':
              errorMessage += 'File type not supported';
              break;
            default:
              errorMessage += error.message;
          }
        });
        showSnackbar(errorMessage, 'error');
      });
    }

    // Add accepted files
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending'
      }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: ALLOWED_FILE_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    multiple: true
  });

  const handleRemoveFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    setFileDescriptions(prev => {
      const { [fileId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleDescriptionChange = (fileId, description) => {
    setFileDescriptions(prev => ({
      ...prev,
      [fileId]: description
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      await Promise.all(files.map(async ({ file, id }) => {
        try {
          setUploadProgress(prev => ({ ...prev, [id]: 0 }));

          await uploadFiles({
            file,
            description: fileDescriptions[id] || '',
            onProgress: (progress) => {
              setUploadProgress(prev => ({ ...prev, [id]: progress }));
            }
          });

          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === id ? { ...f, status: 'success' } : f
            )
          );
          successCount++;
        } catch (error) {
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === id ? { ...f, status: 'error', error: error.message } : f
            )
          );
          errorCount++;
        }
      }));

      if (successCount > 0) {
        showSnackbar(
          `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`,
          'success'
        );
      }
      
      if (errorCount === 0) {
        handleClose();
      }
    } catch (error) {
      showSnackbar('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setFileDescriptions({});
    setUploadProgress({});
    onClose();
  };

  const getFileIcon = (fileType) => {
    const Icon = Object.entries(fileTypeIcons).find(([pattern]) =>
      new RegExp(pattern.replace('*', '.*')).test(fileType)
    )?.[1] || FileIcon;
    return <Icon />;
  };

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : handleClose}
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
          Upload Files
          {!uploading && (
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Drop Zone */}
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 1,
            p: 3,
            mb: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? 'Drop the files here'
              : 'Drag and drop files here, or click to select files'
          }
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Maximum file size: {formatBytes(MAX_FILE_SIZE)}
          </Typography>
          <Box sx={{ mt: 1 }}>
            {ALLOWED_FILE_TYPES.map((type) => (
              <Chip
                key={type}
                label={type.replace('/*', '')}
                size="small"
                icon={getFileIcon(type)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </Box>

        {/* File List */}
        {files.length > 0 && (
          <List>
            {files.map(({ file, id, status, error }) => (
              <ListItem key={id}>
                <ListItemIcon>
                  {getFileIcon(file.type)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {formatBytes(file.size)}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add description (optional)"
                        value={fileDescriptions[id] || ''}
                        onChange={(e) => handleDescriptionChange(id, e.target.value)}
                        disabled={uploading || status === 'success'}
                        sx={{ mt: 1 }}
                      />
                      {uploadProgress[id] !== undefined && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={uploadProgress[id]}
                            color={status === 'error' ? 'error' : 'primary'}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {uploadProgress[id]}%
                          </Typography>
                        </Box>
                      )}
                      {error && (
                        <Typography variant="caption" color="error">
                          {error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {status === 'success' ? (
                    <SuccessIcon color="success" />
                  ) : status === 'error' ? (
                    <ErrorIcon color="error" />
                  ) : (
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(id)}
                      disabled={uploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          startIcon={<UploadIcon />}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUpload;