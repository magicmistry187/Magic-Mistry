// UserTechnicianMapModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// User Dashboard Component — Shows live technician GPS tracking to the user.
// Used exclusively in: pages/dashboard/UserDashboardPage.jsx
// Renamed from: TechnicianMapModal.jsx  →  UserTechnicianMapModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, ShieldCheck, MapPin, Navigation, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserTechnicianMapModal({ isOpen, onClose, technician, booking }) {
  const [eta, setEta] = useState(18); // 18 mins ETA

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEta((prev) => (prev > 5 ? prev - 1 : prev));
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="font-bold text-lg">Live Technician Tracker</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Simulated Map Box */}
          <div className="relative h-64 bg-slate-100 overflow-hidden flex items-center justify-center">
            {/* SVG Vector Map background simulation */}
            <svg className="absolute inset-0 w-full h-full text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Roads */}
              <path d="M-20 120 C 150 120, 250 80, 500 150" stroke="#cbd5e1" strokeWidth="12" fill="none" />
              <path d="M120 -20 C 120 100, 280 180, 320 300" stroke="#cbd5e1" strokeWidth="12" fill="none" />
              {/* Active Route Line */}
              <motion.path
                d="M 120 120 Q 220 100 320 180"
                stroke="#ff6b00"
                strokeWidth="4"
                strokeDasharray="6,6"
                fill="none"
                animate={{ strokeDashoffset: [0, -24] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              />
            </svg>

            {/* Destination Marker (User Home) */}
            <div className="absolute left-[320px] top-[180px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg ring-4 ring-indigo-200 animate-bounce">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 shadow">
                Your Address
              </span>
            </div>

            {/* Technician Live Marker */}
            <motion.div
              className="absolute left-[160px] top-[110px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
              animate={{ x: [0, 15, 0], y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl ring-4 ring-orange-200">
                  <Navigation className="w-6 h-6 rotate-45" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
              <span className="bg-orange-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 shadow flex items-center gap-1">
                <Clock className="w-3 h-3" /> {eta} mins away
              </span>
            </motion.div>

            {/* Floating Live Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live GPS Tracking active</span>
            </div>
          </div>

          {/* Technician Info Card */}
          <div className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {technician?.name ? technician.name.slice(0, 2).toUpperCase() : 'SK'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full text-[10px]" title="Verified Partner">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">{technician?.name || 'Suresh Kumar'}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {technician?.rating || '4.9'}
                    </span>
                    <span className="text-xs text-gray-400">• {technician?.jobs || '120+ jobs'}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Verified Expert
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2">
                <Link
                  to={`tel:${technician?.phone || '+919876543210'}`}
                  className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200"
                  title="Call Technician"
                >
                  <Phone className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => alert(`Messaging ${technician?.name || 'Technician'}...`)}
                  className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                  title="Chat with Technician"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Service Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 font-medium">Service Name</p>
                <p className="font-bold text-gray-800 mt-0.5">{booking?.service || 'Split AC Deep Cleaning'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 font-medium">Booking ID</p>
                <p className="font-bold text-gray-800 mt-0.5">{booking?.id || '#FX-84920'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
