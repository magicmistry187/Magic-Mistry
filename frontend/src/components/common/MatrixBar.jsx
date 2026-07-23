import React from 'react';
import { motion } from 'framer-motion';

export default function MatrixBar({
  title,
  value,
  watermarkIcon,
  watermarkColor = "text-gray-200",
  footerIcon,
  footerContent,
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative flex flex-col justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden min-h-[130px]"
    >
      {/* Watermark Icon */}
      <div className={`absolute top-4 right-4 opacity-20 pointer-events-none ${watermarkColor}`}>
        {watermarkIcon}
      </div>

      <div>
        {/* Title */}
        <h3 className="text-[13px] font-semibold text-gray-500 mb-2 relative z-10">
          {title}
        </h3>
        
        {/* Main Value */}
        <div className="text-2xl font-bold text-slate-800 relative z-10">
          {value}
        </div>
      </div>

      {/* Footer / Meta Info */}
      <div className="flex items-center gap-1.5 mt-4 relative z-10 text-[12px]">
        {footerIcon}
        <div className="flex items-center gap-1">
          {footerContent}
        </div>
      </div>
    </motion.div>
  );
}