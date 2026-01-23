import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@workos-inc/authkit-react';

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const { isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
