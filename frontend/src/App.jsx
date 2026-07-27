import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLoader from './components/common/PageLoader';
import ScrollToTop from './components/common/ScrollToTop';
import TermsAndConditions from './pages/term & policy/TermsAndConditions';

// Lazy loading route components
const HomePage = lazy(() => import('./pages/home/HomePage'));
const BookingPage = lazy(() => import('./pages/BookingPage/BookingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const CreateAccountModal = lazy(() => import('./pages/auth/CreateAccountModal'));
const AboutPage = lazy(() => import('./pages/aboutus/AboutPage'));
const ContactPage = lazy(() => import('./pages/contactus/ContactPage'));
const PrivacyPolicy = lazy(() => import('./pages/term & policy/PrivacyPolicy'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Unified Booking Page */}
          <Route path="/booking" element={<BookingPage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<CreateAccountModal isOpen={true} onClose={() => window.history.back()} />} />
          <Route path="/create-account" element={<CreateAccountModal isOpen={true} onClose={() => window.history.back()} />} />

          {/* Information & Company Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/how-it-works" element={<HomePage />} />
          <Route path="/find-service" element={<HomePage />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Fallback Route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  );
}