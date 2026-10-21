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
  Info
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
  const [showOptionalDetails, setShowOptionalDetails] = useState(
    Boolean(bookingState.problemDescription || bookingState.imageFile)
  );

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // Map services into enhanced categories
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
        basePrice: s.basePrice || 199,
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
  const subServicesList = currentCatData?.subServices || [];

  const handleSelectCategory = (cat) => {
    updateBooking('serviceId', cat.id);
    updateBooking('serviceName', cat.name);

    // Auto-select first sub-service with its actual price
    const catData = applianceSubServices[cat.id];
    if (catData?.subServices?.length) {
      const firstSub = catData.subServices[0];
      updateBooking('selectedSubServices', [firstSub]);
    }
  };

  const handleToggleSubService = (sub) => {
    const isSelected = bookingState.selectedSubServices.some(s => s.label === sub.label || s.id === sub.id);
    let newServices;
    if (isSelected) {
      newServices = bookingState.selectedSubServices.filter(s => s.label !== sub.label && s.id !== sub.id);
    } else {
      newServices = [...bookingState.selectedSubServices, sub];
    }
    updateBooking('selectedSubServices', newServices);
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
      {/* Header */}
      <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-indigo-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Step 1 of 4
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1E40] tracking-tight">
              Select Appliance &amp; Service Package
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Choose your appliance to see transparent, fixed pricing with zero hidden charges.
            </p>
          </div>

          {/* Quick Counter */}
          {bookingState.serviceName && (
            <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-indigo-100 shadow-2xs self-start sm:self-auto shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <ApplianceIcon id={bookingState.serviceId} name={bookingState.serviceName} className="w-5 h-5 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Selected</div>
                <div className="text-xs font-extrabold text-[#0B1E40] truncate max-w-[130px] leading-tight">{bookingState.serviceName}</div>
              </div>
            </div>
          )}
        </div>

        {/* Search & Category Tabs */}
        <div className="mt-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appliance (e.g., AC, Refrigerator, Geyser)..."
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
      </div>

      {/* Appliance Grid */}
      <div className="p-5 sm:p-6 md:p-8 space-y-8">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Available Appliances ({filteredServices.length})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 items-stretch">
            {filteredServices.map((cat) => {
              const isSelected = bookingState.serviceId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between items-center transition-all duration-200 text-center group cursor-pointer h-full min-h-[148px] ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-50/80 to-blue-50/40 border-2 border-indigo-600 shadow-md shadow-indigo-100/50 ring-2 ring-indigo-500/10'
                      : 'bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-2xs hover:-translate-y-0.5'
                  }`}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-2xs font-black z-10">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}

                  {/* Icon Box */}
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
                        isSelected ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                    />
                  </div>

                  {/* Title & Baseline Price */}
                  <div className="mt-2 w-full flex flex-col items-center justify-end flex-1 min-w-0">
                    <span className={`text-xs sm:text-sm leading-tight block font-bold transition-colors line-clamp-2 min-h-[2.1rem] flex items-center justify-center ${
                      isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-800 group-hover:text-slate-950'
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

        {/* Service Packages Section */}
        <AnimatePresence>
          {currentCatData && (
            <motion.div
              key={currentCatData.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-slate-50/70 p-5 md:p-7 rounded-2xl border border-slate-200/90 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/70 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center shrink-0">
                    <ApplianceIcon id={currentCatData.id} name={currentCatData.name} className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Select Package</span>
                    <h3 className="font-extrabold text-[#0B1E40] text-base sm:text-lg">
                      {currentCatData.name} Service Packages
                    </h3>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto shrink-0">
                  {subServicesList.length} options available
                </div>
              </div>

              {/* Package cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
                {subServicesList.map((sub, idx) => {
                  const isSubSelected = bookingState.selectedSubServices.some(
                    s => s.label === sub.label || s.id === sub.id
                  );

                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleSubService(sub)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full group ${
                        isSubSelected
                          ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/10'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 transition-colors ${
                            isSubSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                              : 'border-slate-300 text-transparent group-hover:border-indigo-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold leading-snug transition-colors ${
                            isSubSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-800'
                          }`}>
                            {sub.label}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 leading-normal font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Includes inspection, standard repair &amp; 30-day warranty.</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fixed Price</span>
                        <span className="text-base font-black text-[#0B1E40]">₹{sub.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {bookingState.selectedSubServices.length === 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  Please select at least one package to proceed.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Integrated Optional Details Accordion */}
        {bookingState.serviceId && (
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

        {/* Step 1 Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            {isStep1Valid ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Service ready: {bookingState.selectedSubServices.length} package(s) selected
              </span>
            ) : (
              <span>Please select an appliance and at least one service package.</span>
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