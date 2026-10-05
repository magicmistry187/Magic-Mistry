import React from 'react';
import { useBooking } from '../../components/Booking/BookingContext';
import { Banknote, Smartphone, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';

const methods = [
  {
    id: 'Cash',
    label: 'Pay Cash After Service',
    description: 'Hand over cash directly to the technician once the job is completed.',
    icon: <Banknote className="w-5 h-5" />,
    badge: null,
    enabled: true,
  },
  {
    id: 'UPI',
    label: 'Pay via UPI After Service',
    description: 'Scan & pay via PhonePe, Google Pay, Paytm, or BHIM UPI after service.',
    icon: <Smartphone className="w-5 h-5" />,
    badge: 'RECOMMENDED',
    enabled: true,
  },
  {
    id: 'Online Payment',
    label: 'Online Payment (Card / Net Banking / Gateway)',
    description: 'Online Payment Gateway is in progress & under development. Please choose Cash or UPI.',
    icon: <CreditCard className="w-5 h-5" />,
    badge: 'IN PROGRESS',
    enabled: false, // Visible in the options but cannot be selected
  },
];

export default function PaymentMethod() {
  const { bookingState, updateBooking, updatePaymentDetails } = useBooking();
  // Ensure selected is either 'Cash' or 'UPI', never 'Online Payment'
  const rawSelected = bookingState.paymentMethod || 'Cash';
  const selected = (rawSelected === 'Online Payment' || rawSelected === 'online') ? 'Cash' : (rawSelected === 'upi' ? 'UPI' : (rawSelected === 'cash' ? 'Cash' : rawSelected));
  const paymentDetails = bookingState.paymentDetails || {};

  const handleSelectMethod = (methodId) => {
    if (methodId === 'Online Payment') return; // Cannot be selected
    updateBooking('paymentMethod', methodId);
    if (updatePaymentDetails) {
      updatePaymentDetails('category', methodId);
    }
  };

  const handleDetailChange = (field, value) => {
    if (updatePaymentDetails) {
      updatePaymentDetails(field, value);
    } else {
      updateBooking('paymentDetails', {
        ...(bookingState.paymentDetails || {}),
        [field]: value,
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-extrabold text-[#0B1E40] mb-5 flex items-center gap-3">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
          6
        </span>
        Select Payment Method
      </h2>

      <div className="space-y-4">
        {methods.map((method) => {
          const isSelected = selected === method.id && method.enabled;

          return (
            <div
              key={method.id}
              className={`rounded-2xl border-2 transition-all overflow-hidden ${
                !method.enabled
                  ? 'border-slate-200 bg-slate-50/70 opacity-80 cursor-not-allowed'
                  : isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/10'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {/* Option Header Card */}
              <div
                onClick={() => {
                  if (method.enabled) {
                    handleSelectMethod(method.id);
                  }
                }}
                className={`w-full text-left flex items-center gap-4 p-4 select-none ${
                  method.enabled ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Radio dot */}
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-blue-600 bg-white' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                </span>

                {/* Icon */}
                <span
                  className={`flex-shrink-0 p-2.5 rounded-xl ${
                    !method.enabled
                      ? 'bg-amber-100 text-amber-700'
                      : isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {method.icon}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-semibold text-sm ${
                        !method.enabled
                          ? 'text-slate-700'
                          : isSelected
                          ? 'text-blue-900'
                          : 'text-slate-800'
                      }`}
                    >
                      {method.label}
                    </span>
                    {method.badge === 'RECOMMENDED' && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                    {method.badge === 'IN PROGRESS' && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> IN PROGRESS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>

              {/* Method-Specific Input Details */}
              {isSelected && method.id === 'UPI' && (
                <div className="px-5 pb-5 pt-1 border-t border-blue-100/80 bg-white/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      UPI Transaction Details (Optional / Pre-fill)
                    </p>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Payable on Service
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Your UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. mobile@upi or name@oksbi"
                        value={paymentDetails.upiId || ''}
                        onChange={(e) => handleDetailChange('upiId', e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        UPI Reference / UTR Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12-digit UTR (if pre-paid)"
                        value={paymentDetails.referenceNumber || ''}
                        onChange={(e) => handleDetailChange('referenceNumber', e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    💡 If transferring on-site, technician will display a dynamic QR code upon service completion.
                  </p>
                </div>
              )}

              {isSelected && method.id === 'Cash' && (
                <div className="px-5 pb-5 pt-1 border-t border-emerald-100/80 bg-white/70 space-y-3">
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Cash Collection Notes
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Change Request / Notes for Technician
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Have ₹500 change ready, paying exact amount, etc."
                      value={paymentDetails.cashNotes || ''}
                      onChange={(e) => handleDetailChange('cashNotes', e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Informational Banner for in-progress Online Payment */}
              {!method.enabled && method.id === 'Online Payment' && (
                <div className="px-5 py-2.5 border-t border-amber-200/80 bg-amber-50/70 text-[11px] text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Online payment gateway is in progress. Please choose <strong>Cash</strong> or <strong>UPI</strong>.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1">
        🔒 Standardized payment processing. Transaction details and method notes are recorded with your booking.
      </p>
    </div>
  );
}
