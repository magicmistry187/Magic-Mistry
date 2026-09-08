import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from './PageLoader';

/**
 * PublicRoute (Guest Guard)
 * Restricts access to unauthenticated visitors only.
 * If already logged in, seamlessly redirects to the user's role-specific dashboard.
 */
const PublicRoute = ({ children }) => {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Checking session..." />;
  }

  if (isLoggedIn) {
    const role = (user?.role || '').toLowerCase();
    if (role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (role === 'vendor' || !!user?.vendorId) {
      return <Navigate to="/vendor-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
