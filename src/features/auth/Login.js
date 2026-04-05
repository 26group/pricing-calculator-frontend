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
      console.log('🔄 Login: handleAuth0User called', { user: !!user, isLoading });
      if (!user || isLoading) return;
      
      console.log('🔄 Login: Auth0 user detected, checking onboarding...');
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

        if (response.ok) {
          const data = await response.json();
          if (data.tokens?.access?.token) {
            token = data.tokens.access.token;
            localStorage.setItem('token', token);
            dispatch(setToken(token));
            dispatch(loginSuccess(data.user));
            console.log('🔄 Login: Token obtained and stored');
          }
        } else {
          console.error('🔄 Login: Failed to get token, status:', response.status);
          setIsCheckingOnboarding(false);
          return;
        }
      } catch (error) {
        console.error('Error getting token:', error);
        setIsCheckingOnboarding(false);
        return;
      }

      if (token) {
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
            
            if (!orgData.selectedPlanId) {
              console.log('🔄 Login: No plan selected, redirecting to /onboarding/select-plan');
              setRedirectPath('/onboarding/select-plan');
            } else {
              console.log('🔄 Login: Onboarding complete, redirecting to /');
              setRedirectPath('/');
            }
          } else {
            console.log('🔄 Login: Unexpected org response, redirecting to /onboarding');
            // On 401 or other errors, assume new user and go to onboarding
            setRedirectPath('/onboarding');
          }
        } catch (error) {
          console.error('Error checking org:', error);
          setRedirectPath('/onboarding');
        }
      } else {
        console.log('🔄 Login: No token available after fetch attempt');
      }
      setIsCheckingOnboarding(false);
    };

    handleAuth0User();
  }, [user, isLoading, dispatch]);

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

  // Show loading while checking onboarding
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
