import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AttachFile as FileIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  FileCopy as CopyIcon
} from '@mui/icons-material';

const FileUploader = ({
  accept = '*/*',
  multiple = false,
  maxFiles = 10,
  maxSize = 5242880, // 5MB
  onUpload,
  onChange,
  value = [],
  error = null,
  helperText = '',
  disabled = false,
  preview = true,
  dragDrop = true,
  showFileList = true,
  uploading = false,
  progress = 0,
  variant = 'standard', // 'standard' | 'compact' | 'dropzone'
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState(value);
  const [previewUrls, setPreviewUrls] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    setFiles(value);
  }, [value]);

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const generatePreviewUrl = (file) => {
    if (!file || !preview) return null;
    
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [file.name]: url }));
      return url;
    }
    return null;
  };

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => {
      // Check file size
      if (file.size > maxSize) {
        console.error(`File ${file.name} is too large`);
        return false;
      }
      // Check file type if accept is specified
      if (accept !== '*/*' && !accept.split(',').some(type => {
        if (type.startsWith('.')) {
          return file.name.endsWith(type);
        }
        return file.type.match(new RegExp(type.replace('*', '.*')));
      })) {
        console.error(`File ${file.name} type not accepted`);
        return false;
      }
      return true;
    });

    if (multiple) {
      const newFileList = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(newFileList);
      newFileList.forEach(generatePreviewUrl);
      if (onChange) onChange(newFileList);
      if (onUpload) onUpload(validFiles);
    } else {
      const newFile = validFiles[0];
      if (newFile) {
        setFiles([newFile]);
        generatePreviewUrl(newFile);
        if (onChange) onChange([newFile]);
        if (onUpload) onUpload([newFile]);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = (file) => {
    setFileToDelete(file);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    const newFiles = files.filter(f => f !== fileToDelete);
    setFiles(newFiles);
    if (onChange) onChange(newFiles);
    if (previewUrls[fileToDelete.name]) {
      URL.revokeObjectURL(previewUrls[fileToDelete.name]);
      setPreviewUrls(prev => {
        const { [fileToDelete.name]: _, ...rest } = prev;
        return rest;
      });
    }
    setDeleteDialog(false);
    setFileToDelete(null);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <ImageIcon />;
    if (file.type === 'application/pdf') return <PdfIcon />;
    if (file.type.includes('word') || file.type.includes('document')) return <DocIcon />;
    return <FileIcon />;
  };

  const renderDropzone = () => (
    <Box
      sx={{
        border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 1,
        p: 3,
        textAlign: 'center',
        backgroundColor: dragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        }
      }}
      onClick={() => fileInputRef.current?.click()}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Drop files here or click to upload
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {accept !== '*/*' ? `Accepted formats: ${accept}` : 'All file types accepted'}
      </Typography>
      {maxSize && (
        <Typography variant="body2" color="textSecondary">
          Max file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
        </Typography>
      )}
    </Box>
  );

  const renderFileList = () => (
    <List>
      {files.map((file, index) => (
        <ListItem
          key={index}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            mb: 1,
          }}
        >
          <ListItemIcon>
            {getFileIcon(file)}
          </ListItemIcon>
          <ListItemText
            primary={file.name}
            secondary={`${(file.size / 1024).toFixed(1)} KB`}
          />
          <ListItemSecondaryAction>
            {!disabled && (
              <IconButton
                edge="end"
                onClick={() => handleDelete(file)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      {uploading && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="textSecondary">
            Uploading... {progress}%
          </Typography>
        </Box>
      )}
    </List>
  );

  return (
    <Box>
      {variant === 'dropzone' ? (
        renderDropzone()
      ) : (
        <Box>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            fullWidth={variant === 'standard'}
          >
            {multiple ? 'Upload Files' : 'Upload File'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
            disabled={disabled}
          />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Helper Text */}
      {helperText && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* File List */}
      {showFileList && files.length > 0 && renderFileList()}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {fileToDelete?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
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

export default FileUploader;