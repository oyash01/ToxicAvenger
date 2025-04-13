import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Group as TeamIcon,
  Folder as ProjectIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DocumentIcon,
  Assessment as ReportIcon,
  Star as StarIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const DRAWER_WIDTH = 240;

const menuItems = [
  {
    title: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard'
  },
  {
    title: 'Projects',
    icon: ProjectIcon,
    path: '/projects',
    submenu: [
      { title: 'All Projects', path: '/projects' },
      { title: 'Active', path: '/projects/active' },
      { title: 'Archived', path: '/projects/archived' },
      { title: 'Templates', path: '/projects/templates' }
    ]
  },
  {
    title: 'Tasks',
    icon: TaskIcon,
    path: '/tasks',
    submenu: [
      { title: 'My Tasks', path: '/tasks' },
      { title: 'Assigned to Me', path: '/tasks/assigned' },
      { title: 'Created by Me', path: '/tasks/created' },
      { title: 'Calendar View', path: '/tasks/calendar' }
    ]
  },
  {
    title: 'Team',
    icon: TeamIcon,
    path: '/team',
    submenu: [
      { title: 'Members', path: '/team/members' },
      { title: 'Roles', path: '/team/roles' },
      { title: 'Departments', path: '/team/departments' }
    ]
  },
  {
    title: 'Documents',
    icon: DocumentIcon,
    path: '/documents',
    submenu: [
      { title: 'All Files', path: '/documents' },
      { title: 'Shared with Me', path: '/documents/shared' },
      { title: 'Recent', path: '/documents/recent' }
    ]
  },
  {
    title: 'Timeline',
    icon: TimelineIcon,
    path: '/timeline'
  },
  {
    title: 'Reports',
    icon: ReportIcon,
    path: '/reports',
    submenu: [
      { title: 'Overview', path: '/reports' },
      { title: 'Project Reports', path: '/reports/projects' },
      { title: 'Team Reports', path: '/reports/team' },
      { title: 'Custom Reports', path: '/reports/custom' }
    ]
  }
];

const bottomMenuItems = [
  {
    title: 'Settings',
    icon: SettingsIcon,
    path: '/settings'
  },
  {
    title: 'Help & Support',
    icon: HelpIcon,
    path: '/help'
  }
];

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleNavigate = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const toggleSubmenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isCurrentPath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item) => {
    const isSelected = isCurrentPath(item.path);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.title];

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isSelected}
            onClick={() => hasSubmenu ? toggleSubmenu(item.title) : handleNavigate(item.path)}
            sx={{
              minHeight: 48,
              px: 2.5,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 0, 
              mr: 2,
              color: isSelected ? 'primary.main' : 'inherit'
            }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                color: isSelected ? 'primary' : 'inherit'
              }}
            />
            {hasSubmenu && (
              isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
            )}
          </ListItemButton>
        </ListItem>

        {hasSubmenu && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.submenu.map((subItem) => (
                <ListItemButton
                  key={subItem.title}
                  selected={isCurrentPath(subItem.path)}
                  onClick={() => handleNavigate(subItem.path)}
                  sx={{
                    pl: 6,
                    py: 1,
                    minHeight: 36,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  <ListItemText 
                    primary={subItem.title}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: isCurrentPath(subItem.path) ? 'primary' : 'inherit'
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.paper' 
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" noWrap component="div">
          ProjectHub
        </Typography>
        {variant === 'temporary' && (
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Quick Actions */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
        >
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => handleNavigate('/projects/new')}
          >
            <ProjectIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleNavigate('/tasks/new')}
          >
            <TaskIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleNavigate('/documents/upload')}
          >
            <DocumentIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* Main Menu */}
      <List sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        {menuItems.map(renderMenuItem)}
      </List>

      <Divider />

      {/* Bottom Menu */}
      <List sx={{ px: 1 }}>
        {bottomMenuItems.map(renderMenuItem)}
      </List>

      {/* User Stats */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Active Projects: 12
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Tasks Due Today: 5
        </Typography>
      </Box>
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawer}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
          borderRight: 1,
          borderColor: 'divider',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...(!open && {
            width: theme.spacing(7),
            overflowX: 'hidden',
          }),
        },
      }}
      open={open}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;