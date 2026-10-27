import React, { useState, useEffect } from "react";
import { useBooking } from "./BookingContext";
import {
  MapPin,
  LocateFixed,
  Loader2,
  CheckCircle2,
  Home,
  Briefcase,
  Tag,
  BookmarkCheck,
  Map,
  ChevronRight,
  AlertCircle,
  Check,
  Edit3
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAddressesApi } from "../../services/operations/addressAPI";
import { getCurrentCoordinates, reverseGeocode } from "../../utils/reverseGeocode";
import { cleanPostalParentheses } from "../../utils/addressParser";
import InteractiveMapPicker from "../common/InteractiveMapPicker";

const ADDR_TABS = {
  SAVED: "saved",
  GPS: "gps",
  MANUAL: "manual",
};

export default function AddressForm() {
  const { bookingState, updateBooking, nextStep, prevStep, isStep3Valid } = useBooking();
  const { token, isLoggedIn, updateLocation } = useAuth();

  const [activeTab, setActiveTab] = useState(isLoggedIn ? ADDR_TABS.SAVED : ADDR_TABS.MANUAL);

  // Saved addresses
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState("");

  // Manual fields
  const [flat, setFlat]         = useState("");
  const [street, setStreet]     = useState("");
  const [city, setCity]         = useState("");
  const [state, setState]       = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode]   = useState("");
  const [addrType, setAddrType] = useState("Home");

  // GPS state
  const [isLocating, setIsLocating] = useState(false);
  const [locSuccess, setLocSuccess] = useState(false);
  const [locError, setLocError]     = useState("");
  const [locAccuracyInfo, setLocAccuracyInfo] = useState(null);

  // Interactive map modal
  const [showMapModal, setShowMapModal] = useState(false);

  // Fetch saved addresses on mount if logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      loadSavedAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, token]);

  const loadSavedAddresses = async () => {
    setLoadingSaved(true);
    setSavedError("");
    try {
      const res = await getAddressesApi(token);
      if (res.success && res.addresses?.length > 0) {
        setSavedAddressesList(res.addresses);
        const def = res.addresses.find((a) => a.isDefault) || res.addresses[0];
        setSelectedSavedId(def._id || def.id || 0);
        applySavedAddressToBooking(def);
        setActiveTab(ADDR_TABS.SAVED);
      } else {
        setSavedAddressesList([]);
        setActiveTab(ADDR_TABS.MANUAL);
      }
    } catch {
      setSavedError("Could not load your saved addresses.");
      setActiveTab(ADDR_TABS.MANUAL);
    } finally {
      setLoadingSaved(false);
    }
  };

  const applySavedAddressToBooking = (addr) => {
    const parts = [
      addr.house || addr.flat || addr.addressLine1,
      addr.street,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pincode,
    ].filter(Boolean);
    const fullStr = parts.join(", ");
    updateBooking("address", fullStr);

    if (addr.location?.coordinates?.length === 2) {
      updateBooking("longitude", addr.location.coordinates[0]);
      updateBooking("latitude", addr.location.coordinates[1]);
    } else if (addr.longitude && addr.latitude) {
      updateBooking("longitude", Number(addr.longitude));
      updateBooking("latitude", Number(addr.latitude));
    }
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedSavedId(addr._id || addr.id);
    applySavedAddressToBooking(addr);
  };

  // Sync manual fields to booking state when in MANUAL or GPS mode
  useEffect(() => {
    if (activeTab === ADDR_TABS.SAVED) return;

    const full = [flat, street, landmark, city, state, pincode].filter(Boolean).join(", ");
    if (full.trim()) {
      updateBooking("address", full);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat, street, landmark, city, state, pincode, activeTab]);

  // GPS Auto-Detect with Strict Accuracy Ceiling
  const handleDetectGPS = async () => {
    setIsLocating(true);
    setLocError("");
    setLocSuccess(false);
    setLocAccuracyInfo(null);

    try {
      const coords = await getCurrentCoordinates({ desiredAccuracy: 45, timeout: 8000 });
      const address = await reverseGeocode(coords.latitude, coords.longitude);

      const rawFlat = (address.flat || "").trim();
      const safeFlat = rawFlat && !rawFlat.includes(",") && rawFlat.length <= 25 ? rawFlat : "";
      const cleanStreet = (address.street || "").replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
      const cleanCity = cleanPostalParentheses(address.city || address.district || "");
      const cleanState = address.state || "";
      const cleanPincode = (address.pincode || "").replace(/\D/g, "").slice(0, 6);

      setFlat(safeFlat);
      setStreet(cleanStreet);
      setCity(cleanCity);
      setState(cleanState);
      setLandmark(address.landmark || "");
      setPincode(cleanPincode);

      const fullAddress =
        address.fullAddress ||
        [safeFlat, cleanStreet, address.landmark, cleanCity, cleanState, cleanPincode]
          .filter(Boolean)
          .join(", ");

      updateBooking("address", fullAddress);
      updateBooking("latitude", coords.latitude);
      updateBooking("longitude", coords.longitude);
      if (updateLocation) {
        updateLocation(fullAddress, { lat: coords.latitude, lng: coords.longitude });
      }

      setLocAccuracyInfo({
        isCoarse: coords.isCoarse,
        meters: coords.accuracy,
      });

      setLocSuccess(true);

      // If accuracy was coarse (>180m, e.g. desktop ISP/Cell tower), don't just switch to manual blindly.
      // Automatically open the map picker so the user can pin their exact building in 1 tap!
      if (coords.isCoarse) {
        setShowMapModal(true);
      } else {
        setActiveTab(ADDR_TABS.MANUAL);
      }
    } catch (err) {
      console.error("[AddressForm] Geolocation error:", err);
      setLocError(err.message || "Could not detect GPS location. Please type manually or pick on map.");
    } finally {
      setIsLocating(false);
    }
  };

  // Handle map selection
  const handleMapPinSelected = ({ coords, address }) => {
    if (!coords) return;
    updateBooking("latitude", coords.lat);
    updateBooking("longitude", coords.lng);

    if (address) {
      const safeFlat = (address.flat || "").trim();
      const cleanStreet = (address.street || "").replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
      const cleanCity = cleanPostalParentheses(address.city || address.district || "");
      const cleanState = address.state || "";
      const cleanPincode = (address.pincode || "").replace(/\D/g, "").slice(0, 6);

      setFlat(safeFlat);
      setStreet(cleanStreet);
      setCity(cleanCity);
      setState(cleanState);
      setLandmark(address.landmark || "");
      setPincode(cleanPincode);

      const fullAddress =
        address.fullAddress ||
        [safeFlat, cleanStreet, address.landmark, cleanCity, cleanState, cleanPincode]
          .filter(Boolean)
          .join(", ");

      updateBooking("address", fullAddress);
    }
    setShowMapModal(false);
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-indigo-50/20">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Step 3 of 4
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1E40] tracking-tight">
          Service Location &amp; Address
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Where should our certified technician arrive to service your appliance?
        </p>

        {/* Mode Selector Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {isLoggedIn && savedAddressesList.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab(ADDR_TABS.SAVED)}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === ADDR_TABS.SAVED
                  ? "bg-[#0B1E40] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              Saved Addresses ({savedAddressesList.length})
            </button>
          )}

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              isLocating
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-indigo-600" />
            )}
            {isLocating ? "Detecting GPS..." : "Auto-Detect Current GPS"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(ADDR_TABS.MANUAL)}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === ADDR_TABS.MANUAL
                ? "bg-[#0B1E40] text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Enter Manually
          </button>

          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer shrink-0 sm:ml-auto"
          >
            <Map className="w-3.5 h-3.5 text-indigo-600" />
            Pinpoint on Map
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 md:p-8 space-y-6">
        {/* GPS Success or Error alerts */}
        {locSuccess && (
          <div
            className={`p-3.5 border rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
              locAccuracyInfo?.isCoarse
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {locAccuracyInfo?.isCoarse ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>
              {locAccuracyInfo?.isCoarse
                ? `Approximate area detected (±${
                    locAccuracyInfo.meters >= 1000
                      ? (locAccuracyInfo.meters / 1000).toFixed(1) + " km"
                      : locAccuracyInfo.meters + " m"
                  }). Please confirm or drag your pin on the map to your exact building.`
                : `High-accuracy GPS acquired (±${locAccuracyInfo?.meters || 35}m). You can verify or edit details below.`}
            </span>
          </div>
        )}

        {locError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{locError}</span>
          </div>
        )}

        {/* Tab 1: Saved Addresses List */}
        {activeTab === ADDR_TABS.SAVED && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select from your saved addresses
            </div>

            {loadingSaved ? (
              <div className="py-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> Loading saved addresses...
              </div>
            ) : savedAddressesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                {savedAddressesList.map((addr) => {
                  const id = addr._id || addr.id;
                  const isSelected = selectedSavedId === id;
                  const line1 = addr.house || addr.flat || addr.addressLine1;
                  const full = [line1, addr.street, addr.city, addr.pincode].filter(Boolean).join(", ");

                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                        isSelected
                          ? "bg-gradient-to-r from-indigo-50/90 to-blue-50/40 border-indigo-600 shadow-sm ring-2 ring-indigo-500/10"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <Home className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-extrabold text-[#0B1E40]">
                            {addr.addressType || "Home"}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed break-words">
                        {full}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-semibold">No saved addresses found.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab(ADDR_TABS.MANUAL)}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Enter address manually
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2/3: Manual Input Grid */}
        {(activeTab === ADDR_TABS.MANUAL || activeTab === ADDR_TABS.GPS) && (
          <div className="space-y-5">
            {/* Address Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Type:
              </span>
              {[
                { label: "Home", Icon: Home },
                { label: "Office", Icon: Briefcase },
                { label: "Other", Icon: Tag },
              ].map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setAddrType(label)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    addrType === label
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Flat / House / Floor / Building <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  placeholder="e.g. Flat 3B, Tower 2, Green Heights"
                  className="w-full h-11 px-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Street / Area / Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Sector V, Salt Lake City"
                  className="w-full h-11 px-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near RDB Cinema or Metro Gate 2"
                  className="w-full h-11 px-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  6-Digit Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 700091"
                  className="w-full h-11 px-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kolkata, Bidhannagar, New Delhi"
                  className="w-full h-11 px-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. West Bengal, Delhi, Bihar"
                  className="w-full h-11 px-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Address Preview Box */}
            {bookingState.address && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 leading-relaxed font-medium break-words flex-1 min-w-0">
                  <span className="font-bold text-[#0B1E40]">Destination: </span>
                  {bookingState.address}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            className="h-11 px-5 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            ← Back to Schedule
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={!isStep3Valid}
            className={`h-11 px-7 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
              isStep3Valid
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            Continue to Payment &amp; Review <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Map Picker Modal */}
      {showMapModal && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overscroll-contain"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B1E40] to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Pinpoint Your Exact Location</h3>
                  <p className="text-[11px] text-blue-200 font-medium">Drag the pin or click on your building/gate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <InteractiveMapPicker
                initialCoords={
                  bookingState.latitude && bookingState.longitude
                    ? { lat: bookingState.latitude, lng: bookingState.longitude }
                    : null
                }
                initialAddress={
                  street || city || pincode
                    ? { flat, street, city, state, landmark, pincode }
                    : null
                }
                onLocationSelect={handleMapPinSelected}
                height="360px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
