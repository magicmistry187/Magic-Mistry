import React from 'react';
import { useBooking } from '../../components/Booking/BookingContext';
import { Banknote, Smartphone, CreditCard, Lock } from 'lucide-react';

const methods = [
  {
    id: 'cash',
    label: 'Pay Cash After Service',
    description: 'Hand over cash directly to the technician once the job is done.',
    icon: <Banknote className="w-5 h-5" />,
    badge: null,
    enabled: true,
  },
  {
    id: 'upi',
    label: 'Pay via UPI After Service',
    description: 'Scan &amp; pay via PhonePe, Google Pay, Paytm or any UPI app after service.',
    icon: <Smartphone className="w-5 h-5" />,
    badge: 'RECOMMENDED',
    enabled: true,
  },
  {
    id: 'online',
    label: 'Online Payment (Card / Net Banking)',
    description: 'Coming soon — online prepayment is currently unavailable.',
    icon: <CreditCard className="w-5 h-5" />,
    badge: 'COMING SOON',
    enabled: false,
  },
];

export default function PaymentMethod() {
  const { bookingState, updateBooking } = useBooking();
  const selected = bookingState.paymentMethod || null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-extrabold text-[#0B1E40] mb-5 flex items-center gap-3">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
          6
        </span>
        Select Payment Method
      </h2>

      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selected === method.id && method.enabled;

          return (
            <button
              key={method.id}
              disabled={!method.enabled}
              onClick={() => method.enabled && updateBooking('paymentMethod', method.id)}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                !method.enabled
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {/* Radio dot */}
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </span>

              {/* Icon */}
              <span
                className={`flex-shrink-0 p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {method.icon}
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-blue-900' : 'text-slate-800'
                    }`}
                  >
                    {method.label}
                  </span>
                  {method.badge === 'RECOMMENDED' && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      RECOMMENDED
                    </span>
                  )}
                  {method.badge === 'COMING SOON' && (
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> COMING SOON
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {method.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1">
        🔒 No advance payment required. You pay only after the service is completed.
      </p>
    </div>
  );
}
