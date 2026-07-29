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
    </BookingProvider>
  );
}