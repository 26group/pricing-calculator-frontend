import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

export default function InvitedUserOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('');

  // Pre-fill name from Auth0 user (only from social sign-in like Google)
  useEffect(() => {
    if (user) {
      // Only use given_name/family_name if they exist (typically from Google/social logins)
      if (user.given_name) {
        setFirstName(user.given_name);
      }
      if (user.family_name) {
        setLastName(user.family_name);
      }
      // Only fallback to parsing user.name if it's NOT an email address
      // (Google provides actual names, email/password signup often has email as name)
      if (!user.given_name && !user.family_name && user.name) {
        // Skip if the name looks like an email address
        const isEmail = user.name.includes('@');
        if (!isEmail) {
          const nameParts = user.name.trim().split(' ');
          if (nameParts.length >= 1) {
            setFirstName(nameParts[0]);
          }
          if (nameParts.length >= 2) {
            setLastName(nameParts.slice(1).join(' '));
          }
        }
      }
    }
  }, [user]);

  // Fetch organisation name to display
  useEffect(() => {
    const fetchOrgInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await fetch(`${API_URL}/organisations/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrgName(data.name);
        }
      } catch (err) {
        console.error('Error fetching org info:', err);
      }
    };
    
    fetchOrgInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      // Update user profile with name
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          onboardingComplete: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      // Successfully updated - redirect to home
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Box textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#002060', mb: 1 }}>
              Welcome to {orgName || 'the Team'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Let's finish setting up your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                What's your name?
              </Typography>
              
              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
                required
                autoFocus
                disabled={loading}
              />
              
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
                required
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !firstName.trim() || !lastName.trim()}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Continue'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
