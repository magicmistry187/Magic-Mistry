import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Camera, Upload, Check, AlertCircle,
  X, ExternalLink, IndianRupee, ShieldCheck, Image as ImageIcon
} from 'lucide-react';

// Default mock map route screenshot for instant testing without manual file selection
const SAMPLE_MAP_ROUTE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23e8f0fe"/>
      <stop offset="100%" stop-color="%23d2e3fc"/>
    </linearGradient>
  </defs>
  <rect width="600" height="340" fill="url(%23bg)"/>
  <!-- Roads -->
  <path d="M 50 300 C 150 250, 200 150, 320 180 S 480 80, 540 60" fill="none" stroke="%23ffffff" stroke-width="18" stroke-linecap="round"/>
  <path d="M 50 300 C 150 250, 200 150, 320 180 S 480 80, 540 60" fill="none" stroke="%234285f4" stroke-width="8" stroke-linecap="round"/>
  <!-- Secondary Roads -->
  <path d="M 200 340 L 220 50" fill="none" stroke="%23ffffff" stroke-width="8"/>
  <path d="M 400 340 L 410 20" fill="none" stroke="%23ffffff" stroke-width="8"/>
  <path d="M 0 160 L 600 140" fill="none" stroke="%23ffffff" stroke-width="8"/>
  <!-- Vendor Pin (Origin) -->
  <circle cx="50" cy="300" r="14" fill="%230b1e40"/>
  <circle cx="50" cy="300" r="6" fill="%23ffffff"/>
  <text x="75" y="305" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230b1e40">Vendor Location</text>
  <!-- Destination Pin -->
  <circle cx="540" cy="60" r="16" fill="%23ea4335"/>
  <circle cx="540" cy="60" r="7" fill="%23ffffff"/>
  <text x="380" y="55" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23ea4335">Customer Location</text>
  <!-- Route Badge Overlay -->
  <rect x="200" y="110" width="200" height="50" rx="12" fill="%23ffffff" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.15))"/>
  <text x="300" y="132" font-family="sans-serif" font-size="15" font-weight="bold" fill="%231a73e8" text-anchor="middle">Fastest Route (Verified)</text>
  <text x="300" y="150" font-family="sans-serif" font-size="12" fill="%235f6368" text-anchor="middle">Live GPS Navigation Screenshot</text>
</svg>`;

export default function VendorStartServiceModal({
  isOpen,
  onClose,
  job,
  vendorProfile,
  onConfirmStartService
}) {
  const [distanceKm, setDistanceKm] = useState(4.5);
  const [ratePerKm, setRatePerKm] = useState(10);
  const [mapScreenshot, setMapScreenshot] = useState(null);
  const [mapFileName, setMapFileName] = useState('');
  const [addToInvoice, setAddToInvoice] = useState(true);
  const [validationError, setValidationError] = useState('');

  // Extract or parse estimated distance from job if available
  useEffect(() => {
    if (job) {
      if (job.travelDistanceKm) {
        setDistanceKm(Number(job.travelDistanceKm));
      } else if (job.distance) {
        // e.g. "4.2 km away" or "3.8 km"
        const matched = String(job.distance).match(/([0-9.]+)\s*km/i);
        if (matched && matched[1]) {
          const num = parseFloat(matched[1]);
          if (!isNaN(num) && num > 0) {
            setDistanceKm(num);
          }
        }
      }
      if (job.travelRatePerKm) {
        setRatePerKm(Number(job.travelRatePerKm));
      }
      if (job.mapScreenshot) {
        setMapScreenshot(job.mapScreenshot);
        setMapFileName('Attached Route Map');
      } else {
        setMapScreenshot(null);
        setMapFileName('');
      }
      setValidationError('');
    }
  }, [job, isOpen]);

  if (!isOpen || !job) return null;

  const vendorOrigin = vendorProfile?.address || 'Vendor Workshop / Current Location';
  const customerDestination = job.serviceAddress || job.location || 'Customer Address';
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    vendorOrigin
  )}&destination=${encodeURIComponent(customerDestination)}`;

  const calculatedTravelCharge = Math.max(0, (Number(distanceKm) || 0) * (Number(ratePerKm) || 0));

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationError('Please upload a valid image file (PNG, JPG, or WEBP).');
        return;
      }
      setMapFileName(file.name);
      setValidationError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        setMapScreenshot(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleScreenshot = () => {
    setMapScreenshot(SAMPLE_MAP_ROUTE_SVG);
    setMapFileName(`route_map_${job.id}.png`);
    setValidationError('');
  };

  const handleRemoveScreenshot = () => {
    setMapScreenshot(null);
    setMapFileName('');
  };

  const handleSubmit = () => {
    const numKm = parseFloat(distanceKm);
    if (isNaN(numKm) || numKm <= 0) {
      setValidationError('Please enter a valid distance traveled (in KM).');
      return;
    }
    if (!mapScreenshot) {
      setValidationError('Please upload or attach a screenshot of the navigation route before starting service.');
      return;
    }

    onConfirmStartService({
      jobId: job.id,
      travelDistanceKm: numKm,
      travelRatePerKm: Number(ratePerKm) || 10,
      travelCharges: calculatedTravelCharge,
      mapScreenshot: mapScreenshot,
      addToInvoice: addToInvoice
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#061e38] via-[#0a2f57] to-[#061e38] text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Step 1: Travel &amp; Route Verification
                </span>
                <span className="text-xs text-slate-300 font-bold">#{job.displayId || job.id}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Start Service &amp; Route Log
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Upload a map screenshot from your location to customer to calculate KM &amp; add to invoice.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Route Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                      A
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">
                        Vendor Origin
                      </span>
                      <p className="font-bold text-slate-800 line-clamp-1">{vendorOrigin}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-orange-100 border border-orange-300 text-orange-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                      B
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">
                        Customer Destination
                      </span>
                      <p className="font-bold text-slate-800 line-clamp-1">
                        {customerDestination} ({job.customerName})
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  title="Open live navigation in Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Open Maps</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </a>
              </div>
            </div>

            {/* Map Screenshot Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-orange-600" />
                  Map Screenshot (Vendor Location ➔ User Location)
                </label>
                {!mapScreenshot && (
                  <button
                    type="button"
                    onClick={handleUseSampleScreenshot}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                  >
                    + Use Sample Route Screenshot
                  </button>
                )}
              </div>

              {!mapScreenshot ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/30 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-800">
                    Click to upload navigation map screenshot
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PNG, JPG, or WEBP from Google Maps / navigation app
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 group">
                  <img
                    src={mapScreenshot}
                    alt="Map Route Screenshot"
                    className="w-full h-44 object-cover object-center group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold truncate max-w-[240px]">
                        {mapFileName || 'Route Screenshot Attached'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-bold transition-colors">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                        title="Remove Screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Travel KM & Charges Calculation */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100/80 pb-2.5">
                <h3 className="text-xs font-extrabold uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-700" />
                  Travel Distance &amp; Allowance Calculation
                </h3>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Standard Rate: ₹{ratePerKm}/KM
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Distance to Customer (in KM) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      placeholder="e.g. 5.4"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                      KM
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Travel Rate per KM (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={ratePerKm}
                      onChange={(e) => setRatePerKm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 pl-8"
                    />
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Calculation Callout */}
              <div className="flex items-center justify-between bg-white border border-blue-200/90 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Calculated Travel Charge:</span>
                  <span className="text-[11px] text-slate-400">
                    {distanceKm || 0} KM × ₹{ratePerKm || 0}/KM
                  </span>
                </div>
                <span className="text-base font-black text-[#061e38]">
                  ₹{calculatedTravelCharge.toFixed(2)}
                </span>
              </div>

              {/* Add to Invoice Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={addToInvoice}
                  onChange={(e) => setAddToInvoice(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">
                    Add Travel Distance &amp; KM Charge to Customer Invoice
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Automatically creates an itemized travel line item in the invoice ({distanceKm || 0} km @ ₹{ratePerKm}/km).
                  </p>
                </div>
              </label>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Confirm Route &amp; Start Service
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
