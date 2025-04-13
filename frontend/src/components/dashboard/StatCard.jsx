import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton
} from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary', onClick }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: (theme) => theme.shadows[4],
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease-in-out'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Typography
            variant="subtitle2"
            color="textSecondary"
            component="div"
          >
            {title}
          </Typography>
          <IconButton
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              '&:hover': {
                backgroundColor: `${color}.light`
              }
            }}
            size="small"
          >
            {icon}
          </IconButton>
        </Box>
        <Typography variant="h4" component="div">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;