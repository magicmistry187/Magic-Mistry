import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking, APPLIANCE_SUB_SERVICES } from './BookingContext';
import { Lock, Unlock, CheckCircle2, ChevronRight } from 'lucide-react';
import ApplianceIcon from '../common/ApplianceIcon';

export default function ApplianceSelector() {
  const { bookingState, updateBooking, unlockApplianceSelection, scrollToNextStep } = useBooking();

  // All appliance categories matching home page & diagram flow
  const defaultServices = [
    { id: 1, name: 'AC Repair' },
    { id: 2, name: 'Refrigerator' },
    { id: 3, name: 'Washing Machine' },
    { id: 4, name: 'Microwave' },
    { id: 5, name: 'Mixer Grinder' },
    { id: 6, name: 'Pump Motor' },
    { id: 7, name: 'Air Cooler' },
    { id: 8, name: 'Induction Cooktop' },
    { id: 9, name: 'Stabilizer' },
    { id: 10, name: 'Press Iron' },
    { id: 11, name: 'TV' },
    { id: 12, name: 'Ceiling Fan' },
    { id: 13, name: 'Geyser' },
    { id: 14, name: 'Stand Fan' },
    { id: 15, name: 'Table Fan' },
    { id: 16, name: 'Switch Board' },
  ];

  // null means user came directly to booking page — no pre-selection
  const currentCatId = bookingState.serviceId || null;
  const currentCatData = currentCatId ? (APPLIANCE_SUB_SERVICES[currentCatId] || null) : null;
  const subServicesList = currentCatData?.subServices || [];

  const handleSelectCategory = (cat) => {

    updateBooking('serviceId', cat.id);
    updateBooking('serviceName', cat.name);

    // Auto-select first sub-service of new category
    const catData = APPLIANCE_SUB_SERVICES[cat.id];
    if (catData?.subServices?.length) {
      const firstSub = catData.subServices[0];
      updateBooking('selectedSubService', firstSub.label);
      updateBooking('priceInfo', { basePrice: firstSub.price, visitCharge: 0, total: firstSub.price });
    }
  };

  const handleSelectSubService = (sub) => {
    const isSelected = bookingState.selectedSubServices.some(s => s.label === sub.label);
    let newServices;
    if (isSelected) {
      newServices = bookingState.selectedSubServices.filter(s => s.label !== sub.label);
    } else {
      newServices = [...bookingState.selectedSubServices, sub];
    }
    updateBooking('selectedSubServices', newServices);
  };

  return (
    <div className="bg-white p-7 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1E40] flex items-center gap-4 tracking-tight">
            <span className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl w-10 h-10 inline-flex items-center justify-center text-lg font-black shadow-lg shadow-blue-500/30">
              1
            </span>
            Select Appliance & Service
          </h2>
          <p className="text-sm text-slate-500 mt-2 ml-14 font-medium max-w-lg">
            Choose your home appliance and select the specific service package with transparent pricing.
          </p>
        </div>

        {/* isApplianceLocked button removed */}
      </div>

      {/* Main Categories Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {defaultServices.map((cat) => {
          const isSelected = bookingState.serviceId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 gap-3 text-center relative group overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-50 to-blue-50/50 text-indigo-950 shadow-lg shadow-indigo-100 border border-indigo-200 ring-2 ring-indigo-500/20 transform -translate-y-1'
                  : 'bg-slate-50 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer transform hover:-translate-y-1'
              }`}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-sm">
                  ✓
                </span>
              )}
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                <ApplianceIcon id={cat.id} name={cat.name} className="w-12 h-12" />
              </div>
              <span className={`text-xs leading-tight truncate w-full transition-colors ${isSelected ? 'font-extrabold text-indigo-900' : 'font-bold text-slate-600 group-hover:text-slate-900'}`}>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {currentCatData ? (
          <motion.div 
            key="subservices"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <ApplianceIcon id={currentCatData?.id} name={currentCatData?.name} className="w-10 h-10 flex-shrink-0" />
              </div>
              <h3 className="font-extrabold text-[#0B1E40] text-lg tracking-tight">
                {currentCatData?.name} Packages
              </h3>
            </div>
            <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500">
                {subServicesList.length} Options
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subServicesList.map((sub, index) => {
              const isSubSelected = bookingState.selectedSubServices.some(s => s.label === sub.label);

              return (
                <div
                  key={index}
                  onClick={() => handleSelectSubService(sub)}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 ${
                    isSubSelected
                      ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${
                        isSubSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 text-transparent group-hover:border-indigo-300'
                      }`}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className={`text-sm font-extrabold transition-colors ${isSubSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{sub.label}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Includes standard visit charge.</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fixed Price</span>
                    <span className="text-lg font-black text-[#0B1E40]">₹{sub.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => {
                if (bookingState.selectedSubServices.length > 0 && scrollToNextStep) {
                  scrollToNextStep('step-problem-selector');
                }
              }}
              disabled={bookingState.selectedSubServices.length === 0}
              className={`px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm flex items-center gap-2 text-sm ${
                bookingState.selectedSubServices.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue to Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
              <p className="text-xs font-semibold">Select any category above to view available repair packages.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}