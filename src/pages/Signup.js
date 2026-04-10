import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function Signup() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    // If not authenticated and not loading, redirect to Auth0 signup
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
        },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  // If already authenticated, redirect to home/dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show loading while redirecting
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Redirecting to sign up...
      </Typography>
    </Box>
  );
}
