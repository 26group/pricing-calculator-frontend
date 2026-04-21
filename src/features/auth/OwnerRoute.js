import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * OwnerRoute - Protects routes that should only be accessible to organisation owners
 * Must be used inside a ProtectedRoute to ensure user is authenticated first
 */
export default function OwnerRoute({ children }) {
  const isOwner = useSelector((state) => state.auth.isOwner);
  
  // If user is not the owner, redirect to home
  if (!isOwner) {
    return <Navigate to="/" replace />;
  }

  return children;
}
