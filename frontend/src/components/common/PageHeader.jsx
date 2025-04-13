import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  backButton = false,
  status = null,
  divider = true,
  sticky = false,
  onBack,
  extraContent = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Filter primary and secondary actions
  const primaryActions = actions.filter(action => !action.secondary);
  const secondaryActions = actions.filter(action => action.secondary);

  // Status chip configuration
  const getStatusConfig = () => {
    if (!status) return null;

    const statusConfigs = {
      draft: { color: 'default', label: 'Draft' },
      published: { color: 'success', label: 'Published' },
      pending: { color: 'warning', label: 'Pending' },
      archived: { color: 'error', label: 'Archived' }
    };

    return statusConfigs[status] || { color: 'default', label: status };
  };

  const statusConfig = getStatusConfig();

  return (
    <Box
      sx={{
        pb: 3,
        ...(sticky && {
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar - 1,
          backgroundColor: theme.palette.background.default,
          borderBottom: divider ? `1px solid ${theme.palette.divider}` : 'none'
        })
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return isLast ? (
              <Typography
                key={breadcrumb.path || index}
                color="textPrimary"
                variant="body2"
              >
                {breadcrumb.label}
              </Typography>
            ) : (
              <Link
                key={breadcrumb.path || index}
                component={RouterLink}
                to={breadcrumb.path}
                color="inherit"
                variant="body2"
                sx={{
                  '&:hover': {
                    textDecoration: 'none',
                    color: theme.palette.primary.main
                  }
                }}
              >
                {breadcrumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        {/* Left Side - Title and Subtitle */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {backButton && (
              <IconButton
                onClick={handleBack}
                size="small"
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </Typography>
            {statusConfig && (
              <Chip
                size="small"
                color={statusConfig.color}
                label={statusConfig.label}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Right Side - Actions */}
        {actions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}
          >
            {/* Secondary Actions */}
            {!isMobile && secondaryActions.map((action, index) => (
              <Tooltip
                key={index}
                title={action.tooltip || action.label}
              >
                <Button
                  size="small"
                  startIcon={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  color="inherit"
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}

            {/* Primary Actions */}
            {primaryActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                size={action.size || 'medium'}
              >
                {!isMobile && action.label}
              </Button>
            ))}

            {/* Mobile Menu for Secondary Actions */}
            {isMobile && secondaryActions.length > 0 && (
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Extra Content */}
      {extraContent && (
        <Box sx={{ mt: 2 }}>
          {extraContent}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;