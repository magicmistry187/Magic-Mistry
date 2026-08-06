import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = ({ label = 'Loading page...' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md font-sans select-none p-4">
      {/* Top Animated Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800/40 overflow-hidden z-[10000]">
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-blue-500 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(255,107,0,0.8)] rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: '350%' }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      </div>

      {/* Centerpiece Glass Loader Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="bg-white/95 backdrop-blur-xl px-7 py-7 rounded-3xl shadow-2xl border border-white/80 flex flex-col items-center max-w-xs w-full text-center relative overflow-hidden"
      >
        {/* Top Gradient Accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B1E40] via-orange-500 to-[#0B1E40]" />

        {/* Animated Rings around Logo */}
        <div className="relative flex items-center justify-center mb-5 w-20 h-20">
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-orange-500/20 border-t-orange-500 shadow-md shadow-orange-500/20"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-[3px] border-[#0B1E40]/15 border-b-[#0B1E40]"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
          />
          <div className="w-14 h-14 rounded-2xl bg-[#0B1E40]/5 flex items-center justify-center p-2 z-10">
            <img src="/logo2.png" alt="Magic Mistry" className="h-8 w-auto object-contain drop-shadow-sm" />
          </div>
        </div>

        {/* Brand Name & Label */}
        <div className="w-full mb-3">
          <h2 className="text-xl font-extrabold text-[#0B1E40] tracking-tight">
            Magic Mistry
          </h2>
          <p className="text-[11px] font-bold text-orange-600 mt-1 flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            <span>{label}</span>
          </p>
        </div>

        {/* Bottom Shimmer Progress Bar */}
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#0B1E40] via-orange-500 to-[#0B1E40] rounded-full"
            animate={{ left: ['-50%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;