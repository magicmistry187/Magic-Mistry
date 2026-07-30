import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { BookingProvider } from '../../components/Booking/BookingContext';
import ApplianceSelector from '../../components/Booking/ApplianceSelector';
import ProblemSelector from '../../components/Booking/ProblemSelector';
import ScheduleForm from '../../components/Booking/ScheduleForm';
import AddressForm from '../../components/Booking/AddressForm';
import ApplianceImageUploader from '../../components/Booking/ApplianceImageUploader';
import BookingSummary from '../../components/Booking/BookingSummary';
import PricingTransparency from '../../components/Booking/PricingTransparency';
import PaymentMethod from '../../components/Booking/PaymentMethod';
import LoginRequiredModal from '../../components/auth/LoginRequiredModal';
import { useAuth } from '../../context/AuthContext';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Intercept the state passed from navigate('/booking', { state: { appliance: {...} } })
  const initialAppliance = location.state?.appliance || null;

  // Auto-show login required modal if user accesses booking while unauthenticated
  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  return (
    <BookingProvider initialAppliance={initialAppliance}>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold uppercase tracking-wide mb-3">
              ⚡ 7-Step Integrated Booking Flow
            </div>
            <h1 className="text-3xl font-extrabold text-[#0B1E40]">Book a Repair Service</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Follow our simple step-by-step process to schedule a verified technician for your home appliances.
            </p>
          </div>

          {/* Unauthenticated Guest Warning Banner */}
          {!isLoggedIn && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-950">A user cannot make a booking until they log in.</h3>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    You can configure your repair preferences below, but logging in is required to confirm your appointment.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                state={{ from: '/booking', reason: 'A user cannot make a booking until they log in.' }}
                className="shrink-0 bg-[#0B1E40] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Log In / Sign Up
              </Link>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column: Integrated 7-Step Form Flow (Matching Diagram) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Select Main Category & Service Package */}
              <ApplianceSelector />

              {/* Fixed Pricing Transparency */}
              <PricingTransparency />

              {/* Step 2: Describe Issue */}
              <ProblemSelector />

              {/* Step 3: Schedule Date and Time */}
              <ScheduleForm />

              {/* Step 4: Share Address */}
              <AddressForm />

              {/* Step 5: Upload Image of Appliance */}
              <ApplianceImageUploader />

              {/* Step 6: Select Payment Method */}
              <PaymentMethod />
            </div>

            {/* Right Column: Step 7 & Sticky Summary */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <BookingSummary />
            </div>

          </div>
        </main>

        <Footer />
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        appliance={initialAppliance}
      />
    </BookingProvider>
  );
}