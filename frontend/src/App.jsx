import React, { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PageLoader from './components/common/PageLoader';
import ScrollToTop from './components/common/ScrollToTop';
import RouteLoaderListener from './components/common/RouteLoaderListener';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
// Lazy loading route components
const HomePage = lazy(() => import('./pages/home/HomePage'));
const BookingPage = lazy(() => import('./pages/BookingPage/BookingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const CreateAccountModal = lazy(() => import('./components/auth/CreateAccountModal'));
const AboutPage = lazy(() => import('./pages/aboutus/AboutPage'));
const ContactPage = lazy(() => import('./pages/contactus/ContactPage'));
const PrivacyPolicy = lazy(() => import('./pages/term & policy/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/term & policy/TermsAndConditions'));
const UserDashboardPage = lazy(() => import('./pages/dashboard/UserDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/dashboard/AdminDashboardPage'));
const BookingConfirmation = lazy(() => import('./pages/BookingPage/BookingConfirmation'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const FaqPage = lazy(() => import('./pages/faq/FaqPage'));
const BecomeAVendorPage = lazy(() => import('./pages/vendor/BecomeAVendorPage'));
const VendorApplyPage = lazy(() => import('./pages/vendor/VendorApplyPage'));
const VendorDashboardPage = lazy(() => import('./pages/dashboard/VendorDashboardPage'));
const PricingPage = lazy(() => import('./pages/pricing/PricingPage'));

// Helper wrapper for signup modal to safely navigate back on close even on direct page load
function SignupModalRouteWrapper() {
  const navigate = useNavigate();
  return <CreateAccountModal isOpen={true} onClose={() => navigate('/')} />;
}

export default function App() {
  return (
    <RouteLoaderListener>
      <ScrollToTop />
      <Suspense fallback={<PageLoader label="Loading page..." />}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<HomePage />} />
          
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/confirmation" element={<ProtectedRoute allowedRoles={['customer']}><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Authentication Pages (Protected by PublicRoute / Guest Guard) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupModalRouteWrapper /></PublicRoute>} />
          <Route path="/create-account" element={<PublicRoute><SignupModalRouteWrapper /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Information & Company Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<PrivacyPolicy />} />
          <Route path="/become-a-vendor" element={<BecomeAVendorPage />} />
          <Route path="/become-a-vandor" element={<BecomeAVendorPage />} />
          <Route path="/vendor-apply" element={<VendorApplyPage />} />
          {/* Vendor Dashboard Routes */}
          <Route path="/vendor-dashboard" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorDashboardPage /></ProtectedRoute>} />
          <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorDashboardPage /></ProtectedRoute>} />
          <Route path="/vendor-portal" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorDashboardPage /></ProtectedRoute>} />
          <Route path="/how-it-works" element={<HomePage />} />
          <Route path="/find-service" element={<HomePage />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />

          {/* User Dashboard & Sub-routes (Restricted to Customer role) */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute allowedRoles={['customer']}><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowedRoles={['customer']}><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['customer']}><UserDashboardPage /></ProtectedRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </RouteLoaderListener>
  );
}