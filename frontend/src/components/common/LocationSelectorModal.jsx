import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Map,
  Compass,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getCurrentCoordinates,
  reverseGeocode,
  searchLocations,
} from "../../utils/reverseGeocode";
import { cleanPostalParentheses } from "../../utils/addressParser";
import InteractiveMapPicker from "./InteractiveMapPicker";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { useModalSmoothScroll } from "./useModalSmoothScroll";

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
  const overlayRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Physics-based smooth scrolling for modal + complete background page lock
  useModalSmoothScroll({
    isOpen,
    overlayRef,
    scrollContainerRef,
  });

  // Active Tab: 'search' | 'map'
  const [activeTab, setActiveTab] = useState("search");

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
        const results = await searchLocations(val.trim(), detectedCoords);
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

  // Detect GPS Location & open Interactive Map to allow visual fine-tuning
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setDetectError("");
    setDetectedData(null);
    setDetectedCoords(null);
    setIsEditing(false);

    try {
      const coords = await getCurrentCoordinates({ desiredAccuracy: 35, timeout: 12000 });
      console.log(`[LocationSelectorModal] 📍 High-accuracy GPS: Lat ${coords.latitude}, Lng ${coords.longitude}, Acc: ${coords.accuracy}m`);

      const res = await reverseGeocode(coords.latitude, coords.longitude);
      console.log(`[LocationSelectorModal] 🗺️ Reverse Geocoded:`, res);

      const rawFlat = (res.flat || "").trim();
      const safeFlat = rawFlat && !rawFlat.includes(",") && rawFlat.length <= 25 ? rawFlat : "";
      const cleanStreet = (res.street || "").replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
      const cleanCity = cleanPostalParentheses(res.city || "");
      const cleanPincode = (res.pincode || "").replace(/\D/g, "").slice(0, 6);

      const resolved = {
        flat: safeFlat,
        street: cleanStreet,
        landmark: res.landmark || "",
        city: cleanCity,
        state: res.state || "",
        pincode: cleanPincode,
        fullAddress: res.fullAddress || "",
      };

      setDetectedData(resolved);
      setDetectedCoords({ lat: coords.latitude, lng: coords.longitude });

      // Automatically switch to Map view so user can visually verify or fine-tune pin
      setActiveTab("map");
    } catch (err) {
      console.error("[LocationSelectorModal] Error:", err);
      setDetectError(err.message || "Could not resolve your location. Please enter it manually or pick on map.");
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle location update from Interactive Map
  const handleMapLocationSelect = ({ coords, address }) => {
    setDetectedCoords(coords);
    if (address) {
      setDetectedData({
        flat: address.flat || "",
        street: address.street || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        fullAddress: address.fullAddress || "",
      });
    }
  };

  // Confirm Detected / Map Location
  const handleConfirmLocation = () => {
    if (!detectedData && !detectedCoords) return;

    const parts = [
      detectedData?.flat,
      detectedData?.street,
      detectedData?.landmark,
      detectedData?.city,
      detectedData?.state,
      detectedData?.pincode,
    ].filter(Boolean);

    const fullAddress =
      parts.join(", ") ||
      detectedData?.fullAddress ||
      detectedData?.city ||
      "Selected Location";

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
        <div
          ref={overlayRef}
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-auto max-h-[92vh]"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Select Your Location</h3>
                  <p className="text-[11px] text-slate-400">High-precision street & village locator across India</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "search"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-orange-500" />
                Quick Search & Cities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("map")}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "map"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Map className="w-3.5 h-3.5 text-orange-500" />
                Pinpoint on Map
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              data-lenis-prevent
              className="flex-1 min-h-0 p-5 space-y-4 overflow-y-auto overscroll-contain custom-scrollbar"
            >

              {/* ── TAB 1: INTERACTIVE MAP VIEW ── */}
              {activeTab === "map" && (
                <div className="space-y-3">
                  <InteractiveMapPicker
                    initialCoords={detectedCoords}
                    onLocationSelect={handleMapLocationSelect}
                    height="280px"
                    showSearch={true}
                  />

                  {/* Confirm or Edit Details Button */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmLocation}
                      disabled={!detectedData && !detectedCoords}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Confirm & Set This Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing((prev) => !prev)}
                      className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Fine-tune street/house details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isEditing ? "Hide Details" : "Edit Text"}
                    </button>
                  </div>

                  {/* Optional Manual Field Fine-Tuning */}
                  {isEditing && detectedData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs mt-2"
                    >
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Street / Colony / Village / Area</label>
                        <input
                          type="text"
                          value={detectedData.street || ""}
                          onChange={(e) => setDetectedData({ ...detectedData, street: e.target.value })}
                          placeholder="Enter street, area, or village name"
                          className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Town / City / District</label>
                          <input
                            type="text"
                            value={detectedData.city || ""}
                            onChange={(e) => setDetectedData({ ...detectedData, city: e.target.value })}
                            placeholder="City or District"
                            className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">PIN Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={detectedData.pincode || ""}
                            onChange={(e) => setDetectedData({ ...detectedData, pincode: e.target.value.replace(/\D/g, "") })}
                            placeholder="6-digit PIN"
                            className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── TAB 2: SEARCH & POPULAR CITIES ── */}
              {activeTab === "search" && (
                <div className="space-y-4">
                  {/* Auto-detect GPS button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetecting}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 font-bold text-xs transition-all text-left ${
                        isDetecting
                          ? "border-blue-300 bg-blue-50 text-blue-500 cursor-wait"
                          : "border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100 text-blue-800 cursor-pointer shadow-sm"
                      }`}
                    >
                      {isDetecting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                      ) : (
                        <LocateFixed className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs leading-tight">
                          {isDetecting ? "Detecting Satellite GPS..." : "Use Current GPS"}
                        </p>
                        <p className="text-[10px] text-blue-600/80 font-normal truncate">
                          High-precision auto-detect
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("map")}
                      className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/60 hover:bg-orange-100 text-orange-900 cursor-pointer shadow-sm text-left transition-all"
                    >
                      <Map className="w-4 h-4 text-orange-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs leading-tight">Pinpoint on Map</p>
                        <p className="text-[10px] text-orange-700/80 font-normal truncate">
                          Drag pin to exact door
                        </p>
                      </div>
                    </button>
                  </div>

                  {detectError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      ⚠️ {detectError}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or search place</span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>

                  {/* Search Input */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search village, town, colony, street or landmark..."
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
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden divide-y divide-slate-100 max-h-52 overflow-y-auto">
                        {suggestions.map((item) => (
                          <button
                            key={item.place_id || item.display_name}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            className="w-full text-left p-2.5 hover:bg-orange-50/70 transition-colors flex items-start gap-2.5 cursor-pointer group"
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

                  {/* Popular Cities */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Popular Hubs Across India
                      </p>
                      <span className="text-[10px] text-slate-400">Quick Select</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {filteredCities.map((city) => {
                        const isSelected =
                          location &&
                          location.toLowerCase().includes(city.name.split(",")[0].toLowerCase());
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
                              <span className="text-xs font-bold truncate leading-tight">
                                {city.name}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
