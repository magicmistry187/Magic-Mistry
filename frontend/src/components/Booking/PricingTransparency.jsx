import React, { useState } from 'react';
import { useBooking } from './BookingContext';
import { ChevronDown, ChevronUp, Info, Wrench, Package, ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * PricingTransparency
 * ───────────────────
 * Shows the user exactly how the final bill is calculated:
 *  1. Fixed service / visit charge (per appliance)
 *  2. Additional part / component charges – explained BEFORE booking
 */
export default function PricingTransparency() {
  const { bookingState } = useBooking();
  const [open, setOpen] = useState(false);

  const basePrice = bookingState.priceInfo.basePrice;
  const serviceName = bookingState.serviceName || 'the selected appliance';

  // Sample parts pricing for common appliances – purely informational
  const sampleParts = {
    'AC Repair':          [{ name: 'Capacitor',           range: '₹300 – ₹900' }, { name: 'Gas Refill (R22/R32)', range: '₹800 – ₹2,500' }, { name: 'Thermostat', range: '₹400 – ₹1,200' }],
    'Refrigeration':      [{ name: 'Compressor',          range: '₹2,000 – ₹5,000' }, { name: 'Thermostat', range: '₹300 – ₹800' }, { name: 'Door Gasket', range: '₹200 – ₹600' }],
    'Washing Machine':    [{ name: 'Motor / Belt',        range: '₹500 – ₹1,800' }, { name: 'Inlet Valve', range: '₹200 – ₹600' }, { name: 'PCB Board', range: '₹800 – ₹2,500' }],
    'Microwave':          [{ name: 'Magnetron',           range: '₹800 – ₹2,000' }, { name: 'Turntable Motor', range: '₹150 – ₹400' }, { name: 'Door Switch', range: '₹100 – ₹300' }],
    'Mixi Grinder':       [{ name: 'Coupler / Carbon Brush', range: '₹80 – ₹250' }, { name: 'Motor Coil', range: '₹200 – ₹600' }, { name: 'Speed Switch', range: '₹100 – ₹300' }],
    'Water Pump':         [{ name: 'Capacitor',           range: '₹150 – ₹500' }, { name: 'Impeller', range: '₹300 – ₹900' }, { name: 'Pressure Switch', range: '₹200 – ₹700' }],
    'Air Cooler':         [{ name: 'Pump Motor',          range: '₹200 – ₹700' }, { name: 'Cooling Pad', range: '₹150 – ₹500' }, { name: 'Fan Blade', range: '₹100 – ₹350' }],
    'Induction Cooktop':  [{ name: 'IGBT / PCB',         range: '₹400 – ₹1,200' }, { name: 'Temperature Sensor', range: '₹150 – ₹400' }, { name: 'Fan Motor', range: '₹200 – ₹600' }],
    'Stabilizer':         [{ name: 'Relay',               range: '₹100 – ₹350' }, { name: 'Transformer Coil', range: '₹300 – ₹900' }, { name: 'PCB Board', range: '₹400 – ₹1,000' }],
    'Press Iron':         [{ name: 'Thermostat',          range: '₹80 – ₹200' }, { name: 'Heating Element', range: '₹120 – ₹350' }, { name: 'Cord / Cable', range: '₹80 – ₹200' }],
  };

  const parts = sampleParts[serviceName] || [];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Header – clickable to expand/collapse */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Info className="w-4 h-4 text-white" />
          </span>
          <div>
            <p className="font-bold text-amber-900 text-sm sm:text-base leading-tight">
              💡 How Charges Work — Know Before You Book
            </p>
            <p className="text-xs text-amber-700 mt-0.5 hidden sm:block">
              Transparent pricing so you're never surprised.
            </p>
          </div>
        </div>
        <span className="text-amber-600 group-hover:text-amber-800 transition-colors flex-shrink-0 ml-2">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-amber-200/60">

          {/* Step 1 – Service / Visit Charge */}
          <div className="flex gap-3 mt-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                Service Charge (Fixed) —&nbsp;
                <span className="text-blue-700 font-bold">₹{basePrice}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This is the <strong>fixed inspection &amp; labour charge</strong> for{' '}
                <span className="font-medium text-slate-700">{serviceName}</span>. It covers the
                technician's visit and basic repair work. This amount is charged regardless of the
                outcome.
              </p>
            </div>
          </div>

          {/* Step 2 – Component / Part Charges */}
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 text-sm">
                Additional Part / Component Charges
                <span className="ml-2 text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  If Applicable
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                If the technician finds a <strong>faulty component</strong> that needs replacement
                (e.g., a capacitor, motor, or PCB board), the cost of the <strong>spare part</strong>{' '}
                will be added to your bill. The technician will show you the part and confirm the price{' '}
                <strong>before replacing anything</strong>.
              </p>

              {/* Sample parts for the chosen appliance */}
              {parts.length > 0 && (
                <div className="mt-3 rounded-lg border border-orange-200 overflow-hidden bg-white">
                  <div className="bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-800 uppercase tracking-wide">
                    Common Parts — {serviceName}
                  </div>
                  <div className="divide-y divide-orange-100">
                    {parts.map((part) => (
                      <div key={part.name} className="flex justify-between items-center px-3 py-2">
                        <span className="text-xs text-slate-700">{part.name}</span>
                        <span className="text-xs font-semibold text-slate-800">{part.range}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 px-3 py-2 italic">
                    * Prices are estimates. Final cost depends on brand &amp; availability.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Guarantee note */}
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Your Protection</p>
              <ul className="text-xs text-slate-500 mt-1 space-y-1 leading-relaxed list-none">
                <li>✅ Technician will <strong>inform you before replacing</strong> any part.</li>
                <li>✅ You can <strong>decline</strong> any additional part replacement.</li>
                <li>✅ Only the <strong>fixed service charge ₹{basePrice}</strong> applies if no parts are replaced.</li>
                <li>✅ Replaced parts carry a <strong>30-day warranty</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex gap-2 bg-amber-100 border border-amber-300 rounded-lg p-3 mt-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Pay After Service.</strong> No advance payment required. You pay only after the
              technician completes the job and you're satisfied — via <strong>Cash or UPI</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
