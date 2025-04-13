import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  SearchOff as SearchOffIcon,
  AddCircleOutline as AddIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  FolderOpen as FolderIcon,
  Timeline as TimelineIcon,
  List as ListIcon
} from '@mui/icons-material';

const EmptyState = ({
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  type = 'default',
  action = null,
  icon = null,
  image = null,
  maxWidth = 400,
  paperProps = {},
  compact = false
}) => {
  const theme = useTheme();

  // Predefined types with their default configurations
  const types = {
    default: {
      icon: <ListIcon sx={{ fontSize: 48 }} />,
      color: theme.palette.text.secondary
    },
    search: {
      icon: <SearchOffIcon sx={{ fontSize: 48 }} />,
      color: theme.palette.info.main,
      title: 'No Results Found',
      description: 'Try adjusting your search criteria.'
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: 48 }} />,
      color: theme.palette.error.main,
      title: 'Error Loading Data',
      description: 'There was a problem loading the data. Please try again.'
    },
    noFiles: {
      icon: <FolderIcon sx={{ fontSize: 48 }} />,
      color: theme.palette.warning.main,
      title: 'No Files Found',
      description: 'Upload files to get started.'
    },
    noActivity: {
      icon: <TimelineIcon sx={{ fontSize: 48 }} />,
      color: theme.palette.info.main,
      title: 'No Recent Activity',
      description: 'There has been no activity in this period.'
    }
  };

  const currentType = types[type] || types.default;
  const IconComponent = icon || currentType.icon;
  const iconColor = currentType.color;

  const defaultAction = {
    label: 'Refresh',
    icon: <RefreshIcon />,
    onClick: () => window.location.reload(),
    variant: 'contained'
  };

  const renderAction = () => {
    if (!action && type !== 'default') return defaultAction;
    return action;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 2 : 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        maxWidth: maxWidth,
        mx: 'auto',
        backgroundColor: 'transparent',
        ...paperProps.sx
      }}
      {...paperProps}
    >
      {/* Icon or Image */}
      {image ? (
        <Box
          component="img"
          src={image}
          alt={title}
          sx={{
            width: compact ? 120 : 200,
            height: 'auto',
            mb: compact ? 2 : 3
          }}
        />
      ) : (
        <Box
          sx={{
            mb: compact ? 2 : 3,
            width: compact ? 60 : 80,
            height: compact ? 60 : 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(iconColor, 0.1),
            color: iconColor
          }}
        >
          {IconComponent}
        </Box>
      )}

      {/* Title */}
      <Typography
        variant={compact ? 'h6' : 'h5'}
        gutterBottom
        color="textPrimary"
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ mb: action ? (compact ? 2 : 3) : 0 }}
      >
        {description}
      </Typography>

      {/* Action Button */}
      {renderAction() && (
        <Button
          variant={renderAction().variant || 'contained'}
          startIcon={renderAction().icon || <AddIcon />}
          onClick={renderAction().onClick}
          size={compact ? 'small' : 'medium'}
        >
          {renderAction().label}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;