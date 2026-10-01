import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  LocateFixed,
  Loader2,
  Search,
  X,
  Navigation,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  getCurrentCoordinates,
  reverseGeocode,
  searchLocations,
} from "../../utils/reverseGeocode";

// Modern SVG Pin Icon for Leaflet
const createPinIcon = () =>
  L.divIcon({
    className: "mm-interactive-pin",
    html: `
      <div style="position: relative; width: 38px; height: 46px; transform: translate(-19px, -46px); pointer-events: none;">
        <div style="
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #ff6b00, #ea580c);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(234, 88, 12, 0.45);
          border: 3px solid #ffffff;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          width: 14px;
          height: 6px;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 50%;
          margin: 2px auto 0 auto;
          filter: blur(1.5px);
        "></div>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 46],
  });

/**
 * InteractiveMapPicker
 *
 * Provides a high-precision, interactive OpenStreetMap map with a draggable pin,
 * click-to-place functionality, real-time reverse geocoding, search autocomplete,
 * and high-accuracy GPS detection with accuracy warnings (preventing 3 km errors).
 *
 * @param {object} props
 * @param {{ lat: number, lng: number }} [props.initialCoords] Starting coordinates
 * @param {function} [props.onLocationSelect] Callback when user adjusts pin or confirms
 * @param {string} [props.height] CSS height of the map (default: "300px")
 * @param {boolean} [props.showSearch] Show embedded search bar (default: true)
 * @param {boolean} [props.compact] Compact view for small modal spaces (default: false)
 */
export default function InteractiveMapPicker({
  initialCoords = null,
  onLocationSelect,
  height = "300px",
  showSearch = true,
  compact = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Fallback coords: Kolkata center if none supplied
  const defaultLat = initialCoords?.lat && !isNaN(initialCoords.lat) ? Number(initialCoords.lat) : 22.5726;
  const defaultLng = initialCoords?.lng && !isNaN(initialCoords.lng) ? Number(initialCoords.lng) : 88.3639;

  const [coords, setCoords] = useState({ lat: defaultLat, lng: defaultLng });
  const [addressData, setAddressData] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [accuracyInfo, setAccuracyInfo] = useState(null);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);

  // Perform reverse geocode for a coordinate pair
  const handleReverseGeocode = useCallback(
    async (lat, lng, accuracy = null) => {
      setIsResolving(true);
      try {
        const result = await reverseGeocode(lat, lng);
        setAddressData(result);
        if (onLocationSelect) {
          onLocationSelect({
            coords: { lat, lng },
            address: result,
            accuracy,
          });
        }
      } catch (err) {
        console.warn("[InteractiveMapPicker] Reverse geocode error:", err);
      } finally {
        setIsResolving(false);
      }
    },
    [onLocationSelect]
  );

  // Debounced reverse geocode on pin move
  const scheduleReverseGeocode = useCallback(
    (lat, lng, accuracy = null) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        handleReverseGeocode(lat, lng, accuracy);
      }, 350);
    },
    [handleReverseGeocode]
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: initialCoords ? 17 : 14,
      zoomControl: false,
      scrollWheelZoom: false, // Let wheel events bubble up so parent modal scrolls
      touchZoom: false,       // Prevent pinch-zoom from stealing touch scroll
      dragging: true,         // Allows mouse dragging on desktop
      tap: true,              // Allows tap-to-place-pin
    });

    // High quality OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Zoom buttons in top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Draggable pin marker
    const marker = L.marker([defaultLat, defaultLng], {
      icon: createPinIcon(),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    // Marker drag event
    marker.on("dragend", (e) => {
      const newPos = e.target.getLatLng();
      setCoords({ lat: newPos.lat, lng: newPos.lng });
      scheduleReverseGeocode(newPos.lat, newPos.lng);
    });

    // Map click to move pin
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      scheduleReverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Run initial reverse geocode if initialCoords given
    if (initialCoords?.lat && initialCoords?.lng) {
      handleReverseGeocode(defaultLat, defaultLng);
    }

    // Leaflet needs invalidateSize after container renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run once on mount

  // Sync coords from props if externally updated
  useEffect(() => {
    if (
      initialCoords?.lat &&
      initialCoords?.lng &&
      mapInstanceRef.current &&
      markerRef.current
    ) {
      const lat = Number(initialCoords.lat);
      const lng = Number(initialCoords.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 17);
        setCoords({ lat, lng });
      }
    }
  }, [initialCoords?.lat, initialCoords?.lng]);

  // "Use My GPS" handler with high-accuracy watcher
  const handleLocateMe = async () => {
    setIsLocating(true);
    setAccuracyInfo(null);
    try {
      const pos = await getCurrentCoordinates({
        desiredAccuracy: 35,
        timeout: 12000,
      });

      const lat = pos.latitude;
      const lng = pos.longitude;
      const acc = Math.round(pos.accuracy || 0);

      setCoords({ lat, lng });
      setAccuracyInfo({
        meters: acc,
        isHighAccuracy: pos.isHighAccuracy,
      });

      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.flyTo([lat, lng], 18, { duration: 1.2 });
      }

      handleReverseGeocode(lat, lng, acc);
    } catch (err) {
      console.warn("[InteractiveMapPicker] Locate error:", err.message);
      alert(err.message || "Could not retrieve your device location. Please move the pin manually on the map.");
    } finally {
      setIsLocating(false);
    }
  };

  // Search input change handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(val.trim(), coords);
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 320);
  };

  // Select place from search suggestions
  const handleSelectSuggestion = async (item) => {
    let lat = item.lat && !isNaN(Number(item.lat)) ? Number(item.lat) : null;
    let lng = item.lng && !isNaN(Number(item.lng)) ? Number(item.lng) : null;

    // If coordinates not directly in suggestion, look up postal code centroid
    if ((!lat || !lng) && (item.pincode || item.address?.pincode)) {
      const pin = item.pincode || item.address?.pincode;
      try {
        const locationIqKey = import.meta?.env?.VITE_LOCATIONIQ_API_KEY || 'pk.43b9346c8e8046d3fdc74a70f9d0c1b1';
        const pRes = await fetch(
          `https://us1.locationiq.com/v1/search?key=${locationIqKey}&postalcode=${pin}&countrycodes=in&format=json&limit=1`
        );
        if (pRes.ok) {
          const pData = await pRes.json();
          if (Array.isArray(pData) && pData[0]) {
            lat = Number(pData[0].lat);
            lng = Number(pData[0].lon);
          }
        }
      } catch (_) {}
    }

    setSearchQuery("");
    setSuggestions([]);
    setAccuracyInfo(null);

    if (lat && lng) {
      setCoords({ lat, lng });
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.flyTo([lat, lng], 18, { duration: 1.2 });
      }
      handleReverseGeocode(lat, lng);
    } else if (onLocationSelect && item.address) {
      setAddressData(item.address);
      onLocationSelect({
        coords,
        address: item.address,
        accuracy: null,
      });
    }
  };

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* ── Search Bar on top of map ── */}
      {showSearch && (
        <div className="relative p-2.5 bg-slate-900 border-b border-slate-800 z-20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search your street, society, landmark, or village..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-700 font-medium"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-orange-400" />
            ) : searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-2.5 right-2.5 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-52 overflow-y-auto z-30 text-slate-800">
              {suggestions.map((item) => (
                <button
                  key={item.place_id || item.display_name}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left p-2.5 hover:bg-orange-50/80 transition-colors flex items-start gap-2 cursor-pointer group"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
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
      )}

      {/* ── Coarse Accuracy Warning Banner (if GPS is 3 km network IP) ── */}
      {accuracyInfo && !accuracyInfo.isHighAccuracy && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center gap-2 text-[11px] text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 leading-tight">
            <span className="font-bold">Approximate Network Location (~{(accuracyInfo.meters / 1000).toFixed(1)} km).</span>{" "}
            Please drag the pin or click on the map to place it at your exact building/street.
          </div>
        </div>
      )}

      {/* ── High Accuracy Notice ── */}
      {accuracyInfo && accuracyInfo.isHighAccuracy && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          High-precision GPS acquired (±{accuracyInfo.meters}m accurate)
        </div>
      )}

      {/* ── Leaflet Map View Container ── */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-10" style={{ touchAction: "pan-y" }} />

        {/* Floating Instruction Pill */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
            Drag pin or tap map to place exact location
          </span>
        </div>

        {/* Floating "Locate Me" Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Detect Current GPS Location"
          className="absolute bottom-3 right-3 z-20 bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-1.5 font-bold text-xs cursor-pointer transition-transform active:scale-95"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
          ) : (
            <LocateFixed className="w-4 h-4 text-orange-600" />
          )}
          <span className="text-[11px] hidden sm:inline">
            {isLocating ? "Acquiring GPS..." : "My GPS"}
          </span>
        </button>
      </div>

      {/* ── Bottom Resolved Street Address Card ── */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            {isResolving ? (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                <span>Pin moved, identifying street & landmark...</span>
              </div>
            ) : addressData ? (
              <div>
                <p className="font-extrabold text-slate-900 truncate">
                  {addressData.street || addressData.landmark || "Pin Location"}
                </p>
                <p className="text-[11px] text-slate-600 truncate">
                  {[addressData.city, addressData.state, addressData.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 text-[11px]">
                Move pin to your exact building or street to preview address
              </p>
            )}
          </div>
        </div>

        {coords && (
          <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:inline">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
}
