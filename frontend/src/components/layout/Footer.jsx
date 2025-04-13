import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  Stack,
  IconButton,
  useTheme
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[900]
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          {/* Copyright */}
          <Typography variant="body2" color="text.secondary">
            © {year} ProjectHub. All rights reserved.
          </Typography>

          {/* Links */}
          <Stack
            direction="row"
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Link
              href="/privacy"
              color="inherit"
              underline="hover"
              variant="body2"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              color="inherit"
              underline="hover"
              variant="body2"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              color="inherit"
              underline="hover"
              variant="body2"
            >
              Contact Us
            </Link>
          </Stack>

          {/* Social Links */}
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              color="inherit"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="inherit"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="inherit"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;