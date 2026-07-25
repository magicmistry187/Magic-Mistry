import React from 'react';
import { useBooking } from './BookingContext';
import { Lock, Unlock } from 'lucide-react';

export default function ApplianceSelector() {
  const { bookingState, updateBooking, unlockApplianceSelection } = useBooking();
  
  // All appliance categories matching home page and standard services
  const defaultServices = [
    { id: 1, name: 'AC Repair', icon: '❄️' },
    { id: 2, name: 'Refrigeration', icon: '🧊' },
    { id: 3, name: 'Washing Machine', icon: '🧺' },
    { id: 4, name: 'Microwave', icon: '♨️' },
    { id: 5, name: 'Mixi Grinder', icon: '🥛' },
    { id: 6, name: 'Water Pump', icon: '💧' },
    { id: 7, name: 'Air Cooler', icon: '💨' },
    { id: 8, name: 'Induction Cooktop', icon: '🍳' },
    { id: 9, name: 'Stabilizer', icon: '🔌' },
    { id: 10, name: 'Press Iron', icon: '♨️' },
  ];

  // If selected service isn't in default list, add it dynamically
  const isCustomAppliance = bookingState.serviceId && !defaultServices.some(s => s.id === bookingState.serviceId);
  const services = isCustomAppliance 
    ? [{ id: bookingState.serviceId, name: bookingState.serviceName, icon: '🛠️' }, ...defaultServices]
    : defaultServices;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="bg-gray-100 text-gray-700 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm font-bold">1</span> 
          Select Appliance
        </h2>
        {bookingState.isApplianceLocked && (
          <button 
            onClick={unlockApplianceSelection}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            Change Appliance
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {services.map((service) => {
          const isSelected = bookingState.serviceId === service.id || (bookingState.serviceName && bookingState.serviceName.toLowerCase() === service.name.toLowerCase());
          const isDisabled = bookingState.isApplianceLocked && !isSelected;

          return (
            <button
              key={service.id}
              onClick={() => {
                if (!bookingState.isApplianceLocked) {
                  updateBooking('serviceId', service.id);
                  updateBooking('serviceName', service.name);
                }
              }}
              disabled={isDisabled}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm ring-2 ring-blue-500/20 font-bold' 
                  : isDisabled 
                    ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50 bg-white cursor-pointer'
              }`}
            >
              <span className="text-3xl mb-2">{service.icon}</span>
              <span className="text-xs text-center font-medium leading-tight">{service.name}</span>
            </button>
          );
        })}
      </div>

      {bookingState.isApplianceLocked && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
          <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>Pre-selected <strong>{bookingState.serviceName}</strong> from home page. Click 'Change Appliance' above to choose another service.</span>
        </div>
      )}
    </div>
  );
}