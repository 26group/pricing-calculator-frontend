import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { CircularProgress, Container } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const { isLoading, user: auth0User } = useAuth0();
  const hasToken = !!localStorage.getItem('token');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null); // null = not checked, true = valid, false = invalid
  const validationAttempted = useRef(false);

  // Validate token with backend only once when component mounts
  useEffect(() => {
    // Only validate if we haven't already
    if (validationAttempted.current) {
      return;
    }

    validationAttempted.current = true;
    const token = localStorage.getItem('token');
    
    // If we have a token, validate it
    if (token) {
      setIsValidatingToken(true);
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/v1'}/organisations/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            // Token expired
            localStorage.removeItem('token');
            sessionStorage.setItem('sessionExpired', 'true');
            sessionStorage.setItem('sessionExpiredMessage', 'Your session has expired. Please log in again.');
            setIsTokenValid(false);
          } else {
            // Token is valid (either 200 or 404 or other non-401)
            setIsTokenValid(true);
          }
        })
        .catch(() => {
          // Network error - treat as invalid for security
          setIsTokenValid(false);
        })
        .finally(() => {
          setIsValidatingToken(false);
        });
    } else {
      // No token, validation complete
      setIsTokenValid(false);
    }
  }, []);

  // Still loading Auth0
  if (isLoading) {
    return null;
  }

  // Always validate token first - don't skip based on auth0User
  if (isValidatingToken || isTokenValid === null) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // After validation, check authentication
  // Auth0 user is valid if Auth0 finished loading and user exists
  const isAuth0Authenticated = !isLoading && auth0User;
  const isTokenAuthenticated = hasToken && isTokenValid === true;
  const isStoreAuthenticated = !!user;

  // If none of these are true, redirect to login
  if (!isAuth0Authenticated && !isTokenAuthenticated && !isStoreAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, allow access
  return children;
}
