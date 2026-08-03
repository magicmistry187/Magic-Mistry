import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, LocateFixed, Loader2, Check, Search, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const POPULAR_CITIES = [
  { name: 'Bangalore, IN', icon: '🏙️' },
  { name: 'Kolkata, WB', icon: '🏰' },
  { name: 'Mumbai, MH', icon: '🌉' },
  { name: 'Delhi NCR', icon: '🏛️' },
  { name: 'Hyderabad, TS', icon: '🕌' },
  { name: 'Chennai, TN', icon: '🏖️' },
  { name: 'Pune, MH', icon: '🏞️' },
  { name: 'Ahmedabad, GJ', icon: '🪁' },
];

export default function LocationSelectorModal({ isOpen, onClose }) {
  const { location, updateLocation } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState('');

  if (!isOpen) return null;

  const handleSelectCity = (cityName) => {
    updateLocation(cityName);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    updateLocation(customInput.trim());
    onClose();
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setDetectError('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const a = data.address || {};

          const city = a.city || a.town || a.village || a.county || '';
          const state = a.state || '';
          const detectedStr = [city, state].filter(Boolean).join(', ') || data.display_name;

          // ── CONNECTION: pass GPS coords so AuthContext can sync to backend ──
          // updateLocation(str, coords) → AuthContext → createAddressApi → POST /api/address
          updateLocation(detectedStr, { lat: coords.latitude, lng: coords.longitude });
          setIsDetecting(false);
          onClose();
        } catch {
          setDetectError('Could not resolve address. Please type manually.');
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        setDetectError(
          err.code === 1
            ? 'Location access denied. Please allow location permissions.'
            : 'Unable to detect position.'
        );
      },
      { timeout: 10000 }
    );
  };

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Select Your Location</h3>
                <p className="text-[11px] text-slate-400">Services & technicians available in your area</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Auto Detect Location Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 transition-all font-bold text-xs shadow-xs"
            >
              <div className="flex items-center gap-3">
                {isDetecting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <LocateFixed className="w-5 h-5 text-blue-600" />
                )}
                <div className="text-left">
                  <p className="font-extrabold text-sm">{isDetecting ? 'Detecting your GPS location...' : 'Use Current Location'}</p>
                  <p className="text-[11px] text-blue-600/80 font-normal">Using browser GPS for precision service</p>
                </div>
              </div>
              <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                Auto-Detect
              </span>
            </button>

            {detectError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {detectError}
              </p>
            )}

            {/* Custom Input Form */}
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Or Type Full Address / Landmark
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. Flat 402, Indiranagar, Bangalore"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-200 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>

            {/* Popular Cities Grid */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Popular Service Cities
              </p>
              <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredCities.map((city) => {
                  const isSelected = location === city.name;
                  return (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => handleSelectCity(city.name)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{city.icon}</span>
                        <span className="text-xs font-bold">{city.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
