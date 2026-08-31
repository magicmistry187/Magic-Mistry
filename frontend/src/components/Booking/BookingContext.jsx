import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

// Per-appliance base service charges
export const APPLIANCE_PRICING = {
  1: { basePrice: 250, label: 'AC Repair' },
  2: { basePrice: 199, label: 'Refrigerator' },
  3: { basePrice: 299, label: 'Washing Machine' },
  4: { basePrice: 149, label: 'Microwave' },
  5: { basePrice: 99, label: 'Mixer Grinder' },
  6: { basePrice: 249, label: 'Pump Motor' },
  7: { basePrice: 199, label: 'Air Cooler' },
  8: { basePrice: 199, label: 'Induction Cooktop' },
  9: { basePrice: 199, label: 'Stabilizer' },
  10: { basePrice: 79, label: 'Press Iron' },
  11: { basePrice: 199, label: 'TV' },
  12: { basePrice: 149, label: 'Ceiling Fan' },
  13: { basePrice: 399, label: 'Geyser' },
  14: { basePrice: 99, label: 'Stand Fan' },
  15: { basePrice: 99, label: 'Table / Wall Fan' },
  16: { basePrice: 99, label: 'Wiring / Switch Board' },
};

// Main category sub-services with specific pricing (matching exact diagram flow)
export const APPLIANCE_SUB_SERVICES = {
  1: {
    id: 1,
    name: 'AC Repair',
    icon: '❄️',
    subServices: [
      { id: 'ac_1_form', label: '1 AC - form - Jet AC Service', price: 499 },
      { id: 'ac_2_form', label: '2 AC - form - Jet AC Service', price: 899 },
      { id: 'ac_3_form', label: '3 AC - form - Jet AC Service', price: 1299 },
      { id: 'ac_5_form', label: '5 AC - form - Jet AC Service', price: 1999 },
      { id: 'ac_less_cooling', label: 'Less/No cooling', price: 250 },
      { id: 'ac_power_issue', label: 'Power issue', price: 250 },
      { id: 'ac_water_leakage', label: 'Water leakage', price: 499 },
      { id: 'ac_noise_smell', label: 'Unwanted Noise/Smell', price: 499 },
      { id: 'ac_gas_refill', label: 'AC Gas Refill', price: 2499 },
      { id: 'ac_install', label: 'AC Installation', price: 999 },
      { id: 'ac_uninstall', label: 'AC Uninstallation', price: 599 },
      { id: 'ac_any_mini', label: 'Any issue (Minimum Charge)', price: 250 },
    ],
  },
  2: {
    id: 2,
    name: 'Refrigerator',
    icon: '🧊',
    subServices: [
      { id: 'ref_power_issue', label: 'Power issue', price: 199 },
      { id: 'ref_power_cord', label: 'Power cord', price: 299 },
      { id: 'ref_repair_inv_pcb', label: 'Repair inverter PCB', price: 1499 },
      { id: 'ref_replace_inv_pcb', label: 'Replace inverter PCB', price: 2999 },
      { id: 'ref_repair_pcb', label: 'Repair PCB', price: 1099 },
      { id: 'ref_damaged_door', label: 'Damaged door repair', price: 799 },
      { id: 'ref_thermostat', label: 'Thermostat', price: 649 },
      { id: 'ref_door_gasket', label: 'Door gasket with magnet', price: 949 },
      { id: 'ref_defrost_sensor', label: 'Defrost Sensor', price: 449 },
    ],
  },
  3: {
    id: 3,
    name: 'Washing Machine',
    icon: '🧺',
    subServices: [
      { id: 'wm_checkup', label: 'Check up', price: 299 },
      { id: 'wm_jet_service', label: 'Jet Service (Starting from)', price: 499 },
      { id: 'wm_install', label: 'Installation', price: 299 },
    ],
  },
  4: {
    id: 4,
    name: 'Microwave',
    icon: '♨️',
    subServices: [
      { id: 'mw_checkup', label: 'Check up', price: 149 },
      { id: 'mw_repair', label: 'Heating & Magnetron Repair', price: 299 },
    ],
  },
  5: {
    id: 5,
    name: 'Mixer Grinder',
    icon: '🥛',
    subServices: [
      { id: 'mixi_service', label: 'Service', price: 149 },
      { id: 'mixi_switch', label: 'Switch change', price: 149 },
      { id: 'mixi_overload', label: 'Overload switch change', price: 149 },
      { id: 'mixi_buss', label: 'Buss change', price: 199 },
      { id: 'mixi_wire', label: 'Wire change', price: 99 },
    ],
  },
  6: {
    id: 6,
    name: 'Pump Motor',
    icon: '💧',
    subServices: [
      { id: 'pump_install', label: 'Installation', price: 349 },
      { id: 'pump_service', label: 'Servicing / change', price: 249 },
      { id: 'pump_leakage', label: 'Water leakage / slow flow', price: 249 },
    ],
  },
  7: {
    id: 7,
    name: 'Air Cooler',
    icon: '🌀',
    subServices: [
      { id: 'cooler_checkup', label: 'Check up', price: 199 },
      { id: 'cooler_motor', label: 'Motor replacement', price: 499 },
      { id: 'cooler_pump', label: 'Submersible pump change', price: 299 },
    ],
  },
  8: {
    id: 8,
    name: 'Induction Cooktop',
    icon: '🍳',
    subServices: [
      { id: 'ind_checkup', label: 'Check up', price: 199 },
      { id: 'ind_coil', label: 'Heating coil repair', price: 399 },
    ],
  },
  9: {
    id: 9,
    name: 'Stabilizer',
    icon: '⚡',
    subServices: [
      { id: 'stab_checkup', label: 'Check up', price: 199 },
      { id: 'stab_repair', label: 'PCB / Relay Repair', price: 399 },
    ],
  },
  10: {
    id: 10,
    name: 'Press Iron',
    icon: '👔',
    subServices: [
      { id: 'iron_checkup', label: 'Check up', price: 79 },
      { id: 'iron_element', label: 'Heating Element Repair', price: 149 },
    ],
  },
  11: {
    id: 11,
    name: 'TV',
    icon: '📺',
    subServices: [
      { id: 'tv_checkup', label: 'Check up', price: 199 },
      { id: 'tv_display', label: 'Display Panel Repair', price: 999 },
      { id: 'tv_sound', label: 'Sound / Speaker Issue', price: 499 },
    ],
  },
  12: {
    id: 12,
    name: 'Ceiling Fan',
    icon: '💨',
    subServices: [
      { id: 'fan_checkup', label: 'Check up', price: 149 },
      { id: 'fan_winding', label: 'Motor Rewinding', price: 349 },
      { id: 'fan_capacitor', label: 'Capacitor Change', price: 199 },
    ],
  },
  13: {
    id: 13,
    name: 'Geyser',
    icon: '♨️',
    subServices: [
      { id: 'geyser_checkup', label: 'Check up', price: 199 },
      { id: 'geyser_element', label: 'Heating Element Change', price: 599 },
      { id: 'geyser_thermostat', label: 'Thermostat Replacement', price: 449 },
    ],
  },
  14: {
    id: 14,
    name: 'Stand Fan',
    icon: '💨',
    subServices: [
      { id: 'sfan_checkup', label: 'Check up', price: 99 },
      { id: 'sfan_motor', label: 'Motor Repair', price: 249 },
    ],
  },
  15: {
    id: 15,
    name: 'Table / Wall Fan',
    icon: '💨',
    subServices: [
      { id: 'tfan_checkup', label: 'Check up', price: 99 },
      { id: 'tfan_motor', label: 'Motor Repair', price: 249 },
    ],
  },
  16: {
    id: 16,
    name: 'Wiring / Switch Board',
    icon: '🔌',
    subServices: [
      { id: 'wiring_problem', label: 'Switch Board problem', price: 149 },
      { id: 'wiring_10_switch', label: '10 Switch Board increase the amount', price: 299 },
      { id: 'wiring_change', label: 'Switch change', price: 99 },
      { id: 'wiring_ext_clips', label: 'External with clips (5m per)', price: 100 },
      { id: 'wiring_ext_casing', label: 'External with casing (5m per)', price: 200 },
      { id: 'wiring_internal', label: 'Internal (5m per)', price: 250 },
      { id: 'wiring_old_mini', label: 'Old wirings mini change', price: 249 },
    ],
  },
};

export const scrollToNextStep = (targetId) => {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -90; // account for sticky navbar offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 150);
};

const DEFAULT_BASE_PRICE = 299;

export const BookingProvider = ({ children, initialAppliance = null }) => {
  const getBasePrice = (id) =>
    APPLIANCE_PRICING[id]?.basePrice ?? DEFAULT_BASE_PRICE;

  const storedLoc = typeof window !== 'undefined' ? localStorage.getItem('mm_location') : null;
  const savedLocation = storedLoc && storedLoc !== 'Set Your Location' ? storedLoc : '';

  // Only pre-fill if user came from home page with an appliance selected
  const hasInitialAppliance = Boolean(initialAppliance && initialAppliance.id);
  const initialCatId = hasInitialAppliance ? initialAppliance.id : null;

  const [bookingState, setBookingState] = useState({
    serviceId: initialCatId,                                          // null when no appliance from home
    serviceName: initialAppliance?.name || '',                        // empty when no appliance from home
    selectedSubServices: [],                                          // array of { label, price }
    isApplianceLocked: hasInitialAppliance,
    problemDescription: '',
    date: '',
    timeSlot: '',
    address: savedLocation,
    latitude: null,
    longitude: null,
    paymentMethod: 'cash',
    images: [],
    imageFile: null,
    priceInfo: {
      basePrice: 0,
      visitCharge: 0,
      total: 0,
    },
  });

  useEffect(() => {
    if (initialAppliance) {
      setBookingState((prev) => ({
        ...prev,
        serviceId: initialAppliance.id,
        serviceName: initialAppliance.name,
        isApplianceLocked: true,
        selectedSubServices: [],
        priceInfo: { basePrice: 0, visitCharge: 0, total: 0 },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppliance]);

  const updateBooking = (key, value) => {
    setBookingState((prev) => {
      const next = { ...prev, [key]: value };

      if (key === 'serviceId') {
        next.selectedSubServices = [];
        next.priceInfo = { basePrice: 0, visitCharge: 0, total: 0 };
      }

      if (key === 'selectedSubServices') {
        const total = value.reduce((sum, sub) => sum + sub.price, 0);
        next.priceInfo = { basePrice: total, visitCharge: 0, total: total };
      }

      return next;
    });
  };

  const unlockApplianceSelection = () => {
    setBookingState((prev) => ({ ...prev, isApplianceLocked: false }));
  };

  return (
    <BookingContext.Provider
      value={{ bookingState, updateBooking, unlockApplianceSelection, scrollToNextStep }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
