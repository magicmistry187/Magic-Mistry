import { useBooking } from '../../components/Booking/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { createBookingApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Info, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import LoginRequiredModal from '../auth/LoginRequiredModal';

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
  const { user, isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { basePrice, total } = bookingState.priceInfo;

  const handleBookingSubmit = async () => {
    // Auth check — show modal if not logged in
    if (!isLoggedIn || !token) {
      setShowLoginModal(true);
      return;
    }

    const errs = [];

    if (!bookingState.serviceId && !bookingState.serviceName)
      errs.push('Please select an appliance.');
    if (!bookingState.date)
      errs.push('Please pick a booking date.');
    if (!bookingState.timeSlot)
      errs.push('Please choose a time slot.');
    if (!bookingState.address.trim())
      errs.push('Please enter your service address.');
    /*
    // Commented out: West Bengal boundary restriction
    else if (!isWestBengalAddress(bookingState.address)) {
      errs.push('We only serve West Bengal. Please enter a valid West Bengal address.');
    }
    */

    if (errs.length) {
      setErrors(errs);
      document.getElementById('summary-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setErrors([]);
      setLoading(true);

      const serviceTitle = bookingState.selectedSubServices.length > 0
        ? `${bookingState.serviceName} (${bookingState.selectedSubServices.map(s => s.label).join(', ')})`
        : bookingState.serviceName || 'Appliance Repair';

      const formData = new FormData();
      formData.append('appliance', bookingState.serviceName || 'Appliance Repair');
      formData.append('serviceCategory', serviceTitle);
      formData.append('serviceCategoryCharge', basePrice);
      formData.append('issue', bookingState.problemDescription || (bookingState.selectedSubServices.length > 0 ? bookingState.selectedSubServices.map(s => s.label).join(', ') : 'General Repair & Maintenance'));
      formData.append('address', bookingState.address);
      formData.append('serviceDate', bookingState.date);
      formData.append('timeSlot', bookingState.timeSlot);

      const savedLat = localStorage.getItem('mm_lat');
      const savedLng = localStorage.getItem('mm_lng');
      const lat = bookingState.latitude ?? user?.latitude ?? savedLat ?? null;
      const lng = bookingState.longitude ?? user?.longitude ?? savedLng ?? null;

      // Send latitude and longitude (including null if not present)
      formData.append('latitude', lat !== null && lat !== undefined ? lat : null);
      formData.append('longitude', lng !== null && lng !== undefined ? lng : null);

      if (lat && lng) {
        console.log(`[Magic Mistry Booking] 📍 Sending booking request with coordinates - Latitude: ${lat}, Longitude: ${lng}`);
      } else {
        console.log(`[Magic Mistry Booking] 📍 Sending booking request with null coordinates - Latitude: ${lat}, Longitude: ${lng}`);
      }

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
    <div className="bg-gradient-to-b from-[#0B1E40] to-slate-900 text-white p-7 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(11,_30,_64,_0.3)] sticky top-6 border border-slate-700/50 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/60 relative z-10">
        <h2 className="text-xl font-extrabold tracking-tight">Booking Summary</h2>
        <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/30">
          Checkout
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

        {/* Sub-service packages */}
        {bookingState.selectedSubServices.length > 0 && (
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-400 shrink-0">Packages</span>
            <div className="text-right max-w-[60%] flex flex-col items-end gap-1">
              {bookingState.selectedSubServices.map((sub, idx) => (
                <span key={idx} className="font-semibold text-xs text-emerald-300">
                  {sub.label}
                </span>
              ))}
            </div>
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
      <div className="space-y-4 mb-6 pb-6 border-b border-slate-700/60 relative z-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="h-px bg-slate-700 flex-1"></span> Price Breakdown <span className="h-px bg-slate-700 flex-1"></span>
        </p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-300 font-medium">Selected Packages</span>
          <span className="font-bold text-white">
            ₹{bookingState.serviceId ? Number(basePrice).toFixed(2) : '0.00'}
          </span>
        </div>
        <div className="flex items-start gap-3 bg-slate-800/80 rounded-2xl p-4 mt-4 border border-slate-700/50">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="text-amber-300 font-bold block mb-1">
              Part charges are extra
            </span>
            Technician will inform you first.{' '}
            <span className="text-white font-semibold">
              You decide before any part is replaced.
            </span>
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Fixed Charge</span>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 leading-none">
            ₹{bookingState.serviceId ? Number(total).toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mb-8 font-medium">
        + Part costs (if any) confirmed on-site.
      </p>

      {/* Unauthenticated User Warning */}
      {!isLoggedIn && (
        <div className="mb-6 bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/30 rounded-2xl p-4 flex items-start gap-3 text-sm text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-amber-300">Login Required</p>
            <p className="mt-1 leading-relaxed text-xs opacity-90">
              Please log in to submit your booking.{' '}
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: '/booking', reason: 'A user cannot make a booking until they log in.' } })}
                className="underline font-bold text-orange-400 hover:text-orange-300 cursor-pointer ml-1"
              >
                Log in now
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Validation errors */}
      {errors.length > 0 && (
        <div
          id="summary-errors"
          className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-2 backdrop-blur-sm"
        >
          {errors.map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-red-300 font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Submit button (Step 7) */}
      <div className="relative z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <button
          onClick={handleBookingSubmit}
          disabled={loading}
          className="relative w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-wait text-white font-black py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 flex justify-center items-center gap-3 cursor-pointer text-base uppercase tracking-wider overflow-hidden"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Confirming…
            </>
          ) : (
            <>
              Confirm Booking
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-4 text-xs text-slate-400 flex items-center justify-center gap-1">
        🔒 Pay after service — Cash / UPI only
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        appliance={{ name: bookingState.serviceName || 'Appliance Repair' }}
      />
    </div>
  );
}
