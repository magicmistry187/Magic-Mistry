import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from './BookingContext';
import { useLivePricing } from '../../services/pricingService';
import ApplianceIcon from '../common/ApplianceIcon';
import {
  Search,
  Check,
  ChevronRight,
  Sparkles,
  X,
  UploadCloud,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Info,
  ArrowLeftRight,
  Zap,
  Award,
  Layers,
  Clock,
  RotateCcw
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Appliances' },
  { id: 'cooling', label: 'Cooling & AC' },
  { id: 'cleaning', label: 'Cleaning & Wash' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'electrical', label: 'Electrical & Power' },
];

export default function ApplianceSelector() {
  const { bookingState, updateBooking, nextStep, isStep1Valid } = useBooking();
  const { applianceSubServices, services } = useLivePricing();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isChangingService, setIsChangingService] = useState(false);
  const [allowMultiplePackages, setAllowMultiplePackages] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(
    Boolean(bookingState.problemDescription || bookingState.imageFile)
  );

  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // Map services into enhanced categories with descriptions & pricing
  const formattedServices = useMemo(() => {
    return services.map((s, idx) => {
      const id = typeof s.id === 'number' ? s.id : (idx + 1);
      const name = s.name || '';
      const catKey = (s.catKey || '').toLowerCase();
      const catName = (s.category || '').toLowerCase();

      let group = 'electrical';
      if (catName.includes('cooling') || /ac|cooler|refrigerator|fridge/i.test(name) || /cooling/i.test(catKey)) {
        group = 'cooling';
      } else if (catName.includes('cleaning') || /washing/i.test(name) || /washing/i.test(catKey)) {
        group = 'cleaning';
      } else if (catName.includes('kitchen') || /microwave|mixer|cooktop|grinder|induction/i.test(name)) {
        group = 'kitchen';
      }

      return {
        id,
        name,
        icon: s.icon,
        description: s.description || 'Doorstep inspection, genuine spares, and expert certified servicing.',
        basePrice: s.basePrice || 199,
        category: s.category || (group === 'cooling' ? 'Cooling' : group === 'cleaning' ? 'Cleaning' : group === 'kitchen' ? 'Kitchen' : 'Electrical'),
        group,
        subServicesCount: s.subServices?.length || 0,
      };
    });
  }, [services]);

  // Filter appliances based on tab and search
  const filteredServices = useMemo(() => {
    return formattedServices.filter((s) => {
      const matchesTab = selectedTab === 'all' || s.group === selectedTab;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesTab && matchesSearch;
    });
  }, [formattedServices, selectedTab, searchQuery]);

  const currentCatId = bookingState.serviceId || null;
  const currentCatData = currentCatId ? (applianceSubServices[currentCatId] || null) : null;
  const currentFormattedService = useMemo(() => {
    if (!currentCatId) return null;
    return formattedServices.find(s => s.id === currentCatId) || null;
  }, [currentCatId, formattedServices]);

  const subServicesList = currentCatData?.subServices || [];

  // Determine whether we are in "Focused Single Service Mode" or "Catalog Browser Mode"
  const hasSelectedService = Boolean(bookingState.serviceId && currentCatData);
  const showCatalogBrowser = !hasSelectedService || isChangingService;

  // Select an appliance category
  const handleSelectCategory = (cat) => {
    updateBooking({
      serviceId: cat.id,
      serviceName: cat.name,
    });
    setIsChangingService(false);
    setSearchQuery('');
  };

  // Toggle or select sub-service package
  const handleSelectPackage = (sub) => {
    if (allowMultiplePackages) {
      const isSelected = bookingState.selectedSubServices.some(s => s.label === sub.label || s.id === sub.id);
      let newServices;
      if (isSelected) {
        newServices = bookingState.selectedSubServices.filter(s => s.label !== sub.label && s.id !== sub.id);
      } else {
        newServices = [...bookingState.selectedSubServices, sub];
      }
      updateBooking('selectedSubServices', newServices);
    } else {
      // Single selection: clicking selects this package directly
      updateBooking('selectedSubServices', [sub]);
    }
  };

  // Image handling
  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    updateBooking('imageFile', file);
  };

  const removeFile = () => {
    updateBooking('imageFile', null);
  };

  const previewUrl = useMemo(() => {
    if (!bookingState.imageFile) return null;
    return URL.createObjectURL(bookingState.imageFile);
  }, [bookingState.imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* ============================================================ */}
      {/* 1. STEP 1 HEADER                                             */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-indigo-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Step 1 of 4
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1E40] tracking-tight">
              {hasSelectedService && !isChangingService
                ? 'Your Selected Service & Package'
                : 'Select Appliance & Service'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {hasSelectedService && !isChangingService
                ? 'Review your selected main service, choose your package, and proceed with transparent pricing.'
                : 'Select the home appliance you want repaired to unlock instant upfront rates.'}
            </p>
          </div>

          {/* Quick Counter */}
          {hasSelectedService && !isChangingService && (
            <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-indigo-100 shadow-2xs self-start sm:self-auto shrink-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <ApplianceIcon id={bookingState.serviceId} name={bookingState.serviceName} className="w-6 h-6 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Active Service</div>
                <div className="text-xs font-extrabold text-[#0B1E40] truncate max-w-[140px] leading-tight">{bookingState.serviceName}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 md:p-8 space-y-6">
        {/* ============================================================ */}
        {/* 2. FOCUSED MODE: ONLY SELECTED MAIN SERVICE SHOWS            */}
        {/* All other 15 appliances are completely hidden!               */}
        {/* ============================================================ */}
        <AnimatePresence mode="wait">
          {!showCatalogBrowser && currentCatData && (
            <motion.div
              key="selected-single-service-view"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Luxury Selected Main Service Hero Card */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border-2 border-indigo-500/80 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-5 sm:p-6 md:p-7 shadow-sm ring-4 ring-indigo-500/5">
                {/* Decorative background glow */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
                    {/* Appliance Icon Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center p-2.5 shrink-0 transition-transform hover:scale-105">
                      <ApplianceIcon
                        id={currentCatData.id}
                        name={currentCatData.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Service Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Selected Main Service
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {currentFormattedService?.category || 'Major Appliance'}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-2xl font-black text-[#0B1E40] tracking-tight">
                        {currentCatData.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {currentFormattedService?.description ||
                          'Professional doorstep inspection, certified repair technicians, and genuine OEM spares.'}
                      </p>

                      {/* Value props pills */}
                      <div className="mt-3 flex items-center gap-2 sm:gap-3 flex-wrap text-[11px] font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          30-Day Free Warranty
                        </span>
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">
                          <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          60-Min Doorstep Visit
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-100">
                          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Verified Mistry
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Change Appliance Action Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-indigo-100/80 pt-3 sm:pt-0 shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingService(true);
                        setTimeout(() => searchInputRef.current?.focus(), 100);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 shadow-xs hover:shadow transition-all group cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                      <span>Change Appliance</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                      Click to choose another appliance
                    </span>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* 3. SERVICE PACKAGES SECTION (Directly below selected service) */}
              {/* ============================================================ */}
              <div className="bg-slate-50/70 p-5 md:p-7 rounded-2xl md:rounded-3xl border border-slate-200/90 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/70 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                      <Layers className="w-3.5 h-3.5" /> Select Service Package
                    </div>
                    <h3 className="font-extrabold text-[#0B1E40] text-base sm:text-xl">
                      {currentCatData.name} Packages
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Choose the specific repair or maintenance package you need. Zero surprise charges.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setAllowMultiplePackages(p => !p)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        allowMultiplePackages
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Toggle multi-package selection"
                    >
                      <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                      {allowMultiplePackages ? 'Multiple Packages: ON' : 'Multiple Packages: OFF'}
                    </button>

                    <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      {subServicesList.length} options
                    </div>
                  </div>
                </div>

                {/* Package Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
                  {subServicesList.map((sub, idx) => {
                    const isSubSelected = bookingState.selectedSubServices.some(
                      s => s.label === sub.label || s.id === sub.id
                    );
                    const isPopular = idx === 0 || /jet|service|general/i.test(sub.label);

                    return (
                      <div
                        key={sub.id || idx}
                        onClick={() => handleSelectPackage(sub)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full group relative ${
                          isSubSelected
                            ? 'bg-gradient-to-br from-indigo-50/60 via-white to-white border-indigo-600 shadow-md ring-2 ring-indigo-500/15'
                            : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Popular badge */}
                        {isPopular && (
                          <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-2xs">
                            Most Booked
                          </span>
                        )}

                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Radio / Check indicator */}
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 transition-colors ${
                              isSubSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                                : 'border-slate-300 text-transparent group-hover:border-indigo-400 bg-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
                              isSubSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-800 group-hover:text-slate-950'
                            }`}>
                              {sub.label}
                            </h4>

                            <div className="mt-2 space-y-1 text-[11px] text-slate-500 font-medium">
                              <p className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Complete inspection &amp; diagnosis included</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>30-Day rework warranty &amp; post-repair testing</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price footer */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Fixed Price</span>
                            <span className="text-lg font-black text-[#0B1E40]">₹{sub.price}</span>
                          </div>

                          <div className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                            isSubSelected
                              ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100'
                              : 'text-slate-500 group-hover:text-indigo-600 group-hover:bg-slate-50'
                          }`}>
                            {isSubSelected ? (
                              <>
                                <Check className="w-3 h-3 stroke-[3]" /> Selected
                              </>
                            ) : (
                              'Select Package'
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {bookingState.selectedSubServices.length === 0 && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    Please click a package to select it before continuing.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* 4. CATALOG BROWSER MODE: SHOWN WHEN NO APPLIANCE SELECTED    */}
        {/* OR WHEN USER CLICKS "CHANGE APPLIANCE"                       */}
        {/* ============================================================ */}
        <AnimatePresence mode="wait">
          {showCatalogBrowser && (
            <motion.div
              key="catalog-browser-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Notice Banner if user is changing appliance */}
              {isChangingService && currentCatData && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
                      <ApplianceIcon id={currentCatData.id} name={currentCatData.name} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Currently Selected</div>
                      <div className="text-sm font-extrabold text-[#0B1E40] truncate">
                        {currentCatData.name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChangingService(false)}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel (Keep {currentCatData.name})</span>
                  </button>
                </div>
              )}

              {/* Search & Category Tabs */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search appliance (e.g., AC, Refrigerator, Geyser, Washing Machine)..."
                    className="w-full h-11 pl-10 pr-9 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none placeholder:text-slate-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
                  {CATEGORY_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTab(tab.id)}
                      className={`whitespace-nowrap h-11 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                        selectedTab === tab.id
                          ? 'bg-[#0B1E40] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Appliances Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select One Main Service ({filteredServices.length} available)
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Once selected, other services will be hidden
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 items-stretch">
                  {filteredServices.map((cat) => {
                    const isSelected = bookingState.serviceId === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`relative p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between items-center transition-all duration-200 text-center group cursor-pointer h-full min-h-[154px] ${
                          isSelected
                            ? 'bg-gradient-to-b from-indigo-50/80 to-blue-50/40 border-2 border-indigo-600 shadow-md shadow-indigo-100/50 ring-2 ring-indigo-500/10'
                            : 'bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-sm hover:-translate-y-1'
                        }`}
                      >
                        {/* Selected checkmark badge */}
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-2xs font-black z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}

                        {/* Icon Container */}
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 p-2 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-white shadow-2xs border border-indigo-100'
                              : 'bg-slate-50/80 border border-slate-100 group-hover:bg-white group-hover:shadow-2xs'
                          }`}
                        >
                          <ApplianceIcon
                            id={cat.id}
                            name={cat.name}
                            className={`w-full h-full object-contain transition-transform duration-300 ${
                              isSelected ? 'scale-105' : 'group-hover:scale-110'
                            }`}
                          />
                        </div>

                        {/* Title & Price */}
                        <div className="mt-2 w-full flex flex-col items-center justify-end flex-1 min-w-0">
                          <span className={`text-xs sm:text-sm leading-tight block font-bold transition-colors line-clamp-2 min-h-[2.1rem] flex items-center justify-center ${
                            isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-800 group-hover:text-indigo-900'
                          }`}>
                            {cat.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                            From ₹{cat.basePrice}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {filteredServices.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm font-semibold text-slate-600">No appliances found matching "{searchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSelectedTab('all'); }}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Clear search and filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* 5. INTEGRATED OPTIONAL DETAILS ACCORDION                     */}
        {/* (Issue description notes & appliance image uploader)        */}
        {/* ============================================================ */}
        {hasSelectedService && (
          <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowOptionalDetails(p => !p)}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-[#0B1E40]">
                      Add Issue Notes or Appliance Photo
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      Optional
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Help our technician bring the right tools or replacement parts.
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0 ml-2">
                {showOptionalDetails ? 'Hide' : (bookingState.problemDescription || bookingState.imageFile ? 'Edit details' : '+ Add Details')}
              </div>
            </button>

            {showOptionalDetails && (
              <div className="p-5 md:p-6 border-t border-slate-100 space-y-5 bg-white">
                {/* Problem Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Describe the Problem or Symptoms
                  </label>
                  <textarea
                    rows={3}
                    value={bookingState.problemDescription}
                    onChange={(e) => updateBooking('problemDescription', e.target.value)}
                    placeholder="E.g., AC cooling is low and water is dripping from the indoor unit, or washing machine drum makes a loud sound during spin cycle..."
                    className="w-full p-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none placeholder:text-slate-400 font-medium resize-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank if you prefer the technician to diagnose in person.
                  </p>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Upload Photo of Appliance or Issue
                  </label>

                  {!bookingState.imageFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileChange(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        dragOver
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 bg-slate-50/30'
                      }`}
                    >
                      <UploadCloud className={`w-6 h-6 mx-auto mb-1.5 ${dragOver ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <p className="text-xs font-bold text-slate-700">
                        Drag &amp; drop photo, or <span className="text-indigo-600 hover:underline">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP • Up to 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0 shadow-2xs">
                          <img src={previewUrl} alt="Appliance" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Photo Attached
                          </div>
                          <p className="text-xs text-slate-600 truncate font-medium mt-0.5">
                            {bookingState.imageFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(bookingState.imageFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white bg-slate-100 rounded-md transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 6. STEP 1 ACTION BAR                                         */}
        {/* ============================================================ */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            {isStep1Valid ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Service ready: {bookingState.serviceName} ({bookingState.selectedSubServices.length} package selected)
              </span>
            ) : (
              <span>Please select an appliance and package to continue.</span>
            )}
          </div>

          <button
            type="button"
            onClick={nextStep}
            disabled={!isStep1Valid}
            className={`w-full sm:w-auto h-11 px-7 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
              isStep1Valid
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Continue to Schedule <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}