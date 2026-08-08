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
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     setShowLoginModal(true);
  //   }
  // }, [isLoggedIn]);

  return (
    <BookingProvider initialAppliance={initialAppliance}>
      <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white font-sans text-slate-800">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm border border-indigo-200/50">
              ⚡ 7-Step Integrated Booking Flow
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0B1E40] to-indigo-900 tracking-tight leading-tight">
              Book a Repair Service
            </h1>
            <p className="text-slate-500 mt-3 text-base md:text-lg max-w-2xl font-medium">
              Follow our simple step-by-step process to schedule a verified technician for your home appliances.
            </p>
          </div>

          {/* Unauthenticated Guest Warning Banner */}
          {!isLoggedIn && (
            <div className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl shrink-0 shadow-inner border border-amber-200/50">
                  🔒
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900">Login Required to Confirm</h3>
                  <p className="text-sm text-amber-700/90 mt-1 leading-relaxed font-medium">
                    You can configure your repair preferences below, but logging in is required to submit your booking.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                state={{ from: '/booking', reason: 'A user cannot make a booking until they log in.' }}
                className="shrink-0 bg-gradient-to-r from-[#0B1E40] to-indigo-900 hover:from-indigo-900 hover:to-[#0B1E40] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-indigo-900/20 hover:shadow-lg hover:-translate-y-0.5"
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
              <div id="step-appliance-selector">
                <ApplianceSelector />
              </div>

              {/* Fixed Pricing Transparency */}
              <div id="step-pricing-transparency">
                <PricingTransparency />
              </div>

              {/* Step 2: Describe Issue */}
              <div id="step-problem-selector">
                <ProblemSelector />
              </div>

              {/* Step 3: Schedule Date and Time */}
              <div id="step-schedule-form">
                <ScheduleForm />
              </div>

              {/* Step 4: Share Address */}
              <div id="step-address-form">
                <AddressForm />
              </div>

              {/* Step 5: Upload Image of Appliance */}
              <div id="step-image-uploader">
                <ApplianceImageUploader />
              </div>

              {/* Step 6: Select Payment Method */}
              <div id="step-payment-method">
                <PaymentMethod />
              </div>
            </div>

            {/* Right Column: Step 7 & Sticky Summary */}
            <div id="step-booking-summary" className="lg:col-span-1 lg:sticky lg:top-24">
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