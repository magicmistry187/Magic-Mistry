import React from 'react';
import { useLocation } from 'react-router-dom';
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

export default function BookingPage() {
  const location = useLocation();

  // Intercept the state passed from navigate('/booking', { state: { appliance: {...} } })
  const initialAppliance = location.state?.appliance || null;

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

    </BookingProvider>
  );
}