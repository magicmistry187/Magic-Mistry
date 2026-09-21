import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LazyImage from '../../components/common/LazyImage';
import { useSocketEvent } from '../../context/SocketContext';
import {
  CheckCircle2, Calendar, Clock, MapPin, Wrench,
  CreditCard, Phone, Download, Home, ArrowRight,
  UserCheck, AlertCircle, Loader2, Sparkles, LayoutDashboard
} from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking  = location.state?.booking || null;
  const [currentBooking, setCurrentBooking] = useState(booking);
  const confettiRef = useRef(false);

  // Sync state if navigation location updates
  useEffect(() => {
    if (location.state?.booking) {
      setCurrentBooking(location.state.booking);
    }
  }, [location.state?.booking]);

  // Listen to real-time status updates (e.g. technician accepts booking)
  useSocketEvent('booking:status_changed', (updatedBooking) => {
    if (!updatedBooking || !currentBooking) return;
    const updateId = String(updatedBooking._id || updatedBooking.id);
    const targetId = String(currentBooking._id || currentBooking.id);
    if (updateId === targetId) {
      setCurrentBooking(prev => ({ ...prev, ...updatedBooking }));
    }
  });

  // Listen to real-time cancellation
  useSocketEvent('booking:cancelled', (cancelledBooking) => {
    if (!cancelledBooking || !currentBooking) return;
    const cancelId = String(cancelledBooking._id || cancelledBooking.id);
    const targetId = String(currentBooking._id || currentBooking.id);
    if (cancelId === targetId) {
      setCurrentBooking(prev => ({ ...prev, ...cancelledBooking, bookingStatus: 'Cancelled' }));
    }
  });

  // Redirect if accessed directly without booking data
  useEffect(() => {
    if (!booking) {
      navigate('/', { replace: true });
    }
  }, [booking, navigate]);

  // Simple confetti burst on mount
  useEffect(() => {
    if (confettiRef.current || !booking) return;
    confettiRef.current = true;
    const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const container = document.getElementById('confetti-container');
    if (!container) return;

    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute;
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        left:${Math.random() * 100}%;
        top:-20px;
        opacity:1;
        transform:rotate(${Math.random() * 360}deg);
        animation:fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards;
      `;
      container.appendChild(el);
    }
  }, [booking]);

  const activeBooking = currentBooking || booking;

  const formattedAddress = React.useMemo(() => {
    if (!activeBooking?.address) return '—';
    if (typeof activeBooking.address === 'string') {
      try {
        const parsed = JSON.parse(activeBooking.address);
        if (typeof parsed === 'object' && parsed !== null) {
          const parts = [
            parsed.house || parsed.flat || parsed.addressLine1,
            parsed.street,
            parsed.landmark,
            parsed.city,
            parsed.state,
            parsed.pincode,
          ].filter(Boolean);
          return parts.length > 0 ? parts.join(', ') : (parsed.fullAddress || activeBooking.address.trim() || '—');
        }
      } catch (_) {}
      return activeBooking.address.trim() || '—';
    }
    if (typeof activeBooking.address === 'object') {
      const parts = [
        activeBooking.address.house || activeBooking.address.flat || activeBooking.address.addressLine1,
        activeBooking.address.street,
        activeBooking.address.landmark,
        activeBooking.address.city,
        activeBooking.address.state,
        activeBooking.address.pincode,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : (activeBooking.address.fullAddress || '—');
    }
    return '—';
  }, [activeBooking?.address]);

  if (!activeBooking) return null;

  const rawDate = activeBooking.serviceDate || activeBooking.date;
  let formattedDate = '—';
  if (rawDate) {
    const dateStr = typeof rawDate === 'string' && rawDate.includes('T')
      ? rawDate
      : `${rawDate}T00:00:00`;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      formattedDate = parsed.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
    }
  }

  const bookingIdDisplay = activeBooking._id || activeBooking.bookingId || 'MM-' + Date.now().toString(36).toUpperCase();
  const serviceDisplayName = activeBooking.serviceCategory || activeBooking.appliance || activeBooking.serviceName || 'Appliance Repair';
  const priceDisplay = activeBooking.serviceCategoryCharge ?? activeBooking.basePrice ?? 299;

  const paymentLabel =
    activeBooking.paymentMethod === 'upi'
      ? 'Pay via UPI After Service'
      : activeBooking.paymentMethod === 'cash'
      ? 'Pay Cash After Service'
      : 'Cash / UPI After Service';

  return (
    <>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(0) rotate(0deg); opacity:1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity:0; }
        }
        @keyframes pop-in {
          0%   { transform: scale(0.6); opacity:0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity:1; }
        }
        .pop-in { animation: pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        {/* Confetti layer */}
        <div id="confetti-container" className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />

        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">

            {/* ── Success hero ─────────────────────── */}
            <div className="text-center mb-6">
              <div className="pop-in inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 shadow-lg mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#0B1E40]">Booking Placed! 🎉</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Your service request is active in our technician network.
              </p>

              {/* Booking ID pill */}
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-5 py-2">
                <span className="text-xs text-blue-600 font-medium">Booking ID</span>
                <span className="text-sm font-bold text-blue-800 tracking-wider">
                  {bookingIdDisplay}
                </span>
              </div>
            </div>

            {/* ── Live Technician Status Tracker (Real-Time) ── */}
            {activeBooking.bookingStatus === 'Accepted' || activeBooking.bookingStatus === 'In Progress' ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 mb-5 shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
                    Technician Assigned
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-white/70 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {activeBooking.bookingStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
                      {activeBooking.vendor?.fullName ? activeBooking.vendor.fullName.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {activeBooking.vendor?.fullName || 'Assigned Technician'}
                      </p>
                      <p className="text-xs text-slate-500">Verified Service Partner</p>
                    </div>
                  </div>
                  {activeBooking.vendor?.phoneNumber && (
                    <a
                      href={`tel:${activeBooking.vendor.phoneNumber}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  )}
                </div>
              </div>
            ) : activeBooking.bookingStatus === 'Cancelled' ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-5 flex items-center gap-3 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold">Booking Cancelled</p>
                  <p className="text-xs text-rose-600">This service request has been cancelled.</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3.5 text-amber-900 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Matching Nearby Technician</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your request is broadcasting live. When a specialist accepts, their details will appear here instantly.
                  </p>
                </div>
              </div>
            )}

            {/* ── Details card ──────────────────────── */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-5">

              {/* Card header */}
              <div className="bg-[#0B1E40] px-6 py-4">
                <p className="text-white font-semibold text-sm">Booking Details</p>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Service */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-blue-600" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Service</p>
                    <p className="text-slate-800 font-semibold text-sm truncate">{serviceDisplayName}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Date</p>
                    <p className="text-slate-800 font-semibold text-sm">{formattedDate}</p>
                  </div>
                </div>

                {/* Time slot */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Time Slot</p>
                    <p className="text-slate-800 font-semibold text-sm">{activeBooking.timeSlot || '—'}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <span className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Service Address</p>
                    <p className="text-slate-800 font-semibold text-sm leading-relaxed">
                      {formattedAddress}
                    </p>
                  </div>
                </div>

                {/* Uploaded Image if available */}
                {activeBooking.image && (
                  <div className="flex items-center gap-4 px-6 py-4">
                    <LazyImage
                      src={activeBooking.image}
                      alt="Uploaded problem issue"
                      className="w-14 h-14 rounded-xl border border-slate-200"
                    />
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Attached Photo</p>
                      <p className="text-xs text-blue-600 font-semibold hover:underline truncate">
                        <Link to={activeBooking.image} target="_blank" rel="noopener noreferrer">View full image</Link>
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <span className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Payment</p>
                    <p className="text-slate-800 font-semibold text-sm">{paymentLabel}</p>
                  </div>
                  <span className="text-lg font-bold text-[#0B1E40]">₹{priceDisplay}</span>
                </div>
              </div>

              {/* Parts notice */}
              <div className="bg-amber-50 border-t border-amber-100 px-6 py-3 flex items-start gap-2">
                <span className="text-amber-500 text-base">ℹ️</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Service charge <strong>₹{priceDisplay}</strong> is fixed. If any part needs replacement,
                  the technician will inform you first — <strong>you decide before anything is replaced</strong>.
                </p>
              </div>
            </div>

            {/* ── What happens next ─────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-5">
              <p className="text-sm font-bold text-slate-700 mb-4">What Happens Next?</p>
              <div className="space-y-3">
                {[
                  { step: '01', text: 'You\'ll receive a confirmation SMS / call from our team.' },
                  { step: '02', text: 'Technician will arrive within the selected time slot.' },
                  { step: '03', text: 'After the repair, pay via Cash or UPI — no advance needed.' },
                  { step: '04', text: 'Rate your experience to help us improve!' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0B1E40] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <p className="text-sm text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Support line ──────────────────────── */}
            <div className="flex items-center gap-2 justify-center mb-6 text-sm text-slate-500">
              <Phone className="w-4 h-4 text-blue-500" />
              Need help?&nbsp;
              <Link to="tel:+919999999999" className="font-semibold text-blue-600 hover:underline">
                +91 99999 99999
              </Link>
            </div>

            {/* ── Action buttons ────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-slate-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" /> Back to Home
              </Link>
              <Link
                to="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B1E40] text-white font-semibold text-sm hover:bg-[#1a3a70] transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Track in Dashboard
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
