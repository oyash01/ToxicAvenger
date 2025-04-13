import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  useTheme,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const ConfirmationDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  type = 'warning',
  error = '',
  maxWidth = 'sm',
  confirmButtonProps = {},
  cancelButtonProps = {},
  showCloseButton = true,
  contentComponent: ContentComponent = null
}) => {
  const theme = useTheme();

  // Icon and color based on type
  const getTypeProperties = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <ErrorIcon sx={{ fontSize: 40 }} />,
          color: theme.palette.error.main,
          backgroundColor: theme.palette.error.light
        };
      case 'success':
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
          color: theme.palette.success.main,
          backgroundColor: theme.palette.success.light
        };
      case 'info':
        return {
          icon: <InfoIcon sx={{ fontSize: 40 }} />,
          color: theme.palette.info.main,
          backgroundColor: theme.palette.info.light
        };
      case 'warning':
      default:
        return {
          icon: <WarningIcon sx={{ fontSize: 40 }} />,
          color: theme.palette.warning.main,
          backgroundColor: theme.palette.warning.light
        };
    }
  };

  const { icon, color, backgroundColor } = getTypeProperties();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        elevation: 24
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor,
              color
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onCancel}
            sx={{
              color: theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {ContentComponent ? (
          <ContentComponent />
        ) : (
          <Typography variant="body1">
            {message}
          </Typography>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          {...cancelButtonProps}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          color={type === 'danger' ? 'error' : 'primary'}
          startIcon={loading && <CircularProgress size={20} />}
          {...confirmButtonProps}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;