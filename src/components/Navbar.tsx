import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { useAuthStore } from '../store/authStore'; // Import the authentication store

interface NavBarProps {
  isAuthenticated: boolean; // Prop to determine if the user is logged in
}

const NavBar: React.FC<NavBarProps> = ({ isAuthenticated }) => {
  const logout = useAuthStore((state) => state.logout); // Access the logout function from the auth store
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogout = () => {
    logout(); // Clear user session
    navigate('/login'); // Redirect the user to the login page after logging out
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Task App
        </Typography>

        {isAuthenticated ? (
          <Box>
            <Button color="inherit" component={RouterLink} to="/tasks">
              List
            </Button>
            <Button color="inherit" component={RouterLink} to="/chart">
              Chart
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;