import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = ({ label = 'Loading page...' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md font-sans">
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-200/20 overflow-hidden z-[10000]">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-indigo-600 shadow-[0_0_12px_rgba(255,107,0,0.8)]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      </div>

      {/* Center Animated Loader Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white/95 backdrop-blur-xl px-8 py-7 rounded-3xl shadow-2xl border border-white/40 flex flex-col items-center max-w-xs w-full text-center space-y-4"
      >
        {/* Glowing Animated Ring around Logo */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute w-20 h-20 rounded-full border-2 border-dashed border-orange-500"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-24 h-24 rounded-full bg-orange-500/10"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center p-2 shadow-lg z-10">
            <img src="/logo2.png" alt="Magic Mistry" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Brand Name & Dynamic Label */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Magic Mistry</h2>
          <motion.p
            className="text-xs font-bold text-orange-600 mt-1 flex items-center justify-center gap-1.5"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            {label}
          </motion.p>
        </div>

        {/* Bottom Shimmer Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full"
            animate={{ left: ['-50%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;