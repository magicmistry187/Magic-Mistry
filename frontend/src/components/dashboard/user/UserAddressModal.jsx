// UserAddressModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// User Dashboard Component — Add / Edit saved address for the logged-in user.
// Used exclusively in: pages/dashboard/UserDashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Tag,
  LocateFixed,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { parseAddressString, INDIAN_STATES } from '../../../utils/addressParser';

export default function UserAddressModal({ isOpen, onClose, onSave, initialData }) {
  const [type, setType] = useState('Home');
  const [flat, setFlat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [geoCoords, setGeoCoords] = useState(null);

  const [locState, setLocState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [locError, setLocError] = useState('');

  useEffect(() => {
    if (initialData) {
      const parsed = typeof initialData === 'object' ? {
        flat: initialData.flat || initialData.house || initialData.addressLine1 || '',
        street: initialData.street || '',
        city: initialData.city || '',
        state: initialData.state || '',
        landmark: initialData.landmark || '',
        pincode: initialData.pincode || '',
      } : parseAddressString(initialData);

      setType(initialData.type || initialData.addressType || 'Home');
      setFlat(parsed.flat || '');
      setStreet(parsed.street || '');
      setCity(parsed.city || '');
      setState(parsed.state || '');
      setLandmark(parsed.landmark || '');
      setPincode(parsed.pincode || '');
      setIsDefault(!!initialData.isDefault);
      if (initialData.location?.coordinates?.length === 2) {
        setGeoCoords({
          lng: initialData.location.coordinates[0],
          lat: initialData.location.coordinates[1],
        });
      } else if (initialData.latitude && initialData.longitude) {
        setGeoCoords({
          lat: Number(initialData.latitude),
          lng: Number(initialData.longitude),
        });
      } else {
        setGeoCoords(null);
      }
    } else {
      setType('Home');
      setFlat('');
      setStreet('');
      setCity('');
      setState('');
      setLandmark('');
      setPincode('');
      setIsDefault(false);
      setGeoCoords(null);
    }
    setLocState('idle');
    setLocError('');
  }, [initialData, isOpen]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocState('error');
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocState('loading');
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

          // 1. House / Flat / Building / Shop
          const detectedHouse =
            a.house_number ||
            a.building ||
            a.flat ||
            a.room ||
            a.house_name ||
            a.shop ||
            a.commercial ||
            a.apartments ||
            '';

          // 2. Road / Street
          const road = a.road || a.pedestrian || a.footway || a.street || a.path || a.highway || '';

          // 3. Locality / Suburb / Area
          const locality =
            a.suburb ||
            a.neighbourhood ||
            a.residential ||
            a.subdistrict ||
            a.city_district ||
            a.quarter ||
            a.hamlet ||
            a.village_district ||
            '';

          const detectedStreet = [road, locality].filter(Boolean).join(', ');

          // 4. City / Town
          const detectedCity =
            a.city ||
            a.town ||
            a.village ||
            a.municipality ||
            a.state_district ||
            a.county ||
            a.district ||
            '';

          // 5. State
          const detectedState = a.state || a.province || a.region || '';

          // 6. Landmark
          const detectedLandmark =
            a.landmark || a.attraction || a.amenity || a.place || a.historic || a.leisure || '';

          // 7. Pincode
          const detectedPincode = (a.postcode || '').replace(/\D/g, '').slice(0, 6);

          // Fallback parsing from full display_name if needed
          const combinedStr = data.display_name || '';
          const parsedCombined = parseAddressString(combinedStr);

          setFlat(detectedHouse || parsedCombined.flat || '');
          setStreet(detectedStreet || parsedCombined.street || '');
          setCity(detectedCity || parsedCombined.city || '');
          setState(detectedState || parsedCombined.state || '');
          setLandmark(detectedLandmark || parsedCombined.landmark || '');
          setPincode(detectedPincode || parsedCombined.pincode || '');
          setGeoCoords({ lat: coords.latitude, lng: coords.longitude });
          setLocState('success');
          setLocError('');
        } catch {
          setLocState('error');
          setLocError('Could not fetch location details. Please enter manually.');
        }
      },
      (err) => {
        setLocState('error');
        setLocError(
          err.code === 1
            ? 'Location permission denied. Please allow access and try again.'
            : 'Unable to retrieve your location. Please enter manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanFlat = flat.trim();
    const cleanStreet = street.trim();
    const cleanLandmark = landmark.trim();
    const cleanCity = city.trim();
    const cleanState = state.trim();
    const cleanPincode = pincode.trim();

    const formattedAddress = [cleanFlat, cleanStreet, cleanLandmark, cleanCity, cleanState, cleanPincode]
      .filter(Boolean)
      .join(', ');

    onSave({
      id: initialData?.id || initialData?._id,
      _id: initialData?._id || initialData?.id,
      type,
      addressType: type,
      flat: cleanFlat,
      house: cleanFlat || cleanStreet || 'Home',
      addressLine1: cleanFlat || cleanStreet || '',
      street: cleanStreet,
      city: cleanCity,
      state: cleanState,
      country: 'India',
      landmark: cleanLandmark,
      pincode: cleanPincode,
      isDefault,
      latitude: geoCoords?.lat,
      longitude: geoCoords?.lng,
      location: geoCoords ? { type: 'Point', coordinates: [geoCoords.lng, geoCoords.lat] } : undefined,
      formattedAddress,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        >
          <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <MapPin className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="font-extrabold text-base tracking-wide text-white">
                {initialData ? 'Edit Address' : 'Add New Address'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 overflow-y-auto">
            {/* Auto-detect Location Button */}
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locState === 'loading'}
              className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border-2 font-bold text-xs transition-all cursor-pointer ${
                locState === 'success'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : locState === 'error'
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : locState === 'loading'
                  ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-wait'
                  : 'border-dashed border-orange-400 bg-orange-50/50 text-orange-700 hover:bg-orange-100 hover:border-orange-500'
              }`}
            >
              {locState === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
              {locState === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {locState === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              {locState === 'idle' && <LocateFixed className="w-4 h-4 text-orange-600" />}
              <span>
                {locState === 'loading' && 'Fetching your location...'}
                {locState === 'success' && 'Location detected — fields auto-filled below'}
                {locState === 'error' && 'Try Again'}
                {locState === 'idle' && 'Use My Current Location'}
              </span>
            </button>

            {locState === 'error' && locError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{locError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">or fill in manually</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Tag / Type Selection */}
            <div>
              <label className="block font-extrabold text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2">
                Address Type
              </label>
              <div className="flex gap-2.5">
                {[
                  { label: 'Home', icon: Home },
                  { label: 'Office', icon: Briefcase },
                  { label: 'Other', icon: Tag },
                ].map((item) => {
                  const isSelected = type === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setType(item.label)}
                      className={`flex-1 py-2.5 sm:py-3 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 border border-orange-500'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* House / Flat / Building No. */}
            <div>
              <label className="block font-bold text-xs text-slate-600 mb-1.5">
                House / Flat / Building No. <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. Flat 402, Green Valley Apartments"
                className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            {/* Street / Area / Locality */}
            <div>
              <label className="block font-bold text-xs text-slate-600 mb-1.5">
                Street / Area / Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 10th Main Road, Indiranagar"
                className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-xs text-slate-600 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kolkata"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block font-bold text-xs text-slate-600 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="user-states-list"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. West Bengal"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <datalist id="user-states-list">
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Landmark & Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-xs text-slate-600 mb-1.5">
                  Landmark <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block font-bold text-xs text-slate-600 mb-1.5">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="700001"
                  maxLength={6}
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Default Address Option */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="userAddressDefaultCheckbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="userAddressDefaultCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                Set as default delivery / service address
              </label>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-200 transition-colors cursor-pointer"
              >
                Save Address
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
