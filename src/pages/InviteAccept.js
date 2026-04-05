import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading: auth0Loading, getAccessTokenSilently } = useAuth0();
  
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await fetch(`${API_URL}/invites/${token}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This invite link is invalid or has expired.');
          }
          throw new Error('Failed to load invite');
        }
        const data = await response.json();
        setInvite(data);
        
        // Store invite token for after login
        localStorage.setItem('pendingInviteToken', token);
        
        // If user is already authenticated, they can accept the invite directly
        // Otherwise, they'll need to log in first
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!auth0Loading) {
      fetchInvite();
    }
  }, [token, auth0Loading]);

  const handleAcceptInvite = async () => {
    if (isAuthenticated) {
      // User is already logged in - process the invite acceptance
      try {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`${API_URL}/invites/${token}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to accept invitation');
        }

        // Success - redirect to home/dashboard
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Store the invite token so we can process it after login
      localStorage.setItem('pendingInviteToken', token);
      
      // Redirect to Auth0 login/signup
      loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
        },
        appState: {
          returnTo: `/invite/${token}`,
        },
      });
    }
  };

  if (loading || auth0Loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading invitation...</Typography>
        </Stack>
      </Container>
    );
  }

  // If user is authenticated but we don't have the invite yet, they may have just come from Auth0
  // Redirect them to login page which will handle the invite acceptance after
  if (isAuthenticated && !invite && !error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Setting up your account...</Typography>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h5" color="error">
              Invalid Invitation
            </Typography>
            <Alert severity="error">{error}</Alert>
            {!isAuthenticated && (
              <Button variant="contained" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    );
  }

  // If already authenticated, show the acceptance button that will process the invite
  if (isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#002060' }}>
              You're Invited!
            </Typography>
            
            <Typography variant="body1" textAlign="center">
              You've been invited to join <strong>{invite?.organisationName}</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Click below to accept and join the organization.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleAcceptInvite}
              sx={{ mt: 2 }}
            >
              Accept Invitation
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Not authenticated - show login prompt
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#002060' }}>
            You're Invited!
          </Typography>
          
          <Typography variant="body1" textAlign="center">
            You've been invited to join <strong>{invite?.organisationName}</strong>
          </Typography>
          
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Click below to create your account or sign in to accept the invitation.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleAcceptInvite}
            sx={{ mt: 2 }}
          >
            Accept Invitation
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
