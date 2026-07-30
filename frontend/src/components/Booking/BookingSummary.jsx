import { useBooking } from '../../components/Booking/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { createBookingApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';

/* West Bengal keywords — same list as AddressForm */
const WB_KEYWORDS = [
  'west bengal',
  'wb',
  'kolkata',
  'calcutta',
  'howrah',
  'hooghly',
  'durgapur',
  'asansol',
  'siliguri',
  'bardhaman',
  'burdwan',
  'malda',
  'kharagpur',
  'haldia',
  'raiganj',
  'jalpaiguri',
  'cooch behar',
  'bankura',
  'purulia',
  'midnapore',
  'medinipur',
  'barasat',
  'krishnanagar',
  'nabadwip',
  'santiniketan',
  'bolpur',
  'barrackpore',
  'north 24 parganas',
  'south 24 parganas',
  'murshidabad',
  'nadia',
  'birbhum',
  'berhampore',
];

const isWestBengalAddress = (addr) => {
  const lower = addr.toLowerCase();
  return WB_KEYWORDS.some((kw) => lower.includes(kw));
};

export default function BookingSummary() {
  const { bookingState } = useBooking();
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const { basePrice, total } = bookingState.priceInfo;

  const handleBookingSubmit = async () => {
    const errs = [];

    // Auth check — redirect to login if not logged in
    if (!isLoggedIn || !token) {
      errs.push('A user cannot make a booking until they log in.');
    }

    if (!bookingState.serviceId && !bookingState.serviceName)
      errs.push('Please select an appliance.');
    if (!bookingState.date)
      errs.push('Please pick a booking date.');
    if (!bookingState.timeSlot)
      errs.push('Please choose a time slot.');
    if (!bookingState.address.trim())
      errs.push('Please enter your service address.');
    else if (!isWestBengalAddress(bookingState.address)) {
      errs.push('We only serve West Bengal. Please enter a valid West Bengal address.');
    }

    if (errs.length) {
      setErrors(errs);
      document.getElementById('summary-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Redirect to login if unauthenticated
      if (!isLoggedIn || !token) {
        setTimeout(() => {
          navigate('/login', { state: { from: '/booking', reason: 'A user cannot make a booking until they log in.' } });
        }, 1200);
      }
      return;
    }

    try {
      setErrors([]);
      setLoading(true);

      const serviceTitle = bookingState.selectedSubService
        ? `${bookingState.serviceName} (${bookingState.selectedSubService})`
        : bookingState.serviceName || 'Appliance Repair';

      const formData = new FormData();
      formData.append('appliance', bookingState.serviceName || 'Appliance Repair');
      formData.append('serviceCategory', serviceTitle);
      formData.append('serviceCategoryCharge', basePrice);
      formData.append('issue', bookingState.problemDescription || bookingState.selectedSubService || 'General Repair & Maintenance');
      formData.append('address', bookingState.address);
      formData.append('serviceDate', bookingState.date);
      formData.append('timeSlot', bookingState.timeSlot);

      if (bookingState.imageFile) {
        formData.append('image', bookingState.imageFile);
      }

      const res = await createBookingApi(formData, token);

      if (res.success && res.booking) {
        navigate('/booking/confirmation', { state: { booking: res.booking } });
      } else {
        setErrors([res.message || 'Failed to place booking. Please try again.']);
        document.getElementById('summary-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      setErrors([error.message || 'Booking failed. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg sticky top-6">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-700">
        <h2 className="text-xl font-bold">Booking Summary</h2>
        <span className="text-[11px] font-extrabold bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/30">
          Step 7 of 7
        </span>
      </div>

      {/* Service & Schedule */}
      <div className="space-y-3.5 mb-5 text-sm border-b border-slate-600 pb-5">

        {/* Appliance */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-400 shrink-0">Appliance</span>
          <span className="font-bold text-right max-w-[55%] text-orange-300">
            {bookingState.serviceName || <span className="text-red-400 italic font-normal">Not selected</span>}
          </span>
        </div>

        {/* Sub-service package */}
        {bookingState.selectedSubService && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-400 shrink-0">Package</span>
            <span className="font-semibold text-right max-w-[60%] text-xs text-emerald-300">
              {bookingState.selectedSubService}
            </span>
          </div>
        )}

        {/* Date */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-400 shrink-0">Date</span>
          <span className="font-medium text-right">
            {bookingState.date
              ? new Date(bookingState.date + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
              : <span className="text-red-400 italic font-normal">Not selected</span>}
          </span>
        </div>

        {/* Time slot */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-400 shrink-0">Time</span>
          <span className="font-medium text-right text-xs">
            {bookingState.timeSlot || <span className="text-red-400 italic font-normal">Not selected</span>}
          </span>
        </div>

        {/* Address */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-400 shrink-0">Address</span>
          <span className="font-medium text-right text-xs max-w-[60%] leading-relaxed">
            {bookingState.address?.trim()
              ? bookingState.address
              : <span className="text-red-400 italic font-normal">Not entered</span>}
          </span>
        </div>

        {/* Payment */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-400 shrink-0">Payment</span>
          <span className="font-medium capitalize text-xs text-blue-300">
            {bookingState.paymentMethod === 'upi'
              ? 'UPI After Service'
              : bookingState.paymentMethod === 'cash'
              ? 'Cash After Service'
              : 'Cash / UPI'}
          </span>
        </div>

        {/* Issue description — Optional */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-slate-400 shrink-0">
            Issue
            <span className="ml-1 text-[10px] text-slate-500">(optional)</span>
          </span>
          <span className="text-right max-w-[60%] text-xs leading-relaxed">
            {bookingState.problemDescription?.trim()
              ? <span className="text-slate-200">{bookingState.problemDescription}</span>
              : <span className="text-slate-500 italic">Not provided</span>}
          </span>
        </div>

        {/* Image — Optional */}
        <div className="flex justify-between items-center gap-2">
          <span className="text-slate-400 shrink-0">
            Image
            <span className="ml-1 text-[10px] text-slate-500">(optional)</span>
          </span>
          <span className="text-right text-xs">
            {bookingState.imageFile
              ? <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {bookingState.imageFile.name.length > 18
                    ? bookingState.imageFile.name.slice(0, 18) + '…'
                    : bookingState.imageFile.name}
                </span>
              : <span className="text-slate-500 italic">No image</span>}
          </span>
        </div>
      </div>


      {/* Price breakdown */}
      <div className="space-y-3 mb-5 text-sm border-b border-slate-600 pb-5">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">
          Price Breakdown
        </p>
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Fixed Package Price</span>
          <span className="font-semibold text-white">
            ₹{bookingState.serviceId ? Number(basePrice).toFixed(2) : '0.00'}
          </span>
        </div>
        <div className="flex items-start gap-2 bg-slate-700/60 rounded-lg p-3 mt-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="text-amber-300 font-semibold">
              Part charges extra
            </span>{' '}
            — technician informs you first.{' '}
            <span className="text-white font-medium">
              You decide before any part is replaced.
            </span>
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-base text-slate-200">Total Fixed Charge</span>
        <span className="text-2xl font-extrabold text-emerald-400">
          ₹{bookingState.serviceId ? Number(total).toFixed(2) : '0.00'}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 mb-5">
        + Part costs (if any) confirmed by technician on-site.
      </p>

      {/* Unauthenticated User Warning */}
      {!isLoggedIn && (
        <div className="mb-4 bg-amber-500/20 border border-amber-400/40 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Login Required</p>
            <p className="mt-0.5 leading-relaxed text-[11px]">
              A user cannot make a booking until they log in.{' '}
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: '/booking', reason: 'A user cannot make a booking until they log in.' } })}
                className="underline font-extrabold text-orange-400 hover:text-orange-300 cursor-pointer ml-0.5"
              >
                Log in now →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Validation errors */}
      {errors.length > 0 && (
        <div
          id="summary-errors"
          className="mb-4 bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3 space-y-1.5"
        >
          {errors.map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-red-300"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Submit button (Step 7) */}
      <button
        onClick={handleBookingSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-wait text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer text-base"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Confirming Booking…
          </>
        ) : (
          'Step 7: Confirm Booking →'
        )}
      </button>

      <div className="text-center mt-4 text-xs text-slate-400 flex items-center justify-center gap-1">
        🔒 Pay after service — Cash / UPI only
      </div>
    </div>
  );
}
