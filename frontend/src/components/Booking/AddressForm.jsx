import React, { useState, useEffect } from "react";
import { useBooking } from "../../components/Booking/BookingContext";
import {
  LocateFixed, Loader2, MapPin, AlertCircle, CheckCircle2,
  MapPinOff, Clock3, Home, Briefcase, Tag, Edit3, BookmarkCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAddressesApi } from "../../services/operations/addressAPI";

const LOC = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };
const MODE = { CHOOSE: "choose", SAVED: "saved", MANUAL: "manual" };

function OutOfAreaModal({ city, state, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-[#0B1E40] to-[#1a3a70] px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <MapPinOff className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold">Outside Our Service Area</h2>
          {(city || state) && (
            <p className="text-blue-200 text-sm mt-1">{city ? `${city}${state ? ", " : ""}` : ""}{state || ""}</p>
          )}
        </div>
        <div className="px-6 py-6 text-center">
          <div className="flex justify-center mb-3">
            <span className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <Clock3 className="w-6 h-6 text-amber-500" />
            </span>
          </div>
          <h3 className="text-slate-800 font-bold text-lg leading-snug">We are Expanding to <br />Your Area Soon!</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Currently, Magic Mistry services are available only in{" "}
            <span className="font-semibold text-[#0B1E40]">West Bengal</span>.
          </p>
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full bg-[#0B1E40] hover:bg-[#1a3a70] text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            Got it, I will Enter a West Bengal Address
          </button>
        </div>
      </div>
    </div>
  );
}

const TYPE_OPTIONS = [
  { label: "Home",   Icon: Home },
  { label: "Office", Icon: Briefcase },
  { label: "Other",  Icon: Tag },
];

export default function AddressForm() {
  const { bookingState, updateBooking } = useBooking();
  const { token, isLoggedIn, updateLocation } = useAuth();

  const [mode, setMode] = useState(MODE.CHOOSE);

  const [savedAddress, setSavedAddress] = useState(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError]     = useState("");

  const [addrType, setAddrType]         = useState("Home");
  const [flat, setFlat]                 = useState("");
  const [street, setStreet]             = useState("");
  const [landmark, setLandmark]         = useState("");
  const [pincode, setPincode]           = useState("");
  const [manualError, setManualError]   = useState("");

  const [locState, setLocState]         = useState(LOC.IDLE);
  const [locError, setLocError]         = useState("");
  const [outOfArea, setOutOfArea]       = useState(null);

  const applyAddress = (fullStr) => updateBooking("address", fullStr);

  const handleUseSavedAddress = async () => {
    setMode(MODE.SAVED);
    if (savedAddress) return;
    setLoadingSaved(true);
    setSavedError("");
    try {
      const res = await getAddressesApi(token);
      if (res.success && res.addresses?.length > 0) {
        const def = res.addresses.find((a) => a.isDefault) || res.addresses[0];
        setSavedAddress(def);
        const parts = [def.house || def.flat, def.street, def.landmark, def.city, def.state, def.pincode].filter(Boolean);
        applyAddress(parts.join(", "));
      } else {
        setSavedError("No saved address found. Please enter one below.");
        setMode(MODE.MANUAL);
      }
    } catch {
      setSavedError("Could not load your saved address. Please enter manually.");
      setMode(MODE.MANUAL);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleEnterDifferent = () => {
    applyAddress("");
    setFlat(""); setStreet(""); setLandmark(""); setPincode(""); setAddrType("Home");
    setManualError(""); setLocState(LOC.IDLE); setLocError("");
    setMode(MODE.MANUAL);
  };

  useEffect(() => {
    if (mode !== MODE.MANUAL) return;
    const full = [flat, street, landmark, pincode].filter(Boolean).join(", ");
    applyAddress(full);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat, street, landmark, pincode, addrType, mode]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocState(LOC.ERROR);
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocState(LOC.LOADING);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address || {};
          const parts = [
            a.house_number, a.road || a.pedestrian || a.footway,
            a.neighbourhood || a.suburb, a.city || a.town || a.village || a.county,
            a.state, a.postcode,
          ].filter(Boolean);
          const fullAddress = parts.length ? parts.join(", ") : data.display_name;
          setFlat(a.house_number || "");
          setStreet([a.road || a.pedestrian || a.footway, a.neighbourhood || a.suburb].filter(Boolean).join(", "));
          setLandmark("");
          setPincode(a.postcode || "");
          updateBooking("address", fullAddress);
          updateBooking("latitude", coords.latitude);
          updateBooking("longitude", coords.longitude);
          updateLocation(fullAddress, { lat: coords.latitude, lng: coords.longitude });
          setLocState(LOC.SUCCESS);
          setLocError("");
        } catch {
          setLocState(LOC.ERROR);
          setLocError("Could not fetch address. Please enter manually.");
        }
      },
      (err) => {
        setLocState(LOC.ERROR);
        setLocError(err.code === 1 ? "Location permission denied. Please allow access and try again." : "Unable to retrieve your location. Please enter manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const savedAddressLine = savedAddress
    ? [savedAddress.house || savedAddress.flat, savedAddress.street, savedAddress.city, savedAddress.state, savedAddress.pincode].filter(Boolean).join(", ")
    : "";

  return (
    <>
      {outOfArea && <OutOfAreaModal city={outOfArea.city} state={outOfArea.state} onClose={() => setOutOfArea(null)} />}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-extrabold text-[#0B1E40] mb-5 flex items-center gap-3">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">4</span>
          Share Address
        </h2>

        {/* ── CHOOSE MODE ── */}
        {mode === MODE.CHOOSE && (
          <div className="space-y-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleUseSavedAddress}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all text-left group"
              >
                <span className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                  <BookmarkCheck className="w-5 h-5 text-white" />
                </span>
                <div>
                  <p className="font-bold text-[#0B1E40] text-sm">Use My Saved Address</p>
                  <p className="text-xs text-gray-500 mt-0.5">Auto-fill from your default saved address</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto shrink-0 opacity-70" />
              </button>
            ) : (
              <div className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-left opacity-60 cursor-not-allowed">
                <span className="w-11 h-11 rounded-xl bg-gray-300 flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-5 h-5 text-white" />
                </span>
                <div>
                  <p className="font-bold text-gray-500 text-sm">Use My Saved Address</p>
                  <p className="text-xs text-gray-400 mt-0.5">Log in to use your saved address</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleEnterDifferent}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
            >
              <span className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-md shadow-orange-200 group-hover:scale-105 transition-transform">
                <Edit3 className="w-5 h-5 text-white" />
              </span>
              <div>
                <p className="font-bold text-[#0B1E40] text-sm">Enter a Different Address</p>
                <p className="text-xs text-gray-500 mt-0.5">Fill in a new address for this booking</p>
              </div>
            </button>
          </div>
        )}

        {/* ── SAVED MODE ── */}
        {mode === MODE.SAVED && (
          <div>
            {loadingSaved ? (
              <div className="flex items-center justify-center gap-2 py-8 text-blue-600 text-sm font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading your saved address...
              </div>
            ) : savedError ? (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {savedError}
              </div>
            ) : savedAddress ? (
              <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {savedAddress.addressType || savedAddress.type || "Saved"}
                      </span>
                      {savedAddress.isDefault && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{savedAddressLine}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleEnterDifferent}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Enter a Different Address Instead
            </button>
          </div>
        )}

        {/* ── MANUAL MODE ── */}
        {mode === MODE.MANUAL && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locState === LOC.LOADING}
              className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                locState === LOC.SUCCESS ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : locState === LOC.ERROR ? "border-red-300 bg-red-50 text-red-600"
                : locState === LOC.LOADING ? "border-blue-300 bg-blue-50 text-blue-600 cursor-wait"
                : "border-dashed border-blue-400 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:border-blue-500 cursor-pointer"
              }`}
            >
              {locState === LOC.LOADING && <Loader2 className="w-4 h-4 animate-spin" />}
              {locState === LOC.SUCCESS && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {locState === LOC.ERROR   && <AlertCircle className="w-4 h-4 text-red-500" />}
              {locState === LOC.IDLE    && <LocateFixed className="w-4 h-4" />}
              <span>
                {locState === LOC.LOADING && "Fetching your location..."}
                {locState === LOC.SUCCESS && "Location detected - you can edit below"}
                {locState === LOC.ERROR   && "Try Again"}
                {locState === LOC.IDLE    && "Use My Current Location"}
              </span>
            </button>

            {locState === LOC.ERROR && locError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{locError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or fill in manually</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address Type</label>
              <div className="flex gap-3">
                {TYPE_OPTIONS.map(({ label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAddrType(label)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      addrType === label
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">House / Flat / Building No. <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. Flat 402, Green Valley Apartments"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Street / Area / Locality <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 10th Main Road, Indiranagar"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Landmark <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Pincode <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="700001"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {bookingState.address && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-800">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                <span><strong>Service Address:</strong> {bookingState.address}</span>
              </div>
            )}

            {manualError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {manualError}
              </p>
            )}

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setMode(MODE.CHOOSE)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-700 font-bold text-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to Address Options
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
