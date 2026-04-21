import React, { useState, useEffect } from 'react';
import { Button, Stack, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import posthog from 'posthog-js';
import { loginSuccess, setToken, setOrganisation } from './authSlice';
import { getSessionExpiredMessage } from '../../utils/sessionManager';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

export default function Login() {
  const { user, isLoading, loginWithRedirect } = useAuth0();
  const dispatch = useDispatch();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);
  const hasToken = !!localStorage.getItem('token');

  // Check for session expired message on mount
  useEffect(() => {
    const expiredMessage = getSessionExpiredMessage();
    if (expiredMessage) {
      setSessionExpiredMessage(expiredMessage);
    }
  }, []);

  // When Auth0 user is present, get token and check onboarding
  useEffect(() => {
    const handleAuth0User = async () => {
      // Skip if still loading Auth0 or if there's no user and no token
      if (isLoading) return;
      if (!user && !hasToken) return;
      
      // If user has Auth0 and we haven't checked yet, check onboarding
      if (!user && hasToken) {
        return;
      }
      
      setIsCheckingOnboarding(true);
      
      // Always get a fresh token for Auth0 user to ensure it's valid
      let token = null;
      try {
        const response = await fetch(`${API_URL}/auth/auth0-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth0UserId: user.sub,
            email: user.email,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.tokens?.access?.token) {
            token = data.tokens.access.token;
            localStorage.setItem('token', token);
            // Store user email for display persistence
            if (user.email) {
              localStorage.setItem('userEmail', user.email);
            }
            dispatch(setToken(token));
            dispatch(loginSuccess(data.user));

            posthog.identify(user.sub, {
              email: user.email,
              name: user.name,
            });
            if (data.isNewUser) {
              posthog.capture('user_signed_up', { email: user.email });
            } else {
              posthog.capture('user_logged_in', { email: user.email });
            }
            
            // Check if backend returned a pending invite token (from Auth0 metadata)
            // The backend auto-accepts the invite, so redirect to invited user onboarding
            if (data.pendingInviteToken) {
              localStorage.removeItem('pendingInviteToken');
              setRedirectPath('/invited-onboarding');
              setIsCheckingOnboarding(false);
              return;
            }
          }
        } else {
          await response.text();
          setIsCheckingOnboarding(false);
          return;
        }
      } catch {
        setIsCheckingOnboarding(false);
        return;
      }

      if (token) {
        // Check for pending invite first (from localStorage)
        // This handles the case where user clicks invite link, gets redirected to Auth0, then comes back
        const pendingInviteToken = localStorage.getItem('pendingInviteToken');
        if (pendingInviteToken) {
          localStorage.removeItem('pendingInviteToken');
          setRedirectPath(`/invite/${pendingInviteToken}`);
          setIsCheckingOnboarding(false);
          return;
        }
        
        // Check onboarding status
        try {
          const orgResponse = await fetch(`${API_URL}/organisations/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (orgResponse.status === 404) {
            setRedirectPath('/onboarding');
          } else if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            
            // Set organisation and owner status in Redux
            dispatch(setOrganisation({
              organisation: orgData,
              isOwner: orgData.isOwner || false,
            }));
            
            // Check if user is an invited member (not owner) who hasn't completed their profile setup
            if (!orgData.isOwner) {
              // Invited users don't need to go through onboarding
              // Check if they need to set their name
              const userResponse = await fetch(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (userResponse.ok) {
                const userData = await userResponse.json();
                // If user hasn't completed their profile setup, send to invited-onboarding
                if (!userData.onboardingComplete) {
                  setRedirectPath('/invited-onboarding');
                } else {
                  setRedirectPath('/');
                }
              } else {
                setRedirectPath('/');
              }
            } else if (!orgData.planType) {
              setRedirectPath('/onboarding');
            } else {
              setRedirectPath('/');
            }
          } else {
            await orgResponse.text();
            // On 401 or other errors, assume new user and go to onboarding
            setRedirectPath('/onboarding');
          }
        } catch {
          setRedirectPath('/onboarding');
        }
      }
      setIsCheckingOnboarding(false);
    };

    handleAuth0User();
  }, [user, isLoading, hasToken, dispatch]);

  const handleLogin = () => {
    if (isLoading) {
      return;
    }
    loginWithRedirect();
  };

  const handleSignUp = () => {
    if (isLoading) {
      return;
    }
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  // Don't auto-redirect here - let AppContent handle the redirect after checking onboarding
  // The onboarding check in App.js will redirect appropriately
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Show loading while checking onboarding if user is detected
  if (!isLoading && user && isCheckingOnboarding) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Setting up your account...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ 
      mt: 8, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
    }}>
      <Stack 
        spacing={4} 
        sx={{ 
          width: '100%', 
          maxWidth: 400, 
          backgroundColor: 'background.paper',
          borderRadius: '20px',
          p: 5,
          boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.12)',
        }}
      >
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Sign in to continue to Pricing Calculator
          </Typography>
        </Stack>

        {sessionExpiredMessage && (
          <Alert severity="warning" onClose={() => setSessionExpiredMessage(null)}>
            {sessionExpiredMessage}
          </Alert>
        )}
        
        <Stack direction="column" spacing={2}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleLogin} 
            disabled={isLoading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </Button>

          <Button 
            variant="outlined" 
            size="large" 
            onClick={handleSignUp} 
            disabled={isLoading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {isLoading ? 'Loading...' : 'Create Account'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
