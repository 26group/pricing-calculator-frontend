import React, { useState } from 'react';
import { Button, Stack, Typography, Container, TextField, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '@workos-inc/authkit-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, setToken } from './authSlice';

export default function Login() {
  const { user, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [testEmail, setTestEmail] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testError, setTestError] = useState('');

  const handleLogin = () => {
    signIn();
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
      
      const response = await fetch('http://localhost:4000/v1/auth/workos-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workosUserId: 'test-' + Date.now(),
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
          console.log('✅ Navigating to home page');
          navigate('/');
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

  if (!isLoading && user) {
    return <Navigate to="/" replace />;
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
          Continue with WorkOS
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
