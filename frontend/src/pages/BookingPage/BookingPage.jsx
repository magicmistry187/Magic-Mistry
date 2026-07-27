import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { BookingProvider } from '../../components/Booking/BookingContext';
import ApplianceSelector from '../../components/Booking/ApplianceSelector';
import ProblemSelector from '../../components/Booking/ProblemSelector';
import ScheduleForm from '../../components/Booking/ScheduleForm';
import AddressForm from '../../components/Booking/AddressForm';
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
            <h1 className="text-3xl font-extrabold text-[#0B1E40]">Book a Repair Service</h1>
            <p className="text-slate-600 mt-2">
              We'll get your appliance running smoothly again. Provide details below to book a verified technician.
            </p>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column: Form Steps */}
            <div className="lg:col-span-2 space-y-6">
              <ApplianceSelector />

              {/* Pricing Transparency — shown right after appliance selection */}
              <PricingTransparency />

              <ProblemSelector />
              <ScheduleForm />
              <AddressForm />

              <PaymentMethod />
            </div>

            {/* Right Column: Sticky Summary */}
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