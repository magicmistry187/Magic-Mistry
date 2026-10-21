import React from 'react';
import { useBooking } from './BookingContext';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  ChevronRight,
  ReceiptText
} from 'lucide-react';
import LoginRequiredModal from '../auth/LoginRequiredModal';
import ApplianceIcon from '../common/ApplianceIcon';

export default function BookingSummary() {
  const {
    bookingState,
    currentStep,
    nextStep,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    goToStep,
    submitBooking,
    loading,
    errors,
    showLoginModal,
    setShowLoginModal
  } = useBooking();

  const { basePrice, total } = bookingState.priceInfo;

  const handleStepAction = () => {
    if (currentStep === 1) {
      if (isStep1Valid) nextStep();
    } else if (currentStep === 2) {
      if (isStep2Valid) nextStep();
    } else if (currentStep === 3) {
      if (isStep3Valid) nextStep();
    } else if (currentStep === 4) {
      submitBooking();
    }
  };

  const isCurrentStepActionDisabled = () => {
    if (currentStep === 1) return !isStep1Valid;
    if (currentStep === 2) return !isStep2Valid;
    if (currentStep === 3) return !isStep3Valid;
    if (currentStep === 4) return loading || !isStep4Valid;
    return false;
  };

  const formattedDate = bookingState.date
    ? new Date(bookingState.date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short'
      })
    : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* Ticket Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-[#0B1E40] to-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <ReceiptText className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-extrabold text-base tracking-tight leading-tight">Service Ticket</h3>
              <p className="text-[11px] text-slate-300 font-medium truncate">Magic Mistry Direct Booking</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
            Pay On Arrival
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Selected Appliance Preview */}
        <div className="pb-4 border-b border-slate-100 flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 p-1">
            <ApplianceIcon
              id={bookingState.serviceId}
              name={bookingState.serviceName}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Appliance</span>
            <h4 className="font-extrabold text-[#0B1E40] text-sm truncate">
              {bookingState.serviceName || <span className="text-slate-400 italic font-normal">Not selected yet</span>}
            </h4>
            {bookingState.selectedSubServices.length > 0 && (
              <div className="text-[11px] text-indigo-700 font-semibold mt-0.5 truncate">
                {bookingState.selectedSubServices.map(s => s.label).join(', ')}
              </div>
            )}
          </div>
          {bookingState.serviceId && (
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer shrink-0 ml-1"
            >
              Edit
            </button>
          )}
        </div>

        {/* Schedule & Address Snippets */}
        <div className="space-y-3 text-xs">
          {/* Schedule */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2 text-slate-500 font-medium shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Schedule:</span>
            </div>
            <div className="text-right min-w-0 flex-1 truncate">
              {formattedDate && bookingState.timeSlot ? (
                <span className="font-bold text-slate-800 truncate block">
                  {formattedDate} • {bookingState.timeSlot}
                </span>
              ) : (
                <span className="text-slate-400 italic">Select in Step 2</span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2 text-slate-500 font-medium shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Location:</span>
            </div>
            <div className="text-right min-w-0 flex-1 truncate">
              {bookingState.address?.trim() ? (
                <span className="font-bold text-slate-800 truncate block" title={bookingState.address}>
                  {bookingState.address}
                </span>
              ) : (
                <span className="text-slate-400 italic">Enter in Step 3</span>
              )}
            </div>
          </div>

          {/* Payment Mode */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2 text-slate-500 font-medium shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Payment:</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-700">
                {bookingState.paymentMethod === 'UPI' ? 'UPI on Completion' : 'Cash on Completion'}
              </span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Service Package Subtotal</span>
            <span className="font-bold text-slate-900">₹{Number(basePrice).toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Inspection &amp; Visit Fee</span>
            <span className="text-emerald-700 font-bold">Included</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Platform Fee &amp; Taxes</span>
            <span className="text-emerald-700 font-bold">₹0 (Waived)</span>
          </div>

          <div className="pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Due</span>
              <span className="text-[10px] text-slate-400 font-medium">Pay after complete satisfaction</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#0B1E40]">
                ₹{Number(total).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Errors Alert */}
        {errors && errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-700 font-semibold">
            {errors.map((e, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Primary Step-Aware Action Button */}
        <div>
          <button
            type="button"
            onClick={handleStepAction}
            disabled={isCurrentStepActionDisabled()}
            className={`w-full h-12 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm ${
              isCurrentStepActionDisabled()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : currentStep === 4
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 hover:shadow-md hover:-translate-y-0.5'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Booking...
              </>
            ) : currentStep === 1 ? (
              <>
                Continue to Schedule <ChevronRight className="w-4 h-4" />
              </>
            ) : currentStep === 2 ? (
              <>
                Continue to Address <ChevronRight className="w-4 h-4" />
              </>
            ) : currentStep === 3 ? (
              <>
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Confirm Booking (₹{Number(total).toFixed(0)}) <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Trust Guarantees */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>30-Day Free Revisit &amp; Rework Warranty</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Verified, Background-Checked Technicians</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero cancellation fee prior to arrival</span>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        appliance={{ name: bookingState.serviceName || 'Appliance Repair' }}
      />
    </div>
  );
}
