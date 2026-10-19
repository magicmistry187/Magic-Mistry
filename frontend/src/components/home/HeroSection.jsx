import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Star, 
  Clock, 
  Sparkles,
  Wrench,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../auth/LoginRequiredModal';
import { useLivePricing } from '../../services/pricingService';
import ApplianceIcon from '../common/ApplianceIcon';

export default function HeroSection() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { services } = useLivePricing();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Quick select popular services
  const popularShortcuts = useMemo(() => [
    { id: 1, name: 'AC Repair', price: '₹250', badge: 'Popular' },
    { id: 2, name: 'Refrigerator', price: '₹199' },
    { id: 3, name: 'Washing Machine', price: '₹299' },
    { id: 4, name: 'Microwave', price: '₹149' },
    { id: 13, name: 'Geyser', price: '₹199' },
    { id: 6, name: 'Pump Motor', price: '₹249' },
  ], []);

  // Filtered services for the search box
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return services.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.category && s.category.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery, services]);

  const handleServiceSelect = (appliance) => {
    navigate('/booking', {
      state: { appliance }
    });
  };

  const handleBookClick = () => {
    navigate('/booking');
  };

  return (
    <section className="relative pt-6 pb-14 lg:pt-10 lg:pb-20 overflow-hidden bg-slate-50">
      {/* Background Architectural Grid Pattern (Subtle, non-distracting) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0B1E40 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Interactive Booking Search (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Live Service Availability Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-xs mb-6 w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[#0B1E40] font-bold">Express Doorstep Visit</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Kolkata &amp; West Bengal</span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#0B1E40] tracking-tight leading-[1.12] mb-5"
            >
              Expert electronics repair,{' '}
              <span className="text-blue-600 block sm:inline">
                delivered at your doorstep.
              </span>
            </motion.h1>

            {/* Grounded, Reassuring Subhead */}
            <motion.p 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-slate-600 text-base sm:text-lg leading-relaxed mb-7 max-w-xl font-normal"
            >
              Certified local technicians for AC, Refrigerator, Washing Machine &amp; 13+ home appliances. Transparent fixed rates, zero advance deposit, and a 30-day rework warranty.
            </motion.p>

            {/* Quick Interactive Search / Appliance Selector Console */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="relative max-w-xl mb-6"
            >
              <div className="relative flex items-center bg-white rounded-2xl border-2 border-slate-200/90 shadow-lg shadow-slate-200/50 p-1.5 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <div className="pl-3.5 pr-2 text-slate-400">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Which appliance needs repair? (e.g. AC, Fridge, Washing Machine)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 font-medium outline-none py-2"
                />
                <button
                  type="button"
                  onClick={handleBookClick}
                  className="bg-[#0B1E40] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Instant Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-30 divide-y divide-slate-100"
                  >
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleServiceSelect(item);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 p-1 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <ApplianceIcon id={item.id} name={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-400">Starting from ₹{item.basePrice || 199}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                          Select <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Popular Shortcut Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="flex items-center gap-2 flex-wrap mb-8"
            >
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
                Frequently Repaired:
              </span>
              {popularShortcuts.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleServiceSelect(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
                >
                  <span>{s.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal">({s.price})</span>
                </button>
              ))}
            </motion.div>

            {/* Trust Micro-Metrics Banner */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B1E40]">30-Day</p>
                  <p className="text-[11px] text-slate-500">Service warranty</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B1E40]">Zero Advance</p>
                  <p className="text-[11px] text-slate-500">Pay after testing</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B1E40]">60-Min Visit</p>
                  <p className="text-[11px] text-slate-500">Express dispatch</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-purple-600 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B1E40]">4.9 ★ Rating</p>
                  <p className="text-[11px] text-slate-500">12k+ local repairs</p>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Authentic Editorial Visual & Trust Card (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              {/* Primary Image Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-[4/3]">
                <img
                  src="/hero-technician.jpg"
                  alt="Verified Magic Mistry Technician diagnosing washing machine"
                  className="w-full h-full object-cover object-center select-none"
                  loading="eager"
                />
                
                {/* Subtle gradient vignette to ground badge text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E40]/70 via-transparent to-transparent pointer-events-none" />

                {/* Overlaid Bottom Context Banner */}
                <div className="absolute bottom-4 left-4 right-4 text-white z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Doorstep Inspection in Progress</p>
                    <p className="text-sm font-extrabold text-white">Verified Electronics Technician</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    On Duty
                  </span>
                </div>
              </div>

              {/* Floating Verified Trust Pill */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B1E40]">100% Police Verified</p>
                  <p className="text-[11px] text-slate-500">Background-checked &amp; certified</p>
                </div>
              </motion.div>

              {/* Floating Guarantee Pill */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-5 -right-4 sm:-right-6 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Wrench className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B1E40]">Genuine Spare Parts</p>
                  <p className="text-[11px] text-slate-500">OEM components with bill</p>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
}
