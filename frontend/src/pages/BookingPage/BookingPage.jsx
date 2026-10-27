import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { BookingProvider, useBooking } from '../../components/Booking/BookingContext';
import ApplianceSelector from '../../components/Booking/ApplianceSelector';
import ScheduleForm from '../../components/Booking/ScheduleForm';
import AddressForm from '../../components/Booking/AddressForm';
import PaymentMethod from '../../components/Booking/PaymentMethod';
import BookingSummary from '../../components/Booking/BookingSummary';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Home,
  Check,
  Wrench,
  Calendar,
  MapPin,
  CreditCard,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 1, title: 'Service', subtitle: 'Appliance & Package', Icon: Wrench },
  { id: 2, title: 'Schedule', subtitle: 'Date & Arrival Time', Icon: Calendar },
  { id: 3, title: 'Address', subtitle: 'Service Location', Icon: MapPin },
  { id: 4, title: 'Payment', subtitle: 'Review & Confirm', Icon: CreditCard },
];

function BookingFlowContent() {
  const {
    currentStep,
    goToStep,
    maxUnlockedStep,
    bookingState,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    nextStep,
    submitBooking,
    loading
  } = useBooking();

  const formattedDate = bookingState.date
    ? new Date(bookingState.date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short'
      })
    : null;

  return (
    <div id="booking-main-content" className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
        <Link to="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-bold">Book a Service</span>
      </nav>

      {/* Page Title & Trust Ribbon */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B1E40] tracking-tight">
              Schedule a Professional Repair
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-1.5 font-medium max-w-2xl">
              Choose your appliance, pick a convenient 2-hour arrival window, and pay only after the job is completely finished.
            </p>
          </div>

          {/* Trust Value Props Strip */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>30-Day Warranty</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verified Mistry</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pay After Service</span>
            </div>
          </div>
        </div>

        {/* Milestone Stepper Bar */}
        <div className="mt-6 md:mt-8 bg-white p-3 sm:p-5 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs">
          {/* Progress bar line */}
          <div className="relative mb-3 sm:mb-4 hidden sm:block">
            <div className="h-1 bg-slate-100 rounded-full w-full">
              <div
                className="h-1 bg-gradient-to-r from-[#0B1E40] to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {STEPS.map((step) => {
              const isCurrent = currentStep === step.id;
              const isCompleted = step.id < currentStep || (step.id === 1 && isStep1Valid && currentStep > 1) || (step.id === 2 && isStep2Valid && currentStep > 2) || (step.id === 3 && isStep3Valid && currentStep > 3);
              const isUnlocked = step.id <= maxUnlockedStep;
              const { Icon } = step;

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && goToStep(step.id)}
                  className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl text-left transition-all duration-200 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 group ${
                    isCurrent
                      ? 'bg-gradient-to-b from-indigo-50/80 to-blue-50/30 border-2 border-indigo-600 shadow-2xs ring-2 ring-indigo-500/10'
                      : isCompleted
                      ? 'hover:bg-slate-50 cursor-pointer border border-transparent'
                      : 'opacity-50 cursor-not-allowed border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isCurrent
                        ? 'bg-indigo-600 text-white shadow-2xs font-black'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 text-center sm:text-left flex-1">
                    <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider block truncate ${
                      isCurrent ? 'text-indigo-900 font-black' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                    <span className="text-[11px] text-slate-500 hidden md:block truncate font-medium">
                      {step.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left 2 Columns: Milestone Accordion Flow */}
        <div className="lg:col-span-2 space-y-4">
          {/* STEP 1: Appliance & Service */}
          {currentStep === 1 ? (
            <motion.div
              key="step-1-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ApplianceSelector />
            </motion.div>
          ) : (
            <div
              onClick={() => goToStep(1)}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Step 1 Completed</div>
                  <div className="text-sm font-extrabold text-[#0B1E40] truncate">
                    {bookingState.serviceName || 'Appliance Service'}
                    {bookingState.selectedSubServices.length > 0 && (
                      <span className="text-slate-500 font-semibold ml-2 text-xs">
                        • {bookingState.selectedSubServices.map(s => s.label).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 shrink-0">
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change</span>
              </div>
            </div>
          )}

          {/* STEP 2: Schedule Date & Time */}
          {currentStep === 2 ? (
            <motion.div
              key="step-2-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ScheduleForm />
            </motion.div>
          ) : currentStep > 2 ? (
            <div
              onClick={() => goToStep(2)}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Step 2 Completed</div>
                  <div className="text-sm font-extrabold text-[#0B1E40] truncate">
                    {formattedDate} • {bookingState.timeSlot}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 shrink-0">
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change</span>
              </div>
            </div>
          ) : null}

          {/* STEP 3: Address & Location */}
          {currentStep === 3 ? (
            <motion.div
              key="step-3-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AddressForm />
            </motion.div>
          ) : currentStep > 3 ? (
            <div
              onClick={() => goToStep(3)}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Step 3 Completed</div>
                  <div className="text-sm font-extrabold text-[#0B1E40] truncate" title={bookingState.address}>
                    {bookingState.address}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 shrink-0">
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change</span>
              </div>
            </div>
          ) : null}

          {/* STEP 4: Payment & Review */}
          {currentStep === 4 && (
            <motion.div
              key="step-4-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PaymentMethod />
            </motion.div>
          )}
        </div>

        {/* Right 1 Column: Sticky Luxury Service Ticket */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <BookingSummary />
        </div>
      </div>

      {/* Mobile Floating Bottom Summary Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Total Amount</div>
            <div className="text-lg font-black text-[#0B1E40] leading-none">
              ₹{Number(bookingState.priceInfo?.total || 0).toFixed(0)}{' '}
              <span className="text-[10px] font-bold text-emerald-600 block sm:inline mt-0.5 sm:mt-0">Pay On Arrival</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentStep < 4) {
                nextStep();
              } else {
                submitBooking();
              }
            }}
            disabled={
              loading ||
              (currentStep === 1 && !isStep1Valid) ||
              (currentStep === 2 && !isStep2Valid) ||
              (currentStep === 3 && !isStep3Valid) ||
              (currentStep === 4 && !isStep4Valid)
            }
            className="h-11 px-6 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : currentStep === 1 ? (
              <>
                Next: Schedule <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : currentStep === 2 ? (
              <>
                Next: Address <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : currentStep === 3 ? (
              <>
                Next: Payment <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Confirm Booking <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const location = useLocation();
  const initialAppliance = location.state?.appliance || null;

  return (
    <BookingProvider initialAppliance={initialAppliance}>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-800 pt-20 sm:pt-24 pb-24 lg:pb-12">
        <Navbar />
        <main className="flex-1">
          <BookingFlowContent />
        </main>
        <Footer />
      </div>
    </BookingProvider>
  );
}