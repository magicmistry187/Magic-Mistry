import React from 'react';
import { Wrench } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50/50 p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        {/* Center icon */}
        <Wrench className="absolute w-6 h-6 text-[#0B1E40] animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600 tracking-wide animate-pulse">
        Loading FixIt Pro...
      </p>
    </div>
  );
}
