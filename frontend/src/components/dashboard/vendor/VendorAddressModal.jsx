import React, { useState, useEffect, useRef } from 'react';
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
  Map,
} from 'lucide-react';
import { parseAddressString, INDIAN_STATES, cleanPostalParentheses } from '../../../utils/addressParser';
import { getCurrentCoordinates, reverseGeocode } from '../../../utils/reverseGeocode';
import InteractiveMapPicker from '../../common/InteractiveMapPicker';
import { useModalSmoothScroll } from '../../common/useModalSmoothScroll';

export default function VendorAddressModal({ isOpen, onClose, onSave, initialAddress }) {
  const overlayRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Physics-based smooth scrolling for modal + complete background page lock
  useModalSmoothScroll({
    isOpen,
    overlayRef,
    scrollContainerRef,
  });
  const [type, setType] = useState('Home');
  const [flat, setFlat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [geoCoords, setGeoCoords] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [locState, setLocState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [locError, setLocError] = useState('');


  useEffect(() => {
    if (initialAddress) {
      const parsed = parseAddressString(initialAddress);

      let safeFlat = (parsed.flat || '').trim();
      if (safeFlat.includes(',') || safeFlat.length > 25 || (parsed.street && safeFlat.toLowerCase() === parsed.street.toLowerCase())) {
        safeFlat = '';
      }

      const chosenType =
        typeof initialAddress === 'object' && (initialAddress.type || initialAddress.addressType)
          ? initialAddress.type || initialAddress.addressType
          : 'Home';

      setType(chosenType);
      setFlat(safeFlat);
      setStreet(parsed.street || '');
      setCity(parsed.city || '');
      setState(parsed.state || '');
      setLandmark(parsed.landmark || '');
      setPincode(parsed.pincode === '000000' ? '' : (parsed.pincode || ''));

      if (typeof initialAddress === 'object') {
        if (initialAddress.location?.coordinates?.length === 2) {
          setGeoCoords({
            lng: initialAddress.location.coordinates[0],
            lat: initialAddress.location.coordinates[1],
          });
        } else if (initialAddress.latitude && initialAddress.longitude) {
          setGeoCoords({
            lat: Number(initialAddress.latitude),
            lng: Number(initialAddress.longitude),
          });
        }
      }
    } else {
      setType('Home');
      setFlat('');
      setStreet('');
      setCity('');
      setState('');
      setLandmark('');
      setPincode('');
      setGeoCoords(null);
    }
    setLocState('idle');
    setLocError('');
    setShowMap(false);
  }, [initialAddress, isOpen]);

  const handleUseLocation = async () => {
    setLocState('loading');
    setLocError('');
    try {
      const coords = await getCurrentCoordinates({ desiredAccuracy: 35, timeout: 12000 });
      const address = await reverseGeocode(coords.latitude, coords.longitude);

      const rawFlat = (address.flat || '').trim();
      const safeFlat = rawFlat && !rawFlat.includes(',') && rawFlat.length <= 25 ? rawFlat : '';
      setFlat(safeFlat);
      setStreet((address.street || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim());
      setCity(cleanPostalParentheses(address.city || ''));
      setState(address.state || '');
      setLandmark(address.landmark || '');
      setPincode((address.pincode || '').replace(/\D/g, '').slice(0, 6));
      setGeoCoords({ lat: coords.latitude, lng: coords.longitude });
      setShowMap(true);
      setLocState('success');
      setLocError('');
    } catch (err) {
      console.error('[VendorAddressModal] Geolocation error:', err);
      setLocState('error');
      setLocError(err.message || 'Could not fetch location details. Please enter manually.');
    }
  };

  const handleMapSelect = ({ coords, address }) => {
    if (!coords) return;
    setGeoCoords(coords);
    if (address) {
      const rawFlat = (address.flat || '').trim();
      const safeFlat = rawFlat && !rawFlat.includes(',') && rawFlat.length <= 25 ? rawFlat : '';
      setFlat(safeFlat);
      setStreet((address.street || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim());
      setCity(cleanPostalParentheses(address.city || ''));
      setState(address.state || '');
      setLandmark(address.landmark || '');
      setPincode((address.pincode || '').replace(/\D/g, '').slice(0, 6));
    }
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

    const addressId = typeof initialAddress === 'object' ? (initialAddress?._id || initialAddress?.id || initialAddress?.addressId) : null;

    // Pass a full structured object so the parent handler can call the address API
    onSave({
      _id: addressId,
      id: addressId,
      flat: cleanFlat,
      house: cleanFlat,
      addressLine1: cleanFlat ? `${cleanFlat}, ${cleanStreet}` : cleanStreet,
      street: cleanStreet,
      landmark: cleanLandmark,
      city: cleanCity,
      state: cleanState,
      country: 'India',
      pincode: cleanPincode,
      type,
      addressType: type,
      latitude: geoCoords?.lat,
      longitude: geoCoords?.lng,
      location: geoCoords ? { type: 'Point', coordinates: [geoCoords.lng, geoCoords.lat] } : undefined,
      formattedAddress: formattedAddress || `${cleanFlat} ${cleanStreet} ${cleanCity}`.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        ref={overlayRef}
        data-lenis-prevent
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overscroll-contain"
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        >
          <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <MapPin className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="font-extrabold text-base tracking-wide text-white">
                {initialAddress ? 'Edit Service Address' : 'Add New Address'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            ref={scrollContainerRef}
            data-lenis-prevent
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 p-6 space-y-4 text-xs sm:text-sm text-slate-700 overflow-y-auto overscroll-contain"
          >
            {/* Location Detection & Map Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locState === 'loading'}
                className={`flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl border-2 font-bold text-xs transition-all cursor-pointer ${
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
                  {locState === 'loading' && 'Acquiring GPS...'}
                  {locState === 'success' && 'GPS Detected ✓'}
                  {locState === 'error' && 'Retry GPS'}
                  {locState === 'idle' && 'Use My Current Location'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                className={`flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl border-2 font-bold text-xs transition-all cursor-pointer ${
                  showMap
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm'
                    : 'border-dashed border-orange-300 bg-orange-50/50 text-orange-800 hover:bg-orange-100'
                }`}
              >
                <Map className="w-4 h-4 text-orange-600" />
                <span>{showMap ? 'Hide Map View' : 'Pinpoint / Adjust on Map'}</span>
              </button>
            </div>

            {/* Interactive Map Picker */}
            {showMap && (
              <div className="space-y-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    Drag pin to your exact workshop or service base location
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                  >
                    ✕ Close Map
                  </button>
                </div>
                <InteractiveMapPicker
                  initialCoords={geoCoords}
                  onLocationSelect={handleMapSelect}
                  height="260px"
                  showSearch={true}
                />
              </div>
            )}

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

            {/* Address Type */}
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

            {/* Store / Shop / Building No. */}
            <div>
              <label className="block font-bold text-xs text-slate-600 mb-1.5">
                Store / Shop / Building No. <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. Shop #12, Building 3"
                className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            {/* Street / Locality */}
            <div>
              <label className="block font-bold text-xs text-slate-600 mb-1.5">
                Street / Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Enter street, area, or landmark"
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
                  placeholder="Enter city / town"
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
                  list="vendor-states-list"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200 font-medium text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <datalist id="vendor-states-list">
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
                  placeholder="e.g. Opp Bank, Near Main Road"
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

            {/* Footer Buttons */}
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
