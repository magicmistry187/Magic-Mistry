import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Home, Briefcase, Tag } from 'lucide-react';

export default function VendorAddressModal({ isOpen, onClose, onSave, initialAddress }) {
  const [type, setType] = useState('Home');
  const [flat, setFlat] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (initialAddress && typeof initialAddress === 'string') {
      const parts = initialAddress.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        setFlat(parts[0] || '');
        setStreet(parts[1] || '');
        // Check if last part has pincode / numbers
        const last = parts[parts.length - 1];
        const pinMatch = last.match(/\d{6}/);
        if (pinMatch) {
          setPincode(pinMatch[0]);
          setLandmark(parts.slice(2, parts.length - 1).join(', ') || '');
        } else {
          setLandmark(parts.slice(2).join(', ') || '');
        }
      } else if (parts.length === 2) {
        setFlat(parts[0] || '');
        setStreet(parts[1] || '');
      } else {
        setStreet(initialAddress);
      }
    }
  }, [initialAddress, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedAddress = [
      flat,
      street,
      landmark ? landmark : null,
      pincode ? pincode : null,
    ]
      .filter(Boolean)
      .join(', ');

    onSave(formattedAddress || `${flat} ${street}`.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        >
          {/* Header (Exact match to screenshot) */}
          <div className="bg-[#0f172a] text-white px-6 py-4.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <MapPin className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="font-extrabold text-base tracking-wide text-white">
                Add New Address
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 text-xs text-slate-700">
            {/* Address Type selection buttons (Exact match to screenshot) */}
            <div>
              <label className="block font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                ADDRESS TYPE
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
                      className={`flex-1 py-3 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
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

            {/* House / Flat / Building No. */}
            <div>
              <label className="block font-bold text-xs text-slate-600 mb-1.5">
                House / Flat / Building No.
              </label>
              <input
                type="text"
                required
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. Flat 402, Green Valley Apartments"
                className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 font-semibold text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            {/* Street / Area / Locality */}
            <div>
              <label className="block font-bold text-xs text-slate-600 mb-1.5">
                Street / Area / Locality
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 10th Main Road, Indiranagar"
                className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 font-semibold text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            {/* Landmark & Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-xs text-slate-600 mb-1.5">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 font-semibold text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-600 mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560038"
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-slate-200 font-semibold text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Footer Buttons (Exact match to screenshot) */}
            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-orange-200 transition-colors cursor-pointer"
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
