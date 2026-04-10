import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading: auth0Loading, user: auth0User } = useAuth0();
  
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, accepting, redirecting, error
  const hasRedirected = useRef(false);
  const hasAccepted = useRef(false);

  // Fetch invite details
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
      } catch (err) {
        setError(err.message);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    if (!auth0Loading) {
      fetchInvite();
    }
  }, [token, auth0Loading]);

  // Auto-redirect to Auth0 if not authenticated
  useEffect(() => {
    if (auth0Loading || loading || !invite || hasRedirected.current) return;
    
    if (!isAuthenticated) {
      hasRedirected.current = true;
      setStatus('redirecting');
      
      // Store the invite token so we can process it after login
      localStorage.setItem('pendingInviteToken', token);
      
      // Redirect to Auth0 signup with email pre-filled
      // User will create their account and set their password
      loginWithRedirect({
        authorizationParams: {
          login_hint: invite.email, // Pre-fill the email
          screen_hint: 'signup',
        },
        appState: {
          returnTo: `/invite/${token}`,
        },
      });
    }
  }, [auth0Loading, loading, invite, isAuthenticated, token, loginWithRedirect]);

  // Auto-accept invite when authenticated
  useEffect(() => {
    if (auth0Loading || loading || !invite || !isAuthenticated || hasAccepted.current) return;
    
    const acceptInvite = async () => {
      hasAccepted.current = true;
      setStatus('accepting');
      
      try {
        // Wait a moment for JWT token to be ready
        let jwtToken = localStorage.getItem('token');
        let attempts = 0;
        while (!jwtToken && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          jwtToken = localStorage.getItem('token');
          attempts++;
        }
        
        if (!jwtToken) {
          throw new Error('Authentication failed. Please try again.');
        }
        
        const response = await fetch(`${API_URL}/invites/${token}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to accept invitation');
        }

        // Clear the pending invite token
        localStorage.removeItem('pendingInviteToken');
        
        // Success! Redirect to invited user onboarding
        navigate('/invited-onboarding');
      } catch (err) {
        setError(err.message);
        setStatus('error');
        hasAccepted.current = false;
      }
    };

    acceptInvite();
  }, [auth0Loading, loading, invite, isAuthenticated, token, navigate]);

  // Loading states
  if (auth0Loading || loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading invitation...</Typography>
        </Stack>
      </Container>
    );
  }

  // Error state
  if (error || status === 'error') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h5" color="error">
              Unable to Accept Invitation
            </Typography>
            <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Please make sure you're logging in with the email address the invitation was sent to: <strong>{invite?.email}</strong>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Redirecting to Auth0
  if (status === 'redirecting' || (!isAuthenticated && invite)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <CircularProgress />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Setting up your account...
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary">
              You'll be redirected to create your password.
            </Typography>
            <Alert severity="info" sx={{ width: '100%' }}>
              <Typography variant="body2">
                <strong>First time?</strong> On the login page, click "Forgot password?" to set your password.
              </Typography>
            </Alert>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Accepting invite (authenticated)
  if (status === 'accepting' || isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <CircularProgress />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Joining {invite?.organisationName}...
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary">
              Just a moment while we set up your account.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Fallback loading
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress />
        <Typography>Processing invitation...</Typography>
      </Stack>
    </Container>
  );
}
