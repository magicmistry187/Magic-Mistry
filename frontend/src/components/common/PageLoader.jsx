import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = ({ label = 'Loading experience...' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B1E40]/75 backdrop-blur-lg font-sans select-none p-4">
      {/* Top Animated Glowing Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-800/40 overflow-hidden z-[10000]">
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-blue-500 via-orange-500 to-amber-400 shadow-[0_0_15px_rgba(255,107,0,0.9)] rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: '400%' }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Centerpiece Luxury Glass Loader Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white/95 backdrop-blur-2xl px-8 py-8 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white flex flex-col items-center max-w-xs w-full text-center relative overflow-hidden group"
      >
        {/* Subtle decorative top accent line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B1E40] via-orange-500 to-[#0B1E40]" />

        {/* Glowing Animated Ring System around Logo */}
        <div className="relative flex items-center justify-center mb-6 w-24 h-24">
          {/* Outer clockwise rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-orange-500/20 border-t-orange-500 border-r-orange-500 shadow-lg shadow-orange-500/20"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          />
          {/* Inner counter-clockwise rotating ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-[3px] border-[#0B1E40]/15 border-b-[#0B1E40] border-l-[#0B1E40]"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
          />
          {/* Center Logo with gentle pulse */}
          <motion.div 
            className="w-16 h-16 rounded-2xl bg-[#0B1E40]/5 flex items-center justify-center p-2 z-10"
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/logo2.png" alt="Magic Mistry" className="h-10 w-auto object-contain drop-shadow-sm" />
          </motion.div>
        </div>

        {/* Brand Name & Dynamic Label */}
        <div className="w-full mb-4">
          <h2 className="text-2xl font-black text-[#0B1E40] tracking-tight">
            Magic Mistry
          </h2>
          <motion.p
            className="text-xs font-extrabold text-orange-600 mt-1.5 flex items-center justify-center gap-2 uppercase tracking-wider"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>{label}</span>
          </motion.p>
        </div>

        {/* Bottom Shimmer Progress Track */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#0B1E40] via-orange-500 to-[#0B1E40] rounded-full"
            animate={{ left: ['-50%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;