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
    const isVendorTarget = location.pathname.startsWith('/vendor-dashboard');
    return <Navigate to="/login" state={{ from: location.pathname, isVendorLogin: isVendorTarget, reason: 'Please log in to access this page.' }} replace />;
  }

  if (allowedRoles.length > 0) {
    const isAdminEmail = user?.email && user.email.toLowerCase().trim() === 'magicmistry187@gmail.com';
    const userRole = isAdminEmail ? 'admin' : (user?.role || (user?.vendorId ? 'vendor' : '')).toLowerCase();
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
        if (location.pathname.startsWith('/vendor-dashboard')) {
          return <Navigate to="/login" state={{ from: '/vendor-dashboard', isVendorLogin: true, reason: 'You are signed in as a customer. Please sign in with a Vendor account to access the Vendor Dashboard.' }} replace />;
        }
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
