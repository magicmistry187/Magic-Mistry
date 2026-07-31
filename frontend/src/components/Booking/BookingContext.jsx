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
    icon: '💨',
    subServices: [
      { id: 'cooler_service', label: 'Service (Starting from)', price: 299 },
      { id: 'cooler_checkup', label: 'Check up', price: 200 },
      { id: 'cooler_mini', label: 'Any problem mini charge', price: 199 },
      { id: 'cooler_buss_big', label: 'Soft buss change (Big)', price: 599 },
      { id: 'cooler_buss_small', label: 'Soft buss change (Small)', price: 499 },
      { id: 'cooler_switch', label: 'Switch change', price: 199 },
    ],
  },
  8: {
    id: 8,
    name: 'Induction Cooktop',
    icon: '🍳',
    subServices: [
      { id: 'induction_service', label: 'Service', price: 199 },
      { id: 'induction_fan', label: 'Fan change', price: 199 },
      { id: 'induction_mosfet', label: 'Mosfet change', price: 399 },
      { id: 'induction_other', label: 'Other items change mini', price: 199 },
    ],
  },
  9: {
    id: 9,
    name: 'Stabilizer',
    icon: '🔌',
    subServices: [
      { id: 'stab_fuse', label: 'Fuse socket change', price: 199 },
      { id: 'stab_cable', label: 'Cable change', price: 199 },
      { id: 'stab_board', label: 'Board kit change', price: 249 },
      { id: 'stab_switch', label: 'Rotary switch change', price: 299 },
      { id: 'stab_relay', label: 'Relay change', price: 399 },
    ],
  },
  10: {
    id: 10,
    name: 'Press Iron',
    icon: '👔',
    subServices: [
      { id: 'iron_power', label: 'Power issue Any', price: 79 },
      { id: 'iron_switch', label: 'Switch change', price: 199 },
      { id: 'iron_cable', label: 'Cable change', price: 79 },
      { id: 'iron_coil', label: 'Coil change', price: 199 },
    ],
  },
  11: {
    id: 11,
    name: 'TV',
    icon: '📺',
    subServices: [
      { id: 'tv_checkup', label: 'Check up', price: 199 },
      { id: 'tv_install', label: 'Installation', price: 299 },
      { id: 'tv_uninstall', label: 'Uninstallation', price: 249 },
      { id: 'tv_min', label: 'Minimum charge', price: 199 },
    ],
  },
  12: {
    id: 12,
    name: 'Ceiling Fan / Fan Repair',
    icon: '🌀',
    subServices: [
      { id: 'fan_install', label: 'Installation', price: 149 },
      { id: 'fan_repair', label: 'Repair', price: 199 },
      { id: 'fan_uninstall', label: 'Uninstallation', price: 149 },
      { id: 'fan_capacitor', label: 'Capacitor charge', price: 149 },
      { id: 'fan_any_mini', label: 'Any problem mini', price: 149 },
      { id: 'fan_bearings', label: 'Bearings change', price: 99 },
      { id: 'fan_coil_c', label: 'Coil change (Copper)', price: 449 },
      { id: 'fan_coil_al', label: 'Coil change (Aluminum)', price: 349 },
    ],
  },
  13: {
    id: 13,
    name: 'Geyser',
    icon: '🚿',
    subServices: [
      { id: 'geyser_service', label: 'Servicing', price: 499 },
      { id: 'geyser_install', label: 'Installation', price: 399 },
      { id: 'geyser_checkup', label: 'Check-up power issue', price: 799 },
    ],
  },
  14: {
    id: 14,
    name: 'Stand Fan',
    icon: '🌬️',
    subServices: [
      { id: 'stand_fan_service', label: 'Service', price: 149 },
      { id: 'stand_fan_wire', label: 'Wire cable change', price: 99 },
      { id: 'stand_fan_soft_bus', label: 'Soft bus change - farata', price: 499 },
      { id: 'stand_fan_plastic', label: 'Plastic china', price: 249 },
      { id: 'stand_fan_coil_farata', label: 'Farata Coil Change', price: 759 },
      { id: 'stand_fan_coil_china', label: 'Plastic china Coil change', price: 549 },
      { id: 'stand_fan_coil_china_al', label: 'Plastic china Coil change (Al)', price: 449 },
      { id: 'stand_fan_switch', label: 'Switch change', price: 149 },
    ],
  },
  15: {
    id: 15,
    name: 'Table Fan / Wall Fan',
    icon: '🎐',
    subServices: [
      { id: 'table_fan_service', label: 'Service', price: 129 },
      { id: 'table_fan_wire', label: 'Wire cable change', price: 99 },
      { id: 'table_fan_switch', label: 'Switch change', price: 149 },
      { id: 'table_fan_soft_bus', label: 'Soft buss change', price: 249 },
      { id: 'table_fan_coil_c', label: 'Coil change (Copper)', price: 499 },
      { id: 'table_fan_coil_al', label: 'Coil change (Aluminum)', price: 349 },
    ],
  },
  16: {
    id: 16,
    name: 'Wiring / Switch Board',
    icon: '⚡',
    subServices: [
      { id: 'wiring_replace', label: 'Switch Board Replace (mini)', price: 199 },
      { id: 'wiring_problem', label: 'Switch Board problem', price: 149 },
      { id: 'wiring_10_switch', label: '10 Switch Board increase the amount', price: 299 },
      { id: 'wiring_change', label: 'Switch change', price: 99 },
      { id: 'wiring_ext_clips', label: 'External with clips (5m per)', price: 100 },
      { id: 'wiring_ext_casing', label: 'External with casing (5m per)', price: 200 },
      { id: 'wiring_internal', label: 'Internal (5m per)', price: 250 },
      { id: 'wiring_old_mini', label: 'Old wirings mini change', price: 249 },
    ],
  }
};

const DEFAULT_BASE_PRICE = 299;

export const BookingProvider = ({ children, initialAppliance }) => {
  const getBasePrice = (id) =>
    APPLIANCE_PRICING[id]?.basePrice ?? DEFAULT_BASE_PRICE;

  const savedLocation =
    typeof window !== 'undefined'
      ? localStorage.getItem('mm_location') || ''
      : '';

  // Only pre-fill if user came from home page with an appliance selected
  const hasInitialAppliance = !!initialAppliance;
  const initialCatId = initialAppliance?.id || null;
  const initialSubServices = initialCatId ? (APPLIANCE_SUB_SERVICES[initialCatId]?.subServices || []) : [];
  const defaultSubService = initialSubServices[0] || null;
  const initialPrice = defaultSubService?.price || (hasInitialAppliance ? getBasePrice(initialAppliance.id) : 0);

  const [bookingState, setBookingState] = useState({
    serviceId: initialCatId,                                          // null when no appliance from home
    serviceName: initialAppliance?.name || '',                        // empty when no appliance from home
    selectedSubService: defaultSubService ? defaultSubService.label : '', // empty when no appliance from home
    isApplianceLocked: hasInitialAppliance,
    problemDescription: '',
    date: '',
    timeSlot: '',
    address: savedLocation,
    paymentMethod: 'cash',
    images: [],
    imageFile: null,
    priceInfo: {
      basePrice: initialPrice,
      visitCharge: 0,
      total: initialPrice,
    },
  });

  useEffect(() => {
    if (initialAppliance) {
      const base = getBasePrice(initialAppliance.id);
      setBookingState((prev) => ({
        ...prev,
        serviceId: initialAppliance.id,
        serviceName: initialAppliance.name,
        isApplianceLocked: true,
        priceInfo: { basePrice: base, visitCharge: 0, total: base },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppliance]);

  const updateBooking = (key, value) => {
    setBookingState((prev) => {
      const next = { ...prev, [key]: value };

      // When the appliance changes, recalculate pricing
      if (key === 'serviceId') {
        const base = getBasePrice(value);
        next.priceInfo = { basePrice: base, visitCharge: 0, total: base };
      }

      return next;
    });
  };

  const unlockApplianceSelection = () => {
    setBookingState((prev) => ({ ...prev, isApplianceLocked: false }));
  };

  return (
    <BookingContext.Provider
      value={{ bookingState, updateBooking, unlockApplianceSelection }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
