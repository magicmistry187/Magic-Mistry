import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, LocateFixed, Loader2, Check, Search, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const POPULAR_CITIES = [
  { name: "Kolkata, West Bengal", icon: "🏰" },
  { name: "Asansol, West Bengal", icon: "🏙️" },
  { name: "Durgapur, West Bengal", icon: "🏭" },
  { name: "Siliguri, West Bengal", icon: "🏔️" },
  { name: "Howrah, West Bengal", icon: "🌉" },
  { name: "Bardhaman, West Bengal", icon: "🏛️" },
  { name: "Kharagpur, West Bengal", icon: "🎓" },
  { name: "Haldia, West Bengal", icon: "⚓" },
];

export default function LocationSelectorModal({ isOpen, onClose }) {
  const { location, updateLocation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");
  const [detectedAddress, setDetectedAddress] = useState("");
  const [detectedCoords, setDetectedCoords] = useState(null);

  const handleSelectCity = (cityName) => {
    updateLocation(cityName);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    updateLocation(customInput.trim());
    setCustomInput("");
    onClose();
  };

  const handleConfirmDetected = () => {
    if (detectedAddress && detectedCoords) {
      updateLocation(detectedAddress, detectedCoords);
      setDetectedAddress("");
      setDetectedCoords(null);
      onClose();
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetecting(true);
    setDetectError("");
    setDetectedAddress("");
    setDetectedCoords(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          console.log(
            `[Magic Mistry] 📍 Browser GPS coords: Lat ${coords.latitude}, Lng ${coords.longitude}`
          );
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address || {};
          const parts = [
            a.house_number,
            a.road || a.pedestrian || a.footway,
            a.neighbourhood || a.suburb,
            a.city || a.town || a.village || a.county,
            a.state,
            a.postcode,
          ].filter(Boolean);

          const fullAddress = parts.length ? parts.join(", ") : data.display_name;
          console.log(`[Magic Mistry] 🗺️ Detected address: ${fullAddress}`);
          setDetectedAddress(fullAddress);
          setDetectedCoords({ lat: coords.latitude, lng: coords.longitude });
          setIsDetecting(false);
        } catch {
          setDetectError("Could not resolve your address. Please enter it manually.");
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === 1) {
          setDetectError("Location permission denied. Please allow location access in your browser settings and try again.");
        } else if (err.code === 3) {
          setDetectError("Location request timed out. Please try again or enter your address manually.");
        } else {
          setDetectError("Unable to detect your position. Please enter your address manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

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

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Auto Detect Section */}
              <div className="space-y-3">

                {/* Detect Button - hidden after detection */}
                {!detectedAddress && (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                      isDetecting
                        ? "border-blue-300 bg-blue-50 text-blue-500 cursor-wait"
                        : "border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 cursor-pointer"
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
                          {isDetecting ? "Detecting your GPS location..." : "Use Current Location"}
                        </p>
                        <p className="text-[11px] text-blue-600/80 font-normal">
                          {isDetecting ? "Please wait, this may take a moment" : "Using browser GPS for precision service"}
                        </p>
                      </div>
                    </div>
                    {!isDetecting && (
                      <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                        Auto-Detect
                      </span>
                    )}
                  </button>
                )}

                {/* Detected Address Preview - user confirms before saving */}
                {detectedAddress && (
                  <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-emerald-800 mb-1">📍 Location Detected!</p>
                        <p className="text-xs text-emerald-700 leading-relaxed font-semibold">
                          {detectedAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmDetected}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition-colors"
                      >
                        ✓ Confirm This Location
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDetectedAddress("");
                          setDetectedCoords(null);
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
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
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">or type manually</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Custom Input Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Type Your Address / Locality
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="e.g. Sripur, Asansol, West Bengal"
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

              {/* Popular West Bengal Cities */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Popular Cities
                  </p>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city..."
                    className="text-[11px] px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 w-28"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                  {filteredCities.map((city) => {
                    const isSelected = location === city.name;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleSelectCity(city.name)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{city.icon}</span>
                          <span className="text-xs font-bold leading-tight">{city.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />}
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
