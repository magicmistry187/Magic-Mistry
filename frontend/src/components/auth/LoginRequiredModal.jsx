import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { ShieldAlert, LogIn, UserPlus } from 'lucide-react';

export default function LoginRequiredModal({ isOpen, onClose, appliance = null }) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (onClose) onClose();
    navigate('/login', {
      state: {
        from: '/booking',
        appliance,
        reason: 'Before booking, make sure you are logged in.',
      },
    });
  };

  const handleSignupClick = () => {
    if (onClose) onClose();
    navigate('/signup', {
      state: {
        from: '/booking',
        appliance,
        reason: 'Before booking, make sure you are logged in.',
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Top Gradient Header Bar */}
            <div className="h-2 bg-gradient-to-r from-[#0B1E40] via-orange-500 to-amber-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Close modal"
            >
              <IoClose size={22} />
            </button>

            <div className="p-6 sm:p-8 text-center flex flex-col items-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 shadow-inner">
                <ShieldAlert className="w-9 h-9" />
              </div>

              {/* Header Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1E40] tracking-tight">
                Before booking, make sure you are logged in
              </h2>

              {/* Subtitle / Explanation */}
              <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed max-w-xs">
                To schedule a verified technician and track your service, please log in to your account or create a new one.
              </p>

              {/* Selected Appliance Pill if available */}
              {appliance && (
                <div className="mt-4 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1.5">
                  <span>{appliance.icon || '🔧'}</span>
                  <span>Selected: {appliance.name || appliance.serviceName || 'Service'}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3 mt-7">
                <button
                  onClick={handleLoginClick}
                  className="w-full py-3.5 px-4 bg-[#0B1E40] hover:bg-blue-900 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Log In to Continue
                </button>

                <button
                  onClick={handleSignupClick}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Create New Account
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer mt-1"
                >
                  Cancel / Go Back
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
