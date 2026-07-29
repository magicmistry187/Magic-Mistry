import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

// Per-appliance base service charges
export const APPLIANCE_PRICING = {
  1: { basePrice: 349, label: 'AC Repair' },
  2: { basePrice: 299, label: 'Refrigeration' },
  3: { basePrice: 279, label: 'Washing Machine' },
  4: { basePrice: 199, label: 'Microwave' },
  5: { basePrice: 149, label: 'Mixi Grinder' },
  6: { basePrice: 199, label: 'Water Pump' },
  7: { basePrice: 199, label: 'Air Cooler' },
  8: { basePrice: 179, label: 'Induction Cooktop' },
  9: { basePrice: 149, label: 'Stabilizer' },
  10: { basePrice: 99, label: 'Press Iron' },
};

// Main category sub-services with specific pricing (matching exact diagram flow)
export const APPLIANCE_SUB_SERVICES = {
  1: {
    id: 1,
    name: 'AC Repair',
    icon: '❄️',
    subServices: [
      { id: 'ac_checkup', label: 'AC Check up & Service', price: 299 },
      { id: 'ac_deep_clean', label: 'Split AC Deep Cleaning', price: 499 },
      { id: 'ac_install', label: 'AC Installation', price: 799 },
      { id: 'ac_uninstall', label: 'AC Uninstallation', price: 499 },
      { id: 'ac_gas', label: 'Gas Top-up & Leak Repair', price: 1499 },
    ],
  },
  2: {
    id: 2,
    name: 'Refrigeration',
    icon: '🧊',
    subServices: [
      { id: 'fridge_checkup', label: 'Check up & Inspection', price: 199 },
      { id: 'fridge_single_door', label: 'Single Door Repair', price: 299 },
      { id: 'fridge_double_door', label: 'Double Door Service', price: 399 },
      { id: 'fridge_gas', label: 'Gas Charging', price: 1199 },
    ],
  },
  3: {
    id: 3,
    name: 'Washing Machine',
    icon: '🧺',
    subServices: [
      { id: 'wm_checkup', label: 'Check up & Service', price: 199 },
      { id: 'wm_repair', label: 'Repair Service', price: 279 },
      { id: 'wm_install', label: 'Installation / Uninstallation', price: 299 },
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
    name: 'Mixi Grinder',
    icon: '🥛',
    subServices: [
      { id: 'mixi_checkup', label: 'Check up & Servicing', price: 99 },
      { id: 'mixi_motor', label: 'Motor & Coupler Repair', price: 149 },
    ],
  },
  6: {
    id: 6,
    name: 'Water Pump',
    icon: '💧',
    subServices: [
      { id: 'pump_checkup', label: 'Pump Check up', price: 149 },
      { id: 'pump_repair', label: 'Motor & Capacitor Repair', price: 249 },
    ],
  },
  7: {
    id: 7,
    name: 'Air Cooler',
    icon: '💨',
    subServices: [
      { id: 'cooler_mini', label: 'Air Cooler Service - Mini', price: 299 },
      { id: 'cooler_max', label: 'Air Cooler Service - Max', price: 499 },
      { id: 'cooler_checkup', label: 'Check up', price: 200 },
      { id: 'cooler_any_mini', label: 'Any Problem Mini - Charge', price: 199 },
    ],
  },
  8: {
    id: 8,
    name: 'Induction Cooktop',
    icon: '🍳',
    subServices: [
      { id: 'induction_checkup', label: 'Check up', price: 129 },
      { id: 'induction_board', label: 'PCB Board Repair', price: 249 },
    ],
  },
  9: {
    id: 9,
    name: 'Stabilizer',
    icon: '🔌',
    subServices: [
      { id: 'stab_checkup', label: 'Check up', price: 99 },
      { id: 'stab_relay', label: 'Relay & Transformer Repair', price: 179 },
    ],
  },
  10: {
    id: 10,
    name: 'Press Iron',
    icon: '👔',
    subServices: [
      { id: 'iron_checkup', label: 'Check up', price: 79 },
      { id: 'iron_coil', label: 'Coil & Element Change', price: 129 },
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
      { id: 'tv_min_charge', label: 'Minimum Charge', price: 199 },
    ],
  },
  12: {
    id: 12,
    name: 'Fan',
    icon: '🌀',
    subServices: [
      { id: 'fan_install', label: 'Installation', price: 149 },
      { id: 'fan_repair', label: 'Repair', price: 199 },
      { id: 'fan_uninstall', label: 'Uninstallation', price: 149 },
      { id: 'fan_capacitor', label: 'Capacitor Change', price: 149 },
      { id: 'fan_any_mini', label: 'Any Problem Mini', price: 149 },
    ],
  },
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
