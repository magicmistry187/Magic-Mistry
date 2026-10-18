import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from './PageLoader';

function decodeJwtPayload(jwtToken) {
  if (!jwtToken || typeof jwtToken !== 'string') return null;
  try {
    const parts = jwtToken.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader label="Checking permissions..." />;
  }

  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard/admin');
  const isVendorPath = location.pathname.startsWith('/vendor-dashboard') || location.pathname.startsWith('/vendor');

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          isVendorLogin: isVendorPath,
          reason: isVendorPath
            ? 'Vendor authentication required. Please sign in with a Vendor account to access the Vendor Dashboard.'
            : 'Please log in to access this page.',
        }}
        replace
      />
    );
  }

  if (allowedRoles.length > 0) {
    const isAdminEmail = user?.email && user.email.toLowerCase().trim() === 'magicmistry187@gmail.com';
    let userRole = isAdminEmail ? 'admin' : (user?.role || (user?.vendorId ? 'vendor' : '')).toLowerCase();

    // Authoritative fallback: verify against client-saved tokens
    if (userRole !== 'admin') {
      try {
        const anyToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('adminToken') || localStorage.getItem('mm_token') || localStorage.getItem('token')
            : null;
        if (anyToken) {
          const decoded = decodeJwtPayload(anyToken);
          if (
            decoded?.email?.toLowerCase().trim() === 'magicmistry187@gmail.com' ||
            decoded?.role?.toLowerCase() === 'admin'
          ) {
            userRole = 'admin';
          }
        }
      } catch (_) {}
    }

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
        if (isVendorPath) {
          return (
            <Navigate
              to="/login"
              state={{
                from: '/vendor-dashboard',
                isVendorLogin: true,
                reason: 'You are signed in as a customer. Please sign in with a Vendor account to access the Vendor Dashboard.',
              }}
              replace
            />
          );
        }
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
