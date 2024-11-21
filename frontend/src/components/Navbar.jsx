import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Divider,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: 200,
    marginTop: theme.spacing(1),
    boxShadow: theme.shadows[3],
  },
}));

const Navbar = () => {
  const { username, isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, onClick: () => navigate('/') },
  ];

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        {isMobile && isLoggedIn && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          component={RouterLink}
          to="/"
          sx={{ 
            flexGrow: isMobile ? 1 : 0,
            color: 'white',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}
        >
          {!isMobile && "TaskTree"}
        </Typography>

        {isLoggedIn && !isMobile && (
          <Box sx={{ ml: 4, flex: 1, display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              sx={{
                opacity: location.pathname === '/' ? 1 : 0.8,
                fontWeight: location.pathname === '/' ? 700 : 400,
              }}
            >
              Dashboard
            </Button>
          </Box>
        )}

        {isLoggedIn ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account settings">
              <UserInfo onClick={handleProfileMenuOpen}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  {username?.[0]?.toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <Typography variant="subtitle2" sx={{ color: 'white' }}>
                    {username}
                  </Typography>
                )}
              </UserInfo>
            </Tooltip>

            <StyledMenu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    item.onClick();
                    handleProfileMenuClose();
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </StyledMenu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="secondary"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;