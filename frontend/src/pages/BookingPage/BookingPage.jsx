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

export default function BookingPage() {
  const location = useLocation();
  
  // Intercept the state passed from navigate('/booking', { state: { appliance: {...} } })
  const initialAppliance = location.state?.appliance || null;

  return (
    <BookingProvider initialAppliance={initialAppliance}>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 text-sm text-gray-500 font-medium flex items-center gap-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>&gt;</span>
            <span className="text-gray-700 font-semibold">
              {initialAppliance ? initialAppliance.name : 'Services'}
            </span>
            <span>&gt;</span>
            <span className="text-blue-600 font-bold">Booking</span>
          </nav>

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
              <ProblemSelector />
              <ScheduleForm />
              <AddressForm />
              
              {/* Payment Method */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="bg-gray-100 text-gray-700 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm font-bold">5</span> 
                  Payment Method
                </h2>
                <div className="flex items-center space-x-3 p-4 border border-blue-500 rounded-lg bg-blue-50/50">
                  <input type="radio" checked readOnly className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800">Pay Cash / UPI After Service</span>
                  <span className="ml-auto text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">RECOMMENDED</span>
                </div>
              </div>
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