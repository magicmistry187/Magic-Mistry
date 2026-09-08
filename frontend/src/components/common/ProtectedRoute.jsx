import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from './PageLoader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader label="Checking permissions..." />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname, reason: 'Please log in to access this page.' }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = (user?.role || (user?.vendorId ? 'vendor' : '')).toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!userRole || !normalizedAllowed.includes(userRole)) {
      // Redirect unauthorized users to their own authorized dashboard instead of dropping to /
      if (userRole === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
      }
      if (userRole === 'vendor') {
        return <Navigate to="/vendor-dashboard" replace />;
      }
      if (userRole === 'customer') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
