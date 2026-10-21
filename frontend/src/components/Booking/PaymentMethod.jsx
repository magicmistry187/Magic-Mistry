import React, { useState } from 'react';
import { useBooking } from './BookingContext';
import {
  Banknote,
  Smartphone,
  CreditCard,
  Lock,
  ShieldCheck,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const METHODS = [
  {
    id: 'Cash',
    label: 'Pay Cash After Service',
    description: 'Pay cash directly to the technician once your appliance is fully repaired and tested.',
    Icon: Banknote,
    badge: null,
    enabled: true,
  },
  {
    id: 'UPI',
    label: 'Pay via UPI After Service',
    description: 'Scan the technician\'s verified QR code via Google Pay, PhonePe, Paytm, or BHIM upon completion.',
    Icon: Smartphone,
    badge: 'POPULAR & INSTANT',
    enabled: true,
  },
  {
    id: 'Online Payment',
    label: 'Credit / Debit Card / Net Banking',
    description: 'Digital online advance checkout is coming soon to your city.',
    Icon: CreditCard,
    badge: 'COMING SOON',
    enabled: false,
  },
];

export default function PaymentMethod() {
  const {
    bookingState,
    updateBooking,
    prevStep,
    submitBooking,
    loading,
    errors
  } = useBooking();

  const selected = bookingState.paymentMethod || 'Cash';
  const [showPricingGuide, setShowPricingGuide] = useState(false);

  const isSelectedMethod = (id) =>
    String(selected).toLowerCase() === String(id).toLowerCase();

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-indigo-50/20">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Banknote className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Step 4 of 4
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1E40] tracking-tight">
          Payment Preference &amp; Review
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Zero advance payment required. You only pay after your service is completed and verified.
        </p>
      </div>

      <div className="p-5 sm:p-6 md:p-8 space-y-6">
        {/* Trust Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950">
              100% Pay-After-Service Guarantee
            </h4>
            <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed font-medium">
              You do NOT pay a single rupee upfront. Our verified technician will test the appliance in front of you. Once you are completely satisfied, settle the bill via Cash or UPI.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Choose Payment Method
          </label>

          <div className="space-y-3">
            {METHODS.map((method) => {
              const isSelected = isSelectedMethod(method.id) && method.enabled;
              const { Icon } = method;

              return (
                <button
                  key={method.id}
                  type="button"
                  disabled={!method.enabled}
                  onClick={() => {
                    if (method.enabled) {
                      updateBooking('paymentMethod', method.id);
                    }
                  }}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                    !method.enabled
                      ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-r from-indigo-50/90 to-blue-50/40 border-2 border-indigo-600 shadow-sm ring-2 ring-indigo-500/10 cursor-pointer'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs cursor-pointer'
                  }`}
                >
                  {/* Radio Icon */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      !method.enabled
                        ? 'bg-slate-200 text-slate-400'
                        : isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Label & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${
                        isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-800'
                      }`}>
                        {method.label}
                      </span>
                      {method.badge && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          method.badge === 'POPULAR & INSTANT'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                      {method.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transparent Pricing Accordion */}
        <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowPricingGuide(p => !p)}
            className="w-full flex items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#0B1E40]">
                How our pricing &amp; spare parts policy works
              </span>
            </div>
            <span className="text-slate-400 shrink-0 ml-2">
              {showPricingGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {showPricingGuide && (
            <div className="p-5 border-t border-slate-100 space-y-4 bg-white text-xs leading-relaxed text-slate-600 font-medium">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold mb-0.5">Fixed Service Package</strong>
                  Covers technician visit, full diagnosis, and standard labour for the selected issue.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold mb-0.5">Spare Parts (If Applicable)</strong>
                  If any internal part (capacitor, sensor, motor) is faulty and requires replacement, the technician will show you the new genuine part with its exact rate before replacement. You can choose to decline with no penalty.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold mb-0.5">30-Day Post-Service Warranty</strong>
                  All services and installed parts come with a free 30-day revisit warranty. If the same issue recurs within 30 days, we fix it at zero extra charge.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Errors Alert (if any) */}
        {errors && errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1.5 text-xs text-red-700 font-semibold">
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            className="h-11 px-5 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            ← Back to Address
          </button>

          <button
            type="button"
            onClick={submitBooking}
            disabled={loading}
            className="h-11 px-7 rounded-xl font-extrabold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming Booking...
              </>
            ) : (
              <>
                Confirm Booking (₹{Number(bookingState.priceInfo?.total || 0).toFixed(0)}) <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
