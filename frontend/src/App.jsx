import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLoader from './components/common/PageLoader';
import ScrollToTop from './components/common/ScrollToTop';
import RouteLoaderListener from './components/common/RouteLoaderListener';
// Lazy loading route components
const HomePage = lazy(() => import('./pages/home/HomePage'));
const BookingPage = lazy(() => import('./pages/BookingPage/BookingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const CreateAccountModal = lazy(() => import('./components/auth/CreateAccountModal'));
const AboutPage = lazy(() => import('./pages/aboutus/AboutPage'));
const ContactPage = lazy(() => import('./pages/contactus/ContactPage'));
const PrivacyPolicy = lazy(() => import('./pages/term & policy/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/term & policy/TermsAndConditions'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const BookingConfirmation = lazy(() => import('./pages/BookingPage/BookingConfirmation'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

export default function App() {
  return (
    <RouteLoaderListener>
      <ScrollToTop />
      <Suspense fallback={<PageLoader label="Loading page..." />}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<HomePage />} />
          
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/confirmation" element={<BookingConfirmation />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<CreateAccountModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/create-account" element={<CreateAccountModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Information & Company Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/how-it-works" element={<HomePage />} />
          <Route path="/find-service" element={<HomePage />} />

          {/* User Dashboard & Sub-routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-bookings" element={<DashboardPage />} />
          <Route path="/bookings" element={<DashboardPage />} />
          <Route path="/history" element={<DashboardPage />} />
          <Route path="/settings" element={<DashboardPage />} />

          {/* Fallback Route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </RouteLoaderListener>
  );
}