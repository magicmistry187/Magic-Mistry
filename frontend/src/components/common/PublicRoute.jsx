import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from './PageLoader';

/**
 * PublicRoute (Guest Guard)
 * Restricts access to unauthenticated visitors only.
 * If already logged in, seamlessly redirects to the user's role-specific dashboard.
 * EXCEPTION: If the user explicitly requested Admin or Vendor login (location.state?.isAdminLogin or isVendorLogin),
 * allow them to access the login page to switch accounts!
 */
const PublicRoute = ({ children }) => {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader label="Checking session..." />;
  }

  // Allow switching accounts if directed to login for a specific role (e.g. Admin or Vendor login)
  if (location.state?.isAdminLogin || location.state?.isVendorLogin) {
    return children;
  }

  if (isLoggedIn) {
    const isAdminEmail = user?.email && user.email.toLowerCase().trim() === 'magicmistry187@gmail.com';
    const role = isAdminEmail ? 'admin' : (user?.role || '').toLowerCase();
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
