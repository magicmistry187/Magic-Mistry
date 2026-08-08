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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
