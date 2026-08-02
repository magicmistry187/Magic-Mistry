import React from 'react';
import { useBooking, APPLIANCE_SUB_SERVICES } from './BookingContext';
import { Lock, Unlock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ApplianceSelector() {
  const { bookingState, updateBooking, unlockApplianceSelection } = useBooking();

  // All appliance categories matching home page & diagram flow
  const defaultServices = [
    { id: 1, name: 'AC Repair', icon: '❄️' },
    { id: 2, name: 'Refrigerator', icon: '🧊' },
    { id: 3, name: 'Washing Machine', icon: '🧺' },
    { id: 4, name: 'Microwave', icon: '♨️' },
    { id: 5, name: 'Mixer Grinder', icon: '🥛' },
    { id: 6, name: 'Pump Motor', icon: '💧' },
    { id: 7, name: 'Air Cooler', icon: '💨' },
    { id: 8, name: 'Induction Cooktop', icon: '🍳' },
    { id: 9, name: 'Stabilizer', icon: '🔌' },
    { id: 10, name: 'Press Iron', icon: '👔' },
    { id: 11, name: 'TV', icon: '📺' },
    { id: 12, name: 'Ceiling Fan / Fan Repair', icon: '🌀' },
    { id: 13, name: 'Geyser', icon: '🚿' },
    { id: 14, name: 'Stand Fan', icon: '🌬️' },
    { id: 15, name: 'Table Fan / Wall Fan', icon: '🎐' },
    { id: 16, name: 'Wiring / Switch Board', icon: '⚡' },
  ];

  // null means user came directly to booking page — no pre-selection
  const currentCatId = bookingState.serviceId || null;
  const currentCatData = currentCatId ? (APPLIANCE_SUB_SERVICES[currentCatId] || null) : null;
  const subServicesList = currentCatData?.subServices || [];

  const handleSelectCategory = (cat) => {
    if (bookingState.isApplianceLocked) return;

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
    updateBooking('selectedSubService', sub.label);
    updateBooking('priceInfo', { basePrice: sub.price, visitCharge: 0, total: sub.price });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1E40] flex items-center gap-3">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
              1
            </span>
            Select Main Category & Service
          </h2>
          <p className="text-xs text-slate-500 mt-1 ml-11">
            Choose your appliance category and select the specific service package with clear pricing.
          </p>
        </div>

        {bookingState.isApplianceLocked && (
          <button
            onClick={unlockApplianceSelection}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            Change Main Category
          </button>
        )}
      </div>

      {/* Main Categories Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {defaultServices.map((cat) => {
          const isSelected = bookingState.serviceId === cat.id;
          const isDisabled = bookingState.isApplianceLocked && !isSelected;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              disabled={isDisabled}
              className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center transition-all gap-1.5 text-center relative ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/90 text-blue-950 shadow-md ring-2 ring-blue-500/20 font-extrabold'
                  : isDisabled
                  ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50 bg-white cursor-pointer'
              }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-bold leading-tight truncate w-full">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Services & Price Table — only shown after a category is selected */}
      {currentCatData ? (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentCatData?.icon || '⚙️'}</span>
              <h3 className="font-extrabold text-slate-900 text-base">
                {currentCatData?.name} Service &amp; Pricing Packages
              </h3>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Fixed Price Guarantee
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {subServicesList.map((sub) => {
              const isSubSelected =
                bookingState.selectedSubService === sub.label ||
                (!bookingState.selectedSubService && subServicesList[0]?.id === sub.id);

              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubService(sub)}
                  className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    isSubSelected
                      ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-400 font-bold text-slate-900'
                      : 'border-slate-200 bg-white/80 hover:border-blue-300 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors ${
                        isSubSelected
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'border-slate-300 bg-slate-50'
                      }`}
                    >
                      {isSubSelected ? '✓' : ''}
                    </div>
                    <span className="text-xs font-semibold truncate">{sub.label}</span>
                  </div>
                  <span
                    className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                      isSubSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    ₹{sub.price}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Placeholder shown before any appliance is selected */
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2">
          <span className="text-4xl">👆</span>
          <p className="text-sm font-bold text-slate-500">Select an appliance above</p>
          <p className="text-xs text-slate-400">Service packages and pricing will appear here</p>
        </div>
      )}

      {bookingState.isApplianceLocked && (
        <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
          <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>
            Pre-selected <strong>{bookingState.serviceName}</strong> from homepage. Click 'Change Main Category' to switch.
          </span>
        </div>
      )}
    </div>
  );
}