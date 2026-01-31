import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const { isLoading } = useAuth0();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
