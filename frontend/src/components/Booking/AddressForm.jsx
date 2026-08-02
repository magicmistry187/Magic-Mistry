import React, { useState } from 'react';
import { useBooking } from '../../components/Booking/BookingContext';
import {
  LocateFixed, Loader2, MapPin, AlertCircle, CheckCircle2,
  MapPinOff, Clock3,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

/* ── Location states ─────────────────────────────── */
const LOC = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

/* ── West Bengal keywords ────────────────────────── */
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

/* ── Out-of-area popup ───────────────────────────── */
function OutOfAreaModal({ city, state, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0B1E40] to-[#1a3a70] px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <MapPinOff className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold">Outside Our Service Area</h2>
          {(city || state) && (
            <p className="text-blue-200 text-sm mt-1">
              {city ? `${city}${state ? ', ' : ''}` : ''}{state || ''}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="flex justify-center mb-3">
            <span className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <Clock3 className="w-6 h-6 text-amber-500" />
            </span>
          </div>
          <h3 className="text-slate-800 font-bold text-lg leading-snug">
            We're Expanding to <br />Your Area Soon! 🚀
          </h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Currently, Magic Mistry services are available only in{' '}
            <span className="font-semibold text-[#0B1E40]">West Bengal</span>.
            We're working hard to bring our verified technicians to your city very soon.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-xs font-semibold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Launching in your area soon
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full bg-[#0B1E40] hover:bg-[#1a3a70] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Got it, I'll Enter a West Bengal Address
          </button>
          <p className="text-center text-[11px] text-gray-400">
            Services currently available only in West Bengal.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */

export default function AddressForm() {
  const { bookingState, updateBooking } = useBooking();
  const { location, updateLocation } = useAuth();
  const [locState, setLocState]     = useState(LOC.IDLE);
  const [locError, setLocError]     = useState('');
  const [outOfArea, setOutOfArea]   = useState(null);
  const [addrError, setAddrError]   = useState('');

  // Sync saved global location into booking address if empty
  React.useEffect(() => {
    if (!bookingState.address && location) {
      updateBooking('address', location);
    }
  }, [location]);

  /* ── Validate manual address on blur ────────────── */
  const handleAddressBlur = () => {
    const addr = bookingState.address.trim();
    if (!addr) return; // empty — let submit handle it
    if (!isWestBengalAddress(addr)) {
      setAddrError('');
      setOutOfArea({ city: '', state: '' });
      updateBooking('address', ''); // clear invalid address
    } else {
      setAddrError('');
    }
  };

  /* ── Geolocation → reverse-geocode ─────────────── */
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocState(LOC.ERROR);
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocState(LOC.LOADING);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const a = data.address || {};

          const detectedState = (a.state || '').toLowerCase();
          const isWB = detectedState.includes('west bengal');

          if (!isWB) {
            setLocState(LOC.IDLE);
            setOutOfArea({
              city:  a.city || a.town || a.village || a.county || '',
              state: a.state || '',
            });
            return;
          }

          const parts = [
            a.house_number,
            a.road || a.pedestrian || a.footway,
            a.neighbourhood || a.suburb,
            a.city || a.town || a.village || a.county,
            a.state,
            a.postcode,
          ].filter(Boolean);

          const fullAddress = parts.length ? parts.join(', ') : data.display_name;
          updateBooking('address', fullAddress);
          updateLocation(fullAddress);
          setAddrError('');
          setLocState(LOC.SUCCESS);
        } catch {
          setLocState(LOC.ERROR);
          setLocError('Could not fetch address. Please enter manually.');
        }
      },
      (err) => {
        setLocState(LOC.ERROR);
        setLocError(
          err.code === 1
            ? 'Location permission denied. Please allow access and try again.'
            : 'Unable to retrieve your location. Please enter manually.'
        );
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <>
      {outOfArea && (
        <OutOfAreaModal
          city={outOfArea.city}
          state={outOfArea.state}
          onClose={() => setOutOfArea(null)}
        />
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-extrabold text-[#0B1E40] mb-4 flex items-center gap-3">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
            4
          </span>
          Share Address
        </h2>

        {/* ── Use My Location button ──────────────── */}
        <button
          onClick={handleUseLocation}
          disabled={locState === LOC.LOADING}
          className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all mb-4 ${
            locState === LOC.SUCCESS
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : locState === LOC.ERROR
              ? 'border-red-300 bg-red-50 text-red-600'
              : locState === LOC.LOADING
              ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-wait'
              : 'border-dashed border-blue-400 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:border-blue-500 cursor-pointer'
          }`}
        >
          {locState === LOC.LOADING && <Loader2 className="w-4 h-4 animate-spin" />}
          {locState === LOC.SUCCESS && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {locState === LOC.ERROR   && <AlertCircle className="w-4 h-4 text-red-500" />}
          {locState === LOC.IDLE    && <LocateFixed className="w-4 h-4" />}
          <span>
            {locState === LOC.LOADING && 'Fetching your location…'}
            {locState === LOC.SUCCESS && 'Location detected — you can edit below'}
            {locState === LOC.ERROR   && 'Try again'}
            {locState === LOC.IDLE    && 'Use My Current Location'}
          </span>
        </button>

        {locState === LOC.ERROR && locError && (
          <div className="flex items-start gap-2 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            {locError}
          </div>
        )}

        {/* Service area notice */}
        <div className="flex items-center gap-2 mb-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
          <span>We currently serve only <strong>West Bengal</strong>. Please enter a West Bengal address.</span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or enter manually</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* ── Address textarea ──────────────────────── */}
        <div className="relative">
          <MapPin className="absolute top-3 left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <textarea
            className={`w-full border rounded-xl pl-9 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm ${
              addrError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
            rows="3"
            placeholder="House No., Street, Area, City (West Bengal), Pincode…"
            value={bookingState.address}
            onBlur={handleAddressBlur}
            onChange={(e) => {
              updateBooking('address', e.target.value);
              setAddrError('');
              if (locState === LOC.SUCCESS) setLocState(LOC.IDLE);
            }}
          />
        </div>
        {addrError && (
          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {addrError}
          </p>
        )}

      </div>
    </>
  );
}