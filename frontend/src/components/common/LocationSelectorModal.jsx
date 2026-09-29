import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  X,
  LocateFixed,
  Loader2,
  Check,
  Search,
  CheckCircle2,
  Edit3,
  Building,
  Navigation,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getCurrentCoordinates,
  reverseGeocode,
  searchLocations,
} from "../../utils/reverseGeocode";
import { cleanPostalParentheses } from "../../utils/addressParser";

const POPULAR_CITIES = [
  { name: "Kolkata, West Bengal", icon: "🏰" },
  { name: "New Delhi, Delhi", icon: "🏛️" },
  { name: "Mumbai, Maharashtra", icon: "🌊" },
  { name: "Bengaluru, Karnataka", icon: "💻" },
  { name: "Pune, Maharashtra", icon: "🏙️" },
  { name: "Hyderabad, Telangana", icon: "💎" },
  { name: "Patna, Bihar", icon: "🌾" },
  { name: "Lucknow, Uttar Pradesh", icon: "🕌" },
  { name: "Asansol, West Bengal", icon: "🏭" },
  { name: "Durgapur, West Bengal", icon: "⚙️" },
  { name: "Siliguri, West Bengal", icon: "🏔️" },
  { name: "Jaipur, Rajasthan", icon: "👑" },
  { name: "Ahmedabad, Gujarat", icon: "🪁" },
  { name: "Bhubaneswar, Odisha", icon: "🛕" },
];

export default function LocationSelectorModal({ isOpen, onClose }) {
  const { location, updateLocation } = useAuth();

  // Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // GPS Detection & Editable Address Fields
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");
  const [detectedCoords, setDetectedCoords] = useState(null);
  const [detectedData, setDetectedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Handle Autocomplete Input Debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(val.trim());
        setSuggestions(results);
      } catch (err) {
        console.warn("[LocationSelectorModal] Autocomplete error:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 320);
  };

  // Select city from popular list
  const handleSelectCity = (cityName) => {
    updateLocation(cityName);
    onClose();
  };

  // Select place from autocomplete suggestion
  const handleSelectSuggestion = (item) => {
    const coords = item.lat && item.lng ? { lat: item.lat, lng: item.lng } : null;
    const finalName = item.display_name || item.display_place || searchQuery;
    updateLocation(finalName, coords);
    setSearchQuery("");
    setSuggestions([]);
    onClose();
  };

  // Detect GPS Location
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setDetectError("");
    setDetectedData(null);
    setDetectedCoords(null);
    setIsEditing(false);

    try {
      const coords = await getCurrentCoordinates({ timeout: 15000 });
      console.log(`[LocationSelectorModal] 📍 Browser GPS: Lat ${coords.latitude}, Lng ${coords.longitude}`);

      const res = await reverseGeocode(coords.latitude, coords.longitude);
      console.log(`[LocationSelectorModal] 🗺️ Reverse Geocoded:`, res);

      const rawFlat = (res.flat || "").trim();
      const safeFlat = rawFlat && !rawFlat.includes(",") && rawFlat.length <= 25 ? rawFlat : "";
      const cleanStreet = (res.street || "").replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
      const cleanCity = cleanPostalParentheses(res.city || "");
      const cleanPincode = (res.pincode || "").replace(/\D/g, "").slice(0, 6);

      setDetectedData({
        flat: safeFlat,
        street: cleanStreet,
        landmark: res.landmark || "",
        city: cleanCity,
        state: res.state || "",
        pincode: cleanPincode,
      });
      setDetectedCoords({ lat: coords.latitude, lng: coords.longitude });
    } catch (err) {
      console.error("[LocationSelectorModal] Error:", err);
      setDetectError(err.message || "Could not resolve your location. Please enter it manually.");
    } finally {
      setIsDetecting(false);
    }
  };

  // Confirm Detected / Edited Location
  const handleConfirmDetected = () => {
    if (!detectedData) return;

    const parts = [
      detectedData.flat,
      detectedData.street,
      detectedData.landmark,
      detectedData.city,
      detectedData.state,
      detectedData.pincode,
    ].filter(Boolean);

    const fullAddress = parts.join(", ") || detectedData.city || "Selected Location";
    updateLocation(fullAddress, detectedCoords);

    setDetectedData(null);
    setDetectedCoords(null);
    setIsEditing(false);
    onClose();
  };

  // Clear detected state
  const handleResetDetected = () => {
    setDetectedData(null);
    setDetectedCoords(null);
    setIsEditing(false);
    setDetectError("");
  };

  // Filter popular cities by user query if no API suggestions
  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Select Your Location</h3>
                  <p className="text-[11px] text-slate-400">Serving all towns, villages, & cities across India</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div data-lenis-prevent className="p-6 space-y-5 overflow-y-auto">

              {/* ── AUTO-DETECT GPS SECTION ── */}
              <div className="space-y-3">
                {!detectedData && (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                      isDetecting
                        ? "border-blue-300 bg-blue-50 text-blue-500 cursor-wait"
                        : "border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 cursor-pointer shadow-sm hover:shadow"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDetecting ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <LocateFixed className="w-5 h-5 text-blue-600" />
                      )}
                      <div className="text-left">
                        <p className="font-extrabold text-sm">
                          {isDetecting ? "Detecting high-precision GPS..." : "Use Current Location"}
                        </p>
                        <p className="text-[11px] text-blue-600/80 font-normal">
                          {isDetecting ? "Fetching village / street name via LocationIQ..." : "Auto-detect village, small town, or street"}
                        </p>
                      </div>
                    </div>
                    {!isDetecting && (
                      <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> GPS
                      </span>
                    )}
                  </button>
                )}

                {/* ── DETECTED LOCATION: EDITABLE PREVIEW CARD ── */}
                {detectedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/80 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold text-emerald-900">📍 Location Detected Successfully</p>
                          <p className="text-[11px] text-emerald-700">Review or fine-tune your street / village name</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="text-xs font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEditing ? "Hide Details" : "Edit Details"}
                      </button>
                    </div>

                    {/* Preview Summary */}
                    {!isEditing && (
                      <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1">
                        <p className="font-bold text-slate-900">
                          {[detectedData.street, detectedData.city].filter(Boolean).join(", ")}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {[detectedData.state, detectedData.pincode].filter(Boolean).join(" - ")}
                        </p>
                      </div>
                    )}

                    {/* Editable Fields (Swiggy / Zomato style) */}
                    {isEditing && (
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Street / Colony / Village / Area</label>
                          <input
                            type="text"
                            value={detectedData.street}
                            onChange={(e) => setDetectedData({ ...detectedData, street: e.target.value })}
                            placeholder="e.g. Sripur Bazar / Main Road / Village Name"
                            className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Town / City / District</label>
                            <input
                              type="text"
                              value={detectedData.city}
                              onChange={(e) => setDetectedData({ ...detectedData, city: e.target.value })}
                              placeholder="City or District"
                              className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">PIN Code</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={detectedData.pincode}
                              onChange={(e) => setDetectedData({ ...detectedData, pincode: e.target.value.replace(/\D/g, '') })}
                              placeholder="6-digit PIN"
                              className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">State</label>
                            <input
                              type="text"
                              value={detectedData.state}
                              onChange={(e) => setDetectedData({ ...detectedData, state: e.target.value })}
                              placeholder="State"
                              className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Flat / House No. (Optional)</label>
                            <input
                              type="text"
                              value={detectedData.flat}
                              onChange={(e) => setDetectedData({ ...detectedData, flat: e.target.value })}
                              placeholder="House or Flat No."
                              className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmDetected}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-sm"
                      >
                        ✓ Confirm & Save Location
                      </button>
                      <button
                        type="button"
                        onClick={handleResetDetected}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {detectError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 leading-relaxed">
                    ⚠️ {detectError}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">or search any place</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* ── PAN-INDIA AUTOCOMPLETE SEARCH INPUT ── */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Search Village, Town, Colony or Street
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="e.g. Sripur, Bihta, Rohini Sector 7, Indiranagar..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  />
                  {isSearching ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-orange-500" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>

                {/* Autocomplete Dropdown List */}
                {suggestions.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {suggestions.map((item) => (
                      <button
                        key={item.place_id || item.display_name}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left p-3 hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 cursor-pointer group"
                      >
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {item.display_place || item.display_name.split(",")[0]}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.display_address || item.display_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── POPULAR CITIES (PAN-INDIA) ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Popular Hubs Across India
                  </p>
                  <span className="text-[10px] text-slate-400">Quick Select</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {filteredCities.map((city) => {
                    const isSelected = location && location.toLowerCase().includes(city.name.split(",")[0].toLowerCase());
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleSelectCity(city.name)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{city.icon}</span>
                          <span className="text-xs font-bold truncate leading-tight">{city.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
