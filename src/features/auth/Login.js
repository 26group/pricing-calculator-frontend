import React, { useState, useEffect } from 'react';
import { Button, Stack, Typography, Container, TextField, Alert, CircularProgress } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, setToken } from './authSlice';

export default function Login() {
  const { user, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [testEmail, setTestEmail] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testError, setTestError] = useState('');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

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
        const response = await fetch('http://localhost:4000/v1/auth/auth0-callback', {
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
          const orgResponse = await fetch('http://localhost:4000/v1/organisations/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          console.log('🔄 Login: Org response status:', orgResponse.status);
          
          if (orgResponse.status === 404) {
            console.log('🔄 Login: No org found, redirecting to /onboarding');
            setRedirectPath('/onboarding');
          } else if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            console.log('🔄 Login: Org data:', orgData);
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

  const handleTestLogin = async () => {
    if (!testEmail.trim()) {
      setTestError('Please enter an email address');
      return;
    }

    try {
      setIsTestLoading(true);
      setTestError('');
      
      console.log('🔐 Starting test login with email:', testEmail);
      
      const response = await fetch('http://localhost:4000/v1/auth/auth0-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0UserId: 'test-' + Date.now(),
          email: testEmail,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Test login successful');
        console.log('✅ User data:', data.user);
        console.log('✅ Token:', data.tokens.access.token.substring(0, 30) + '...');
        
        if (data.tokens && data.tokens.access) {
          const token = data.tokens.access.token;
          localStorage.setItem('token', token);
          console.log('✅ Token saved to localStorage');
          console.log('✅ Token from localStorage:', localStorage.getItem('token').substring(0, 30) + '...');
          
          dispatch(setToken(token));
          console.log('✅ Token dispatched to Redux');
          dispatch(loginSuccess(data.user));
          console.log('✅ User dispatched to Redux');
          
          setIsTestLoading(false);
          
          // Check if user has an organisation - if not, redirect to onboarding
          console.log('✅ Checking onboarding status...');
          const orgResponse = await fetch('http://localhost:4000/v1/organisations/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (orgResponse.status === 404) {
            console.log('✅ No organisation found, redirecting to onboarding');
            navigate('/onboarding');
          } else if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            if (!orgData.selectedPlanId) {
              console.log('✅ No plan selected, redirecting to plan selection');
              navigate('/onboarding/select-plan');
            } else {
              console.log('✅ Onboarding complete, navigating to home page');
              navigate('/');
            }
          } else {
            navigate('/');
          }
        }
      } else {
        const error = await response.json();
        console.error('❌ Test login failed:', error);
        setTestError(error.message || 'Test login failed');
        setIsTestLoading(false);
      }
    } catch (error) {
      console.error('❌ Error during test login:', error);
      setTestError('Error during test login: ' + error.message);
      setIsTestLoading(false);
    }
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
        <Typography sx={{ mt: 2 }}>Setting up your account...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 8, textAlign: 'center', maxWidth: 400 }}>
      <Typography variant="h4" gutterBottom>
        Sign in to Continue
      </Typography>
      <Stack direction="column" spacing={3} alignItems="center">
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleLogin} 
          disabled={isLoading}
          fullWidth
        >
          Continue with Auth0
        </Button>

        <Button 
          variant="outlined" 
          size="large" 
          onClick={handleSignUp} 
          disabled={isLoading}
          fullWidth
        >
          Sign Up
        </Button>

        <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
          Or use test login for development
        </Typography>

        <TextField
          label="Test Email"
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="test@example.com"
          fullWidth
          disabled={isTestLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleTestLogin();
            }
          }}
        />

        <Button 
          variant="outlined" 
          size="large" 
          onClick={handleTestLogin}
          disabled={isTestLoading || !testEmail.trim()}
          fullWidth
        >
          {isTestLoading ? <CircularProgress size={24} /> : 'Test Login'}
        </Button>

        {testError && (
          <Alert severity="error" fullWidth>
            {testError}
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
