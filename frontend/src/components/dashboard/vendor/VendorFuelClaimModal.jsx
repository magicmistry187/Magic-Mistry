import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fuel, IndianRupee, Camera, Upload, AlertCircle,
  X, Check, FileText, CheckCircle2, ShieldCheck, Sparkles
} from 'lucide-react';

const VEHICLE_TYPES = [
  { id: '2w', name: '2-Wheeler (Motorcycle / Scooter)', defaultRate: 3.5, icon: '🛵' },
  { id: '3w', name: '3-Wheeler (Auto / Cargo)', defaultRate: 6.0, icon: '🛺' },
  { id: '4w', name: '4-Wheeler (Car / Utility Van)', defaultRate: 9.0, icon: '🚗' },
  { id: 'custom', name: 'Custom Rate / Flat Allowance', defaultRate: 5.0, icon: '⚡' },
];

// Default sample petrol receipt svg for testing
const SAMPLE_FUEL_BILL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
  <rect width="500" height="300" fill="%23f8fafc"/>
  <rect x="20" y="20" width="460" height="260" rx="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/>
  <circle cx="65" cy="65" r="22" fill="%23f97316"/>
  <text x="65" y="73" font-family="sans-serif" font-size="20" fill="%23ffffff" text-anchor="middle">⛽</text>
  <text x="105" y="60" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">INDIAN OIL FUEL STATION</text>
  <text x="105" y="78" font-family="sans-serif" font-size="11" fill="%2364748b">Sector V Retail Outlet • Salt Lake</text>
  <line x1="45" y1="105" x2="455" y2="105" stroke="%23e2e8f0" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="45" y="135" font-family="sans-serif" font-size="13" fill="%23334155">Product: Petrol (Motor Spirit)</text>
  <text x="45" y="160" font-family="sans-serif" font-size="13" fill="%23334155">Volume: 2.50 Litres @ ₹106.03/L</text>
  <text x="45" y="185" font-family="sans-serif" font-size="13" fill="%23334155">Mode: UPI / Vendor Fleet Card</text>
  <text x="45" y="225" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230b1e40">Total Fuel Paid: ₹265.00</text>
  <rect x="330" y="200" width="125" height="32" rx="8" fill="%23ecfdf5" stroke="%236ee7b7"/>
  <text x="392" y="221" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23065f46" text-anchor="middle">✓ VERIFIED SLIP</text>
</svg>`;

export default function VendorFuelClaimModal({
  isOpen,
  onClose,
  completedJobs = [],
  vendorProfile,
  onSubmitClaim
}) {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [vehicleType, setVehicleType] = useState('2w');
  const [ratePerKm, setRatePerKm] = useState(3.5);
  const [distanceKm, setDistanceKm] = useState(5.0);
  const [fuelReceiptImage, setFuelReceiptImage] = useState(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill when job is selected
  useEffect(() => {
    if (selectedJobId && selectedJobId !== 'custom') {
      const found = completedJobs.find(j => j.id === selectedJobId);
      if (found) {
        if (found.travelDistanceKm) {
          setDistanceKm(Number(found.travelDistanceKm));
        }
        if (found.mapScreenshot) {
          setFuelReceiptImage(found.mapScreenshot);
          setReceiptFileName(`Map Proof: ${found.displayId || found.id}`);
        }
        setNotes(`Fuel reimbursement for ${found.serviceTitle || 'service'} at ${found.location || found.customerName}`);
      }
    }
  }, [selectedJobId, completedJobs]);

  // Update default rate when vehicle type changes
  const handleVehicleChange = (newType) => {
    setVehicleType(newType);
    const v = VEHICLE_TYPES.find(item => item.id === newType);
    if (v) {
      setRatePerKm(v.defaultRate);
    }
  };

  const calculatedAmount = Math.max(0, (Number(distanceKm) || 0) * (Number(ratePerKm) || 0));

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload a valid image file (PNG, JPG, or WEBP).');
        return;
      }
      setReceiptFileName(file.name);
      setErrorMsg('');
      const reader = new FileReader();
      reader.onload = (event) => {
        setFuelReceiptImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleReceipt = () => {
    setFuelReceiptImage(SAMPLE_FUEL_BILL_SVG);
    setReceiptFileName('sample_petrol_bill.png');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const kmNum = parseFloat(distanceKm);
    if (isNaN(kmNum) || kmNum <= 0) {
      setErrorMsg('Please enter a valid distance in kilometers.');
      return;
    }
    if (!fuelReceiptImage) {
      setErrorMsg('Please attach a fuel receipt or navigation map proof for the travel claim.');
      return;
    }

    const selectedJobObj = completedJobs.find(j => j.id === selectedJobId);

    const claimData = {
      id: `FUEL-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      jobId: selectedJobId !== 'custom' ? selectedJobId : 'Multi-Trip',
      jobDisplay: selectedJobObj ? (selectedJobObj.displayId || selectedJobObj.id) : 'General Travel',
      customerName: selectedJobObj?.customerName || 'Multiple Customer Visits',
      distanceKm: kmNum,
      vehicleType: VEHICLE_TYPES.find(v => v.id === vehicleType)?.name || vehicleType,
      ratePerKm: Number(ratePerKm),
      claimedAmount: calculatedAmount,
      receiptImage: fuelReceiptImage,
      notes: notes.trim() || 'Travel allowance claim for completed customer service order.',
      status: 'Pending Approval',
      settlementAccount: vendorProfile?.upiId ? `UPI: ${vendorProfile.upiId}` : (vendorProfile?.bankAccount ? `Bank A/C ${vendorProfile.bankAccount}` : 'Registered Bank Account')
    };

    onSubmitClaim(claimData);
  };

  if (!isOpen) return null;

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
                <span className="bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-orange-400" />
                  Travel Reimbursement
                </span>
                <span className="text-xs text-slate-300 font-bold">Earnings &amp; Payout Page</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Apply for Fuel Charges
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Claim fuel allowance for completed customer visits based on verified travel kilometers.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Select Completed Job / Route */}
            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider block mb-1.5">
                Link to Completed Work Order / Service Trip
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Choose Completed Service (Auto-fills KM &amp; Map Proof) --</option>
                {completedJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.displayId || j.id} • {j.serviceTitle} ({j.customerName}) {j.travelDistanceKm ? `[${j.travelDistanceKm} KM]` : ''}
                  </option>
                ))}
                <option value="custom">Other / Custom Daily Route / Multi-stop Trips</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Selecting a completed service with an existing map screenshot will auto-link the route verification.
              </p>
            </div>

            {/* Vehicle Type Selection */}
            <div>
              <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider block mb-2">
                Vehicle Type &amp; Standard Reimbursement Rate
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVehicleChange(v.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      vehicleType === v.id
                        ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-200 text-orange-950 font-extrabold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xl">{v.icon}</span>
                    <span className="text-[11px] leading-tight line-clamp-1">{v.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold text-slate-500">₹{v.defaultRate}/km</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance & Rate Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Total Distance Traveled (KM) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    placeholder="e.g. 8.4"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    KM
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fuel Rate (₹ per KM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={ratePerKm}
                    onChange={(e) => setRatePerKm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="sm:col-span-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Total Claim Amount</span>
                  <span className="text-[11px] text-emerald-700">
                    {distanceKm || 0} KM × ₹{ratePerKm || 0}/KM
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-800">
                  ₹{calculatedAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Fuel Receipt / Proof Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-orange-600" />
                  Fuel Receipt / Odometer / Map Proof *
                </label>
                {!fuelReceiptImage && (
                  <button
                    type="button"
                    onClick={handleUseSampleReceipt}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                  >
                    + Use Sample Petrol Receipt
                  </button>
                )}
              </div>

              {!fuelReceiptImage ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-1.5 shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-800">
                    Upload petrol pump receipt, odometer photo, or route screenshot
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, or WEBP</p>
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
                    src={fuelReceiptImage}
                    alt="Fuel Proof"
                    className="w-full h-36 object-cover object-center group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold truncate max-w-[240px]">
                        {receiptFileName || 'Proof Document Attached'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold transition-colors">
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
                        onClick={() => { setFuelReceiptImage(null); setReceiptFileName(''); }}
                        className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Trip Details &amp; Fuel Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Round trip for AC coil replacement + spare parts procurement"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>

            {/* Settlement Target */}
            <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-100 p-3 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Reimbursement will be disbursed directly to: <strong>{vendorProfile?.upiId || vendorProfile?.bankAccount || 'Registered Bank Account'}</strong>
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Fuel className="w-4 h-4" />
                Submit Fuel Claim
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
