import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, PhoneCall, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function CoverageBanner() {
  const navigate = useNavigate();

  const cities = [
    'Kolkata',
    'Howrah',
    'Salt Lake',
    'New Town',
    'Hooghly',
    'North 24 Parganas',
    'South 24 Parganas',
    'Durgapur',
    'Asansol',
    'Siliguri',
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B1E40] via-[#0E244D] to-slate-900 text-white p-8 sm:p-12 lg:p-14 overflow-hidden shadow-2xl border border-slate-700/60">
        
        {/* Subtle decorative radial light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Call to action */}
          <div className="lg:col-span-8 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Express Doorstep Dispatch
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Get Your Appliance Fixed Today by a Verified Technician
            </h2>

            <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed font-normal">
              Zero advance payment. 30-day rework warranty. Same-day express doorstep visit anywhere in our serviced zones.
            </p>

            {/* City coverage pills */}
            <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Active Zones:
              </span>
              {cities.map((city, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium border border-white/10"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Right Side: Primary Booking Button */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="w-full sm:w-auto lg:w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Schedule Service Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto lg:w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Transparent Pricing</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
