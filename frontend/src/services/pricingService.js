import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiConnector, BASE_URL } from './apiConnector';

// Master default catalog of appliances, categories, base prices, and sub-services
// Each category and sub-service has an isActive flag (default: true).
// When isActive is set to false, it is hidden from regular users but preserved in database.
export const DEFAULT_SERVICES_CATALOG = [
  {
    id: 1,
    catKey: 'ac_repair',
    name: 'AC Repair',
    category: 'Cooling',
    icon: '❄️',
    basePrice: 250,
    estimatedMax: 2499,
    isActive: true,
    description: 'Deep jet cleaning, compressor diagnostics, refrigerant gas refills, and cooling fault repairs.',
    subServices: [
      { id: 'ac_1_form', label: '1 AC - form - Jet AC Service', price: 499, isActive: true },
      { id: 'ac_2_form', label: '2 AC - form - Jet AC Service', price: 899, isActive: true },
      { id: 'ac_3_form', label: '3 AC - form - Jet AC Service', price: 1299, isActive: true },
      { id: 'ac_5_form', label: '5 AC - form - Jet AC Service', price: 1999, isActive: true },
      { id: 'ac_less_cooling', label: 'Less/No cooling', price: 250, isActive: true },
      { id: 'ac_power_issue', label: 'Power issue', price: 250, isActive: true },
      { id: 'ac_water_leakage', label: 'Water leakage', price: 499, isActive: true },
      { id: 'ac_noise_smell', label: 'Unwanted Noise/Smell', price: 499, isActive: true },
      { id: 'ac_gas_refill', label: 'AC Gas Refill', price: 2499, isActive: true },
      { id: 'ac_install', label: 'AC Installation', price: 999, isActive: true },
      { id: 'ac_uninstall', label: 'AC Uninstallation', price: 599, isActive: true },
      { id: 'ac_any_mini', label: 'Any issue (Minimum Charge)', price: 250, isActive: true },
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
    isActive: true,
    description: 'Compressor relay, inverter PCB testing, door seal replacement, and defrost system servicing.',
    subServices: [
      { id: 'ref_power_issue', label: 'Power issue', price: 199, isActive: true },
      { id: 'ref_power_cord', label: 'Power cord', price: 299, isActive: true },
      { id: 'ref_repair_inv_pcb', label: 'Repair inverter PCB', price: 1499, isActive: true },
      { id: 'ref_replace_inv_pcb', label: 'Replace inverter PCB', price: 2999, isActive: true },
      { id: 'ref_repair_pcb', label: 'Repair PCB', price: 1099, isActive: true },
      { id: 'ref_damaged_door', label: 'Damaged door repair', price: 799, isActive: true },
      { id: 'ref_thermostat', label: 'Thermostat', price: 649, isActive: true },
      { id: 'ref_door_gasket', label: 'Door gasket with magnet', price: 949, isActive: true },
      { id: 'ref_defrost_sensor', label: 'Defrost Sensor', price: 449, isActive: true },
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
    isActive: true,
    description: 'Front & top load drain pump repairs, drum bearing noise fixes, motor belts, and descaling.',
    subServices: [
      { id: 'wm_checkup', label: 'Check up', price: 299, isActive: true },
      { id: 'wm_jet_service', label: 'Jet Service (Starting from)', price: 499, isActive: true },
      { id: 'wm_install', label: 'Installation', price: 299, isActive: true },
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
    isActive: true,
    description: 'Magnetron heating troubleshooting, high voltage capacitor testing, turntable motor replacement.',
    subServices: [
      { id: 'mw_checkup', label: 'Check up', price: 149, isActive: true },
      { id: 'mw_repair', label: 'Heating & Magnetron Repair', price: 299, isActive: true },
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
    isActive: true,
    description: 'Buss & coupler replacements, rotary speed switch changes, overload resets, and motor rewinding.',
    subServices: [
      { id: 'mixi_service', label: 'Service', price: 149, isActive: true },
      { id: 'mixi_switch', label: 'Switch change', price: 149, isActive: true },
      { id: 'mixi_overload', label: 'Overload switch change', price: 149, isActive: true },
      { id: 'mixi_buss', label: 'Buss change', price: 199, isActive: true },
      { id: 'mixi_wire', label: 'Wire change', price: 99, isActive: true },
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
    isActive: true,
    description: 'Submersible & monoblock priming, mechanical seal replacement, starting capacitor replacement.',
    subServices: [
      { id: 'pump_install', label: 'Installation', price: 349, isActive: true },
      { id: 'pump_service', label: 'Servicing / change', price: 249, isActive: true },
      { id: 'pump_leakage', label: 'Water leakage / slow flow', price: 249, isActive: true },
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
    isActive: true,
    description: 'Honeycomb pad replacement, submersible water pump change, fan blade alignment, and motor repair.',
    subServices: [
      { id: 'cooler_checkup', label: 'Cooling & Airflow Checkup', price: 199, isActive: true },
      { id: 'cooler_motor', label: 'Motor Repair / Service', price: 349, isActive: true },
      { id: 'cooler_pump', label: 'Submersible Pump Change', price: 249, isActive: true },
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
    isActive: true,
    description: 'IGBT transistor repair, crystal top glass replacement, cooling fan repair, error code clearing.',
    subServices: [
      { id: 'ind_power', label: 'Power failure diagnosis', price: 199, isActive: true },
      { id: 'ind_glass', label: 'Glass replacement', price: 499, isActive: true },
      { id: 'ind_coil', label: 'Coil replacement', price: 399, isActive: true },
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
    isActive: true,
    description: 'Relay replacement, voltage stabilization calibration, transformer testing, and circuit repair.',
    subServices: [
      { id: 'stab_checkup', label: 'Check up', price: 199, isActive: true },
      { id: 'stab_repair', label: 'PCB / Relay Repair', price: 399, isActive: true },
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
    isActive: true,
    description: 'Thermostat replacement, heating element changes, thermal fuse replacement, and cord wiring.',
    subServices: [
      { id: 'iron_checkup', label: 'Check up', price: 79, isActive: true },
      { id: 'iron_element', label: 'Heating Element Repair', price: 149, isActive: true },
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
    isActive: true,
    description: 'Backlight LED strip replacements, power supply board repairs, sound IC fixes, and wall mounting.',
    subServices: [
      { id: 'tv_checkup', label: 'Check up', price: 199, isActive: true },
      { id: 'tv_display', label: 'Display Panel Repair', price: 999, isActive: true },
      { id: 'tv_sound', label: 'Sound / Speaker Issue', price: 499, isActive: true },
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
    isActive: true,
    description: 'Capacitor changes, bearing noise rectification, blade balancing, and downrod installation.',
    subServices: [
      { id: 'cf_checkup', label: 'Check up', price: 149, isActive: true },
      { id: 'cf_bearing', label: 'Bearing change', price: 199, isActive: true },
      { id: 'cf_capacitor', label: 'Capacitor change', price: 99, isActive: true },
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
    isActive: true,
    description: 'Thermostat replacement, copper heating element changes, anode rod descaling, and safety valves.',
    subServices: [
      { id: 'geyser_element', label: 'Heating element change', price: 499, isActive: true },
      { id: 'geyser_thermo', label: 'Thermostat change', price: 399, isActive: true },
      { id: 'geyser_install', label: 'Installation', price: 399, isActive: true },
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
    isActive: true,
    description: 'Blade alignment, oscillating gear replacement, speed selector repair, and motor servicing.',
    subServices: [
      { id: 'sf_checkup', label: 'Check up', price: 99, isActive: true },
      { id: 'sf_service', label: 'Servicing & Oil greasing', price: 149, isActive: true },
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
    isActive: true,
    description: 'Wall mounting, bush replacement, capacitor change, and safety grill repair.',
    subServices: [
      { id: 'tf_checkup', label: 'Check up', price: 99, isActive: true },
      { id: 'tf_service', label: 'Servicing & Oil greasing', price: 149, isActive: true },
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
    isActive: true,
    description: 'Modular switch replacements, MCB tripping troubleshooting, short circuit isolation, and rewiring.',
    subServices: [
      { id: 'elec_switch', label: 'Switch replacement', price: 99, isActive: true },
      { id: 'elec_mcb', label: 'MCB change', price: 149, isActive: true },
      { id: 'elec_short', label: 'Short circuit checking', price: 199, isActive: true },
    ]
  }
];

export const MM_PRICING_EVENT = 'mm_pricing_updated';
export const MM_FUEL_EVENT = 'mm_fuel_rate_updated';

/**
 * Normalizes a service item by guaranteeing isActive booleans
 */
function normalizeServiceItem(item, idx = 0) {
  const numericId = typeof item.id === 'number' ? item.id : (idx + 1);
  return {
    ...item,
    id: numericId,
    isActive: item.isActive !== false,
    subServices: (item.subServices || []).map((sub) => ({
      ...sub,
      isActive: sub.isActive !== false,
    })),
  };
}

/**
 * Retrieves the live service catalog from localStorage or defaults.
 * If onlyActive is true, hides categories and sub-services that admin marked as inactive/hidden.
 */
export function getLiveServicePricing(onlyActive = false) {
  let catalog = DEFAULT_SERVICES_CATALOG;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('mm_admin_service_pricing');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          catalog = parsed.map(normalizeServiceItem);
        }
      }
    } catch (e) {
      console.error('[PricingService] Error reading pricing from localStorage:', e);
    }
  }

  if (onlyActive) {
    return catalog
      .filter((s) => s.isActive !== false)
      .map((s) => ({
        ...s,
        subServices: (s.subServices || []).filter((sub) => sub.isActive !== false),
      }));
  }

  return catalog;
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
 * Saves updated service catalog to localStorage, dispatches local events,
 * and synchronizes with backend REST endpoint if reachable.
 */
export async function saveLiveServicePricing(updatedList, syncToBackend = true) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = updatedList.map(normalizeServiceItem);
    localStorage.setItem('mm_admin_service_pricing', JSON.stringify(normalized));

    // Instant local custom event for current window
    window.dispatchEvent(new CustomEvent(MM_PRICING_EVENT, { detail: { services: normalized } }));

    // Async sync with backend database if reachable
    if (syncToBackend) {
      apiConnector('PUT', `${BASE_URL}/pricing/services`, { services: normalized })
        .then((res) => {
          if (res.data?.success) {
            console.log('[PricingService] Successfully synced service catalog with backend MongoDB.');
          }
        })
        .catch((err) => {
          // Graceful fallback: Backend may still be in maintenance/deployment
          console.info('[PricingService] Backend sync queued / offline:', err.message);
        });
    }
  } catch (e) {
    console.error('[PricingService] Error saving pricing:', e);
  }
}

/**
 * Saves updated fuel rate to localStorage, dispatches local events,
 * and synchronizes with backend REST endpoint if reachable.
 */
export async function saveLiveFuelRate(rate, syncToBackend = true) {
  if (typeof window === 'undefined') return;
  try {
    const numRate = Number(rate) || 10;
    localStorage.setItem('mm_admin_fuel_rate_per_km', String(numRate));
    window.dispatchEvent(new CustomEvent(MM_FUEL_EVENT, { detail: { fuelRate: numRate } }));

    if (syncToBackend) {
      apiConnector('PUT', `${BASE_URL}/pricing/fuel`, { fuelRatePerKm: numRate })
        .then((res) => {
          if (res.data?.success) {
            console.log('[PricingService] Successfully synced fuel rate with backend MongoDB.');
          }
        })
        .catch((err) => {
          console.info('[PricingService] Backend fuel sync offline:', err.message);
        });
    }
  } catch (e) {
    console.error('[PricingService] Error saving fuel rate:', e);
  }
}

/**
 * Fetches the latest pricing configuration from backend MongoDB and updates client cache.
 */
export async function fetchLivePricingFromBackend() {
  if (typeof window === 'undefined') return;
  try {
    const res = await apiConnector('GET', `${BASE_URL}/pricing?adminView=true`);
    if (res.data?.success && res.data?.data) {
      const { services, fuelRatePerKm } = res.data.data;
      if (Array.isArray(services) && services.length > 0) {
        saveLiveServicePricing(services, false);
      }
      if (fuelRatePerKm) {
        saveLiveFuelRate(fuelRatePerKm, false);
      }
    }
  } catch (err) {
    // Offline or backend endpoint pending - fallback to cached localStorage values
    console.info('[PricingService] Using cached local pricing configuration.');
  }
}

// Initial background sync check on module load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchLivePricingFromBackend();
  }, 1000);
}

/**
 * Builds live APPLIANCE_SUB_SERVICES object mapping { [id]: { id, name, icon, subServices } }
 * By default filters out inactive categories and inactive sub-services for public views.
 */
export function getLiveApplianceSubServices(onlyActive = true) {
  const catalog = getLiveServicePricing(onlyActive);
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
export function getLiveAppliancePricing(onlyActive = true) {
  const catalog = getLiveServicePricing(onlyActive);
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
  const catalog = getLiveServicePricing(false); // Can resolve price even if hidden
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
 * - By default (includeHidden: false), `services` returns ONLY active/visible categories for users.
 * - When includeHidden: true (used in Admin Dashboard), returns all categories with their isActive state.
 */
export function useLivePricing(options = {}) {
  const includeHidden = Boolean(options?.includeHidden || options?.admin);
  const [allServices, setAllServices] = useState(() => getLiveServicePricing(false));
  const [fuelRate, setFuelRate] = useState(getLiveFuelRate);

  useEffect(() => {
    const handlePricingUpdate = () => {
      setAllServices(getLiveServicePricing(false));
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

  // Filtered active services for public consumers
  const activeServices = useMemo(() => {
    return allServices
      .filter((s) => s.isActive !== false)
      .map((s) => ({
        ...s,
        subServices: (s.subServices || []).filter((sub) => sub.isActive !== false),
      }));
  }, [allServices]);

  // Derived reactively from services state — auto-updates when admin changes pricing
  const applianceSubServices = useMemo(() => {
    const targetList = includeHidden ? allServices : activeServices;
    const result = {};
    targetList.forEach((item, index) => {
      const numericId = typeof item.id === 'number' ? item.id : (index + 1);
      result[numericId] = {
        id: numericId,
        name: item.name,
        icon: item.icon || '🔧',
        subServices: Array.isArray(item.subServices) ? item.subServices : []
      };
    });
    return result;
  }, [allServices, activeServices, includeHidden]);

  const appliancePricing = useMemo(() => {
    const targetList = includeHidden ? allServices : activeServices;
    const result = {};
    targetList.forEach((item, index) => {
      const numericId = typeof item.id === 'number' ? item.id : (index + 1);
      result[numericId] = {
        basePrice: Number(item.basePrice) || 199,
        label: item.name
      };
    });
    return result;
  }, [allServices, activeServices, includeHidden]);

  // Toggle Category Visibility (Hide from users without deleting)
  const toggleCategoryVisibility = useCallback((serviceId, optionalNewState) => {
    const updated = allServices.map((s) => {
      if (s.id === serviceId) {
        const newState = typeof optionalNewState === 'boolean' ? optionalNewState : !s.isActive;
        return { ...s, isActive: newState };
      }
      return s;
    });
    saveLiveServicePricing(updated);
  }, [allServices]);

  // Toggle Sub-Service Visibility (Hide from checkout without deleting)
  const toggleSubServiceVisibility = useCallback((serviceId, subId, optionalNewState) => {
    const updated = allServices.map((s) => {
      if (s.id === serviceId) {
        const updatedSubs = (s.subServices || []).map((sub) => {
          if (sub.id === subId) {
            const newState = typeof optionalNewState === 'boolean' ? optionalNewState : !sub.isActive;
            return { ...sub, isActive: newState };
          }
          return sub;
        });
        return { ...s, subServices: updatedSubs };
      }
      return s;
    });
    saveLiveServicePricing(updated);
  }, [allServices]);

  return {
    // For regular components, `services` automatically contains active-only items
    // If includeHidden is true (admin), `services` contains all items
    services: includeHidden ? allServices : activeServices,
    allServices,
    activeServices,
    fuelRate,
    applianceSubServices,
    appliancePricing,
    saveServices: saveLiveServicePricing,
    saveFuel: saveLiveFuelRate,
    toggleCategoryVisibility,
    toggleSubServiceVisibility,
  };
}
