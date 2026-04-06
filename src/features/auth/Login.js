import React, { useState, useEffect } from 'react';
import { Button, Stack, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
      console.log('🔄 Login: handleAuth0User called', { user: !!user, isLoading, hasToken });
      // Skip if still loading Auth0 or if there's no user and no token
      if (isLoading) return;
      if (!user && !hasToken) return;
      
      // If user has Auth0 and we haven't checked yet, check onboarding
      if (!user && hasToken) {
        console.log('🔄 Login: User has token but no Auth0 user, token likely valid, skipping auth0 check');
        return;
      }
      
      console.log('🔄 Login: Auth0 user detected, checking onboarding...', { email: user.email, sub: user.sub });
      setIsCheckingOnboarding(true);
      
      // Always get a fresh token for Auth0 user to ensure it's valid
      let token = null;
      console.log('🔄 Login: Fetching fresh token from backend...');
      try {
        const response = await fetch(`${API_URL}/auth/auth0-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth0UserId: user.sub,
            email: user.email,
          }),
        });

        console.log('🔄 Login: Token response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('🔄 Login: Token response data:', { isNewUser: data.isNewUser, hasToken: !!data.tokens?.access?.token });
          if (data.tokens?.access?.token) {
            token = data.tokens.access.token;
            localStorage.setItem('token', token);
            // Store user email for display persistence
            if (user.email) {
              localStorage.setItem('userEmail', user.email);
            }
            dispatch(setToken(token));
            dispatch(loginSuccess(data.user));
            console.log('🔄 Login: Token obtained and stored');
          }
        } else {
          const errorText = await response.text();
          console.error('🔄 Login: Failed to get token, status:', response.status, 'error:', errorText);
          setIsCheckingOnboarding(false);
          return;
        }
      } catch (error) {
        console.error('🔄 Login: Error getting token:', error);
        setIsCheckingOnboarding(false);
        return;
      }

      if (token) {
        // Check for pending invite first
        const pendingInviteToken = localStorage.getItem('pendingInviteToken');
        if (pendingInviteToken) {
          console.log('🔄 Login: Found pending invite, redirecting to accept it');
          localStorage.removeItem('pendingInviteToken');
          setRedirectPath(`/invite/${pendingInviteToken}`);
          setIsCheckingOnboarding(false);
          return;
        }
        
        // Check onboarding status
        console.log('🔄 Login: Checking organisation status...');
        try {
          const orgResponse = await fetch(`${API_URL}/organisations/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          console.log('🔄 Login: Org response status:', orgResponse.status);
          
          if (orgResponse.status === 404) {
            console.log('🔄 Login: No org found, redirecting to /onboarding');
            setRedirectPath('/onboarding');
          } else if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            console.log('🔄 Login: Org data:', orgData);
            
            // Set organisation and owner status in Redux
            dispatch(setOrganisation({
              organisation: orgData,
              isOwner: orgData.isOwner || false,
            }));
            
            if (!orgData.planType) {
              console.log('🔄 Login: No plan type selected, redirecting to /onboarding');
              setRedirectPath('/onboarding');
            } else {
              console.log('🔄 Login: Onboarding complete, redirecting to /');
              setRedirectPath('/');
            }
          } else {
            const errorText = await orgResponse.text();
            console.log('🔄 Login: Unexpected org response status, redirecting to /onboarding. Error:', errorText);
            // On 401 or other errors, assume new user and go to onboarding
            setRedirectPath('/onboarding');
          }
        } catch (error) {
          console.error('🔄 Login: Error checking org:', error);
          setRedirectPath('/onboarding');
        }
      } else {
        console.log('🔄 Login: No token available after fetch attempt');
      }
      setIsCheckingOnboarding(false);
    };

    handleAuth0User();
  }, [user, isLoading, hasToken, dispatch]);

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleSignUp = () => {
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
            Sign In
          </Button>

          <Button 
            variant="outlined" 
            size="large" 
            onClick={handleSignUp} 
            disabled={isLoading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Create Account
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
