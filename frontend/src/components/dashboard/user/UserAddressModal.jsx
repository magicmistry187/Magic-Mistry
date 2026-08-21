// UserAddressModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// User Dashboard Component — Add / Edit saved address for the logged-in user.
// Used exclusively in: pages/dashboard/UserDashboardPage.jsx
// Renamed from: AddressModal.jsx  →  UserAddressModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Home, Briefcase, Tag } from 'lucide-react';

export default function UserAddressModal({ isOpen, onClose, onSave, initialData }) {
  const [type, setType] = useState(initialData?.type || 'Home');
  const [flat, setFlat] = useState(initialData?.flat || '');
  const [street, setStreet] = useState(initialData?.street || '');
  const [landmark, setLandmark] = useState(initialData?.landmark || '');
  const [pincode, setPincode] = useState(initialData?.pincode || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now(),
      type,
      flat,
      street,
      landmark,
      pincode,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              {initialData ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-700">
            {/* Tag / Type Selection */}
            <div>
              <label className="block font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Address Type</label>
              <div className="flex gap-3">
                {[
                  { label: 'Home', icon: Home },
                  { label: 'Office', icon: Briefcase },
                  { label: 'Other', icon: Tag },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setType(item.label)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      type === item.label
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-xs text-gray-500 mb-1">House / Flat / Building No./ Shop No.</label>
              <input
                type="text"
                required
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. Flat 402, Green Valley Apartments"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-xs text-gray-500 mb-1">Street / Area / Locality</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 10th Main Road, Indiranagar"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-xs text-gray-500 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-xs text-gray-500 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560038"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-colors"
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
