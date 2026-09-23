import { useState, useEffect, useCallback, useMemo } from 'react';

// Master default catalog of appliances, categories, base prices, and sub-services
export const DEFAULT_SERVICES_CATALOG = [
  {
    id: 1,
    catKey: 'ac_repair',
    name: 'AC Repair',
    category: 'Cooling',
    icon: '❄️',
    basePrice: 250,
    estimatedMax: 2499,
    description: 'Deep jet cleaning, compressor diagnostics, refrigerant gas refills, and cooling fault repairs.',
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
    ]
  },
  {
    id: 2,
    catKey: 'refrigerator',
    name: 'Refrigerator',
    category: 'Cooling',
    icon: '🧊',
    basePrice: 199,
    estimatedMax: 2999,
    description: 'Compressor relay, inverter PCB testing, door seal replacement, and defrost system servicing.',
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
    ]
  },
  {
    id: 3,
    catKey: 'washing_machine',
    name: 'Washing Machine',
    category: 'Cleaning',
    icon: '🧺',
    basePrice: 299,
    estimatedMax: 1899,
    description: 'Front & top load drain pump repairs, drum bearing noise fixes, motor belts, and descaling.',
    subServices: [
      { id: 'wm_checkup', label: 'Check up', price: 299 },
      { id: 'wm_jet_service', label: 'Jet Service (Starting from)', price: 499 },
      { id: 'wm_install', label: 'Installation', price: 299 },
    ]
  },
  {
    id: 4,
    catKey: 'microwave',
    name: 'Microwave',
    category: 'Kitchen',
    icon: '♨️',
    basePrice: 149,
    estimatedMax: 1200,
    description: 'Magnetron heating troubleshooting, high voltage capacitor testing, turntable motor replacement.',
    subServices: [
      { id: 'mw_checkup', label: 'Check up', price: 149 },
      { id: 'mw_repair', label: 'Heating & Magnetron Repair', price: 299 },
    ]
  },
  {
    id: 5,
    catKey: 'mixer_grinder',
    name: 'Mixer Grinder',
    category: 'Kitchen',
    icon: '🥛',
    basePrice: 99,
    estimatedMax: 450,
    description: 'Buss & coupler replacements, rotary speed switch changes, overload resets, and motor rewinding.',
    subServices: [
      { id: 'mixi_service', label: 'Service', price: 149 },
      { id: 'mixi_switch', label: 'Switch change', price: 149 },
      { id: 'mixi_overload', label: 'Overload switch change', price: 149 },
      { id: 'mixi_buss', label: 'Buss change', price: 199 },
      { id: 'mixi_wire', label: 'Wire change', price: 99 },
    ]
  },
  {
    id: 6,
    catKey: 'pump_motor',
    name: 'Pump Motor',
    category: 'Electrical',
    icon: '💧',
    basePrice: 249,
    estimatedMax: 1500,
    description: 'Submersible & monoblock priming, mechanical seal replacement, starting capacitor replacement.',
    subServices: [
      { id: 'pump_install', label: 'Installation', price: 349 },
      { id: 'pump_service', label: 'Servicing / change', price: 249 },
      { id: 'pump_leakage', label: 'Water leakage / slow flow', price: 249 },
    ]
  },
  {
    id: 7,
    catKey: 'air_cooler',
    name: 'Air Cooler',
    category: 'Cooling',
    icon: '💨',
    basePrice: 199,
    estimatedMax: 850,
    description: 'Honeycomb pad replacement, submersible water pump change, fan blade alignment, and motor repair.',
    subServices: [
      { id: 'cooler_checkup', label: 'Cooling & Airflow Checkup', price: 199 },
      { id: 'cooler_motor', label: 'Motor Repair / Service', price: 349 },
      { id: 'cooler_pump', label: 'Submersible Pump Change', price: 249 },
    ]
  },
  {
    id: 8,
    catKey: 'induction_cooktop',
    name: 'Induction Cooktop',
    category: 'Kitchen',
    icon: '🍳',
    basePrice: 199,
    estimatedMax: 900,
    description: 'IGBT transistor repair, crystal top glass replacement, cooling fan repair, error code clearing.',
    subServices: [
      { id: 'ind_power', label: 'Power failure diagnosis', price: 199 },
      { id: 'ind_glass', label: 'Glass replacement', price: 499 },
      { id: 'ind_coil', label: 'Coil replacement', price: 399 },
    ]
  },
  {
    id: 9,
    catKey: 'stabilizer',
    name: 'Stabilizer',
    category: 'Electrical',
    icon: '⚡',
    basePrice: 199,
    estimatedMax: 650,
    description: 'Relay replacement, voltage stabilization calibration, transformer testing, and circuit repair.',
    subServices: [
      { id: 'stab_checkup', label: 'Check up', price: 199 },
      { id: 'stab_repair', label: 'PCB / Relay Repair', price: 399 },
    ]
  },
  {
    id: 10,
    catKey: 'press_iron',
    name: 'Press Iron',
    category: 'Appliance',
    icon: '👔',
    basePrice: 79,
    estimatedMax: 350,
    description: 'Thermostat replacement, heating element changes, thermal fuse replacement, and cord wiring.',
    subServices: [
      { id: 'iron_checkup', label: 'Check up', price: 79 },
      { id: 'iron_element', label: 'Heating Element Repair', price: 149 },
    ]
  },
  {
    id: 11,
    catKey: 'tv',
    name: 'TV',
    category: 'Electronics',
    icon: '📺',
    basePrice: 199,
    estimatedMax: 3500,
    description: 'Backlight LED strip replacements, power supply board repairs, sound IC fixes, and wall mounting.',
    subServices: [
      { id: 'tv_checkup', label: 'Check up', price: 199 },
      { id: 'tv_display', label: 'Display Panel Repair', price: 999 },
      { id: 'tv_sound', label: 'Sound / Speaker Issue', price: 499 },
    ]
  },
  {
    id: 12,
    catKey: 'ceiling_fan',
    name: 'Ceiling Fan',
    category: 'Fans',
    icon: '🌀',
    basePrice: 149,
    estimatedMax: 450,
    description: 'Capacitor changes, bearing noise rectification, blade balancing, and downrod installation.',
    subServices: [
      { id: 'cf_checkup', label: 'Check up', price: 149 },
      { id: 'cf_bearing', label: 'Bearing change', price: 199 },
      { id: 'cf_capacitor', label: 'Capacitor change', price: 99 },
    ]
  },
  {
    id: 13,
    catKey: 'geyser',
    name: 'Geyser',
    category: 'Heating',
    icon: '🔥',
    basePrice: 399,
    estimatedMax: 1800,
    description: 'Thermostat replacement, copper heating element changes, anode rod descaling, and safety valves.',
    subServices: [
      { id: 'geyser_element', label: 'Heating element change', price: 499 },
      { id: 'geyser_thermo', label: 'Thermostat change', price: 399 },
      { id: 'geyser_install', label: 'Installation', price: 399 },
    ]
  },
  {
    id: 14,
    catKey: 'stand_fan',
    name: 'Stand Fan',
    category: 'Fans',
    icon: '🌬️',
    basePrice: 99,
    estimatedMax: 350,
    description: 'Blade alignment, oscillating gear replacement, speed selector repair, and motor servicing.',
    subServices: [
      { id: 'sf_checkup', label: 'Check up', price: 99 },
      { id: 'sf_service', label: 'Servicing & Oil greasing', price: 149 },
    ]
  },
  {
    id: 15,
    catKey: 'table_wall_fan',
    name: 'Table / Wall Fan',
    category: 'Fans',
    icon: '💨',
    basePrice: 99,
    estimatedMax: 350,
    description: 'Wall mounting, bush replacement, capacitor change, and safety grill repair.',
    subServices: [
      { id: 'tf_checkup', label: 'Check up', price: 99 },
      { id: 'tf_service', label: 'Servicing & Oil greasing', price: 149 },
    ]
  },
  {
    id: 16,
    catKey: 'wiring_switch_board',
    name: 'Wiring / Switch Board',
    category: 'Electrical',
    icon: '⚡',
    basePrice: 99,
    estimatedMax: 800,
    description: 'Modular switch replacements, MCB tripping troubleshooting, short circuit isolation, and rewiring.',
    subServices: [
      { id: 'elec_switch', label: 'Switch replacement', price: 99 },
      { id: 'elec_mcb', label: 'MCB change', price: 149 },
      { id: 'elec_short', label: 'Short circuit checking', price: 199 },
    ]
  }
];

export const MM_PRICING_EVENT = 'mm_pricing_updated';
export const MM_FUEL_EVENT = 'mm_fuel_rate_updated';

/**
 * Retrieves live service catalog from localStorage or defaults
 */
export function getLiveServicePricing() {
  if (typeof window === 'undefined') return DEFAULT_SERVICES_CATALOG;
  try {
    const raw = localStorage.getItem('mm_admin_service_pricing');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[PricingService] Error reading pricing from localStorage:', e);
  }
  return DEFAULT_SERVICES_CATALOG;
}

/**
 * Retrieves live per-km fuel reimbursement rate from localStorage or default (10)
 */
export function getLiveFuelRate() {
  if (typeof window === 'undefined') return 10;
  try {
    const raw = localStorage.getItem('mm_admin_fuel_rate_per_km');
    if (raw !== null && !isNaN(Number(raw))) {
      return Number(raw);
    }
  } catch (e) {
    console.error('[PricingService] Error reading fuel rate from localStorage:', e);
  }
  return 10;
}

/**
 * Saves updated service catalog and dispatches reactive events to all open components & tabs
 */
export function saveLiveServicePricing(updatedList) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('mm_admin_service_pricing', JSON.stringify(updatedList));
    // Dispatch in current window
    window.dispatchEvent(new CustomEvent(MM_PRICING_EVENT, { detail: { services: updatedList } }));
    // Dispatch across tabs
    window.dispatchEvent(new StorageEvent('storage', { key: 'mm_admin_service_pricing', newValue: JSON.stringify(updatedList) }));
  } catch (e) {
    console.error('[PricingService] Error saving pricing:', e);
  }
}

/**
 * Saves updated fuel rate and dispatches reactive events
 */
export function saveLiveFuelRate(rate) {
  if (typeof window === 'undefined') return;
  try {
    const numRate = Number(rate) || 10;
    localStorage.setItem('mm_admin_fuel_rate_per_km', String(numRate));
    window.dispatchEvent(new CustomEvent(MM_FUEL_EVENT, { detail: { fuelRate: numRate } }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'mm_admin_fuel_rate_per_km', newValue: String(numRate) }));
  } catch (e) {
    console.error('[PricingService] Error saving fuel rate:', e);
  }
}

/**
 * Builds live APPLIANCE_SUB_SERVICES object mapping { [id]: { id, name, icon, subServices } }
 */
export function getLiveApplianceSubServices() {
  const catalog = getLiveServicePricing();
  const result = {};

  catalog.forEach((item, index) => {
    const numericId = typeof item.id === 'number' ? item.id : (index + 1);
    result[numericId] = {
      id: numericId,
      name: item.name,
      icon: item.icon || '🔧',
      subServices: Array.isArray(item.subServices) ? item.subServices : []
    };
  });

  return result;
}

/**
 * Builds live APPLIANCE_PRICING object mapping { [id]: { basePrice, label } }
 */
export function getLiveAppliancePricing() {
  const catalog = getLiveServicePricing();
  const result = {};

  catalog.forEach((item, index) => {
    const numericId = typeof item.id === 'number' ? item.id : (index + 1);
    result[numericId] = {
      basePrice: Number(item.basePrice) || 199,
      label: item.name
    };
  });

  return result;
}

/**
 * Helper to get live base price for any appliance/service name
 */
export function getLiveBasePriceForAppliance(applianceName, fallback = 299) {
  if (!applianceName) return fallback;
  const name = String(applianceName).toLowerCase().trim();
  const catalog = getLiveServicePricing();
  const match = catalog.find(s => 
    s.name.toLowerCase() === name ||
    s.name.toLowerCase().includes(name) ||
    name.includes(s.name.toLowerCase())
  );
  if (match && typeof match.basePrice === 'number') {
    return match.basePrice;
  }
  return fallback;
}

/**
 * React Hook for automatic data updates anywhere in the UI.
 * When admin saves any pricing change, all components using this hook
 * automatically re-render with the new values — no page reload needed.
 */
export function useLivePricing() {
  const [services, setServices] = useState(getLiveServicePricing);
  const [fuelRate, setFuelRate] = useState(getLiveFuelRate);

  useEffect(() => {
    const handlePricingUpdate = () => {
      setServices(getLiveServicePricing());
    };

    const handleFuelUpdate = () => {
      setFuelRate(getLiveFuelRate());
    };

    const handleStorage = (e) => {
      if (!e.key || e.key === 'mm_admin_service_pricing') handlePricingUpdate();
      if (!e.key || e.key === 'mm_admin_fuel_rate_per_km') handleFuelUpdate();
    };

    window.addEventListener(MM_PRICING_EVENT, handlePricingUpdate);
    window.addEventListener(MM_FUEL_EVENT, handleFuelUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(MM_PRICING_EVENT, handlePricingUpdate);
      window.removeEventListener(MM_FUEL_EVENT, handleFuelUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Derived reactively from services state — auto-updates when admin changes pricing
  const applianceSubServices = useMemo(() => {
    const result = {};
    services.forEach((item, index) => {
      const numericId = typeof item.id === 'number' ? item.id : (index + 1);
      result[numericId] = {
        id: numericId,
        name: item.name,
        icon: item.icon || '🔧',
        subServices: Array.isArray(item.subServices) ? item.subServices : []
      };
    });
    return result;
  }, [services]);

  const appliancePricing = useMemo(() => {
    const result = {};
    services.forEach((item, index) => {
      const numericId = typeof item.id === 'number' ? item.id : (index + 1);
      result[numericId] = {
        basePrice: Number(item.basePrice) || 199,
        label: item.name
      };
    });
    return result;
  }, [services]);

  return {
    services,
    fuelRate,
    applianceSubServices,
    appliancePricing,
    saveServices: saveLiveServicePricing,
    saveFuel: saveLiveFuelRate
  };
}
