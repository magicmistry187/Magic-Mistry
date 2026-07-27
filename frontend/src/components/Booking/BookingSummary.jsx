import { useBooking } from '../../components/Booking/BookingContext';
import { useNavigate } from 'react-router-dom';
import { Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';

/* West Bengal keywords — same list as AddressForm */
const WB_KEYWORDS = [
  'west bengal', 'wb',
  'kolkata', 'calcutta', 'howrah', 'hooghly', 'durgapur',
  'asansol', 'siliguri', 'bardhaman', 'burdwan', 'malda',
  'kharagpur', 'haldia', 'raiganj', 'jalpaiguri', 'cooch behar',
  'bankura', 'purulia', 'midnapore', 'medinipur', 'barasat',
  'krishnanagar', 'nabadwip', 'santiniketan', 'bolpur',
  'barrackpore', 'north 24 parganas', 'south 24 parganas',
  'murshidabad', 'nadia', 'birbhum', 'berhampore',
];
const isWestBengalAddress = (addr) => {
  const lower = addr.toLowerCase();
  return WB_KEYWORDS.some((kw) => lower.includes(kw));
};

/* Generate a simple booking ID */
const genBookingId = () =>
  'MM' + Date.now().toString(36).toUpperCase().slice(-6) +
  Math.random().toString(36).toUpperCase().slice(2, 5);

export default function BookingSummary() {
  const { bookingState } = useBooking();
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const { basePrice, total } = bookingState.priceInfo;

  const handleBookingSubmit = async () => {
    const errs = [];

    if (!bookingState.serviceId)   errs.push('Please select an appliance.');
    if (!bookingState.date)        errs.push('Please pick a booking date.');
    if (!bookingState.timeSlot)    errs.push('Please choose a time slot.');
    if (!bookingState.address.trim()) errs.push('Please enter your service address.');
    else if (!isWestBengalAddress(bookingState.address)) {
      errs.push('We only serve West Bengal. Please enter a valid West Bengal address.');
    }

    if (errs.length) {
      setErrors(errs);
      // Scroll errors into view
      document.getElementById('summary-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors([]);
    setLoading(true);

    // Simulate brief API call (replace with real axios call later)
    await new Promise((r) => setTimeout(r, 900));

    const bookingPayload = {
      bookingId:     genBookingId(),
      serviceId:     bookingState.serviceId,
      serviceName:   bookingState.serviceName,
      date:          bookingState.date,
      timeSlot:      bookingState.timeSlot,
      address:       bookingState.address,
      paymentMethod: bookingState.paymentMethod,
      basePrice,
      total,
      problemDescription: bookingState.problemDescription,
    };

    console.log('Booking payload:', bookingPayload);

    setLoading(false);
    navigate('/booking/confirmation', { state: { booking: bookingPayload } });
  };

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg sticky top-6">
      <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>

      {/* Service & Schedule */}
      <div className="space-y-4 mb-5 text-sm border-b border-slate-600 pb-5">
        <div className="flex justify-between">
          <span className="text-slate-300">Service</span>
          <span className="font-medium text-right max-w-[55%]">
            {bookingState.serviceName || <span className="text-slate-500 italic">Not selected</span>}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Date</span>
          <span className="font-medium text-right">
            {bookingState.date
              ? new Date(bookingState.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : <span className="text-slate-500 italic">Not selected</span>}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Time</span>
          <span className="font-medium text-right text-xs">
            {bookingState.timeSlot || <span className="text-slate-500 italic">Not selected</span>}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Payment</span>
          <span className="font-medium capitalize text-xs">
            {bookingState.paymentMethod === 'upi' ? 'UPI After Service'
              : bookingState.paymentMethod === 'cash' ? 'Cash After Service'
              : '—'}
          </span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 mb-5 text-sm border-b border-slate-600 pb-5">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Price Breakdown</p>
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Service / Labour Charge</span>
          <span className="font-semibold text-white">
            ₹{bookingState.serviceId ? Number(basePrice).toFixed(2) : '0.00'}
          </span>
        </div>
        <div className="flex items-start gap-2 bg-slate-700/60 rounded-lg p-3 mt-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="text-amber-300 font-semibold">Part charges extra</span> — technician
            informs you first.{' '}
            <span className="text-white font-medium">You decide before any part is replaced.</span>
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-base text-slate-200">Service Charge</span>
        <span className="text-2xl font-bold text-white">
          ₹{bookingState.serviceId ? Number(total).toFixed(2) : '0.00'}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 mb-5">
        + Part costs (if any) confirmed by technician on-site.
      </p>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div id="summary-errors" className="mb-4 bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3 space-y-1.5">
          {errors.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleBookingSubmit}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Confirming…
          </>
        ) : (
          'Confirm & Book →'
        )}
      </button>

      <div className="text-center mt-4 text-xs text-slate-400 flex items-center justify-center gap-1">
        🔒 Pay after service — Cash / UPI only
      </div>
    </div>
  );
}