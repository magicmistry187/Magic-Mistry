import { createContext, useContext, useState, useEffect } from 'react';
import { getLiveServicePricing } from '../../services/pricingService';

const BookingContext = createContext();

// ---------------------------------------------------------
// Helpers: build live pricing maps from admin-set catalog
// These read directly from localStorage at call-time, so
// they always return the latest admin-saved values.
// ---------------------------------------------------------
function buildLiveAppliancePricing() {
  const catalog = getLiveServicePricing(true); // Only active categories for customer checkout
  const result = {};
  catalog.forEach((item, index) => {
    const id = typeof item.id === 'number' ? item.id : (index + 1);
    result[id] = { basePrice: Number(item.basePrice) || 199, label: item.name };
  });
  return result;
}

function buildLiveApplianceSubServices() {
  const catalog = getLiveServicePricing(true); // Only active categories & sub-services
  const result = {};
  catalog.forEach((item, index) => {
    const id = typeof item.id === 'number' ? item.id : (index + 1);
    result[id] = {
      id,
      name: item.name,
      icon: item.icon || '🔧',
      subServices: Array.isArray(item.subServices) ? item.subServices : []
    };
  });
  return result;
}

/**
 * Fast and silky-smooth scroll function for the booking flow.
 * Supports both Lenis smooth scrolling (global __lenis) and browser smooth scroll fallback.
 *
 * @param {string|HTMLElement} targetId - DOM element or ID (with or without #)
 * @param {Object} [options]
 * @param {number} [options.offset=-90] - Offset from top in pixels (compensates for fixed navbar)
 * @param {number} [options.delay=80] - Debounce/mount delay in ms before initiating scroll
 * @param {number} [options.duration=0.65] - Scroll duration in seconds for Lenis
 * @param {boolean} [options.highlight=false] - Optional focus highlight ring
 */
export const scrollToNextStep = (targetId, options = {}) => {
  if (typeof window === 'undefined' || !targetId) return;

  const {
    offset = -90,
    delay = 30,
    duration = 0.65,
    highlight = false,
  } = options;

  const getTargetElement = () => {
    if (typeof targetId === 'string') {
      const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;
      return document.getElementById(cleanId) || document.querySelector(targetId.startsWith('#') ? targetId : `#${cleanId}`);
    } else if (targetId && targetId.nodeType === Node.ELEMENT_NODE) {
      return targetId;
    }
    return null;
  };

  const executeScroll = (element) => {
    if (!element) return;

    // 1. Lenis smooth scroll: hardware-accelerated, instantaneous response, zero jitter
    if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
      window.__lenis.scrollTo(element, {
        offset,
        duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lock: false,
        force: true,
      });
    } else {
      // 2. Fallback to native smooth scroll with calculated coordinate
      const elementRect = element.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = elementRect.top + currentScrollY + offset;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }

    // Optional subtle accent ring to guide user's attention
    if (highlight) {
      element.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2', 'transition-all', 'duration-500');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2');
      }, 1200);
    }
  };

  setTimeout(() => {
    const el = getTargetElement();
    if (el) {
      executeScroll(el);
    } else {
      // Polling fallback: if element is mounting via React render/AnimatePresence, find it on the very first frame it exists
      const startTime = performance.now();
      const poll = (now) => {
        const found = getTargetElement();
        if (found) {
          executeScroll(found);
        } else if (now - startTime < 600) {
          requestAnimationFrame(poll);
        }
      };
      requestAnimationFrame(poll);
    }
  }, delay);
};


const DEFAULT_BASE_PRICE = 299;

export const BookingProvider = ({ children, initialAppliance = null }) => {
  const getBasePrice = (id) => {
    const pricing = buildLiveAppliancePricing();
    return pricing[id]?.basePrice ?? DEFAULT_BASE_PRICE;
  };

  const storedLoc = typeof window !== 'undefined' ? localStorage.getItem('mm_location') : null;
  const savedLocation = storedLoc && storedLoc !== 'Set Your Location' ? storedLoc : '';

  const hasInitialAppliance = Boolean(initialAppliance && initialAppliance.id);
  const initialCatId = hasInitialAppliance ? initialAppliance.id : null;

  const [bookingState, setBookingState] = useState({
    serviceId: initialCatId,
    serviceName: initialAppliance?.name || '',
    selectedSubServices: [],
    isApplianceLocked: hasInitialAppliance,
    problemDescription: '',
    date: '',
    timeSlot: '',
    address: savedLocation,
    latitude: null,
    longitude: null,
    paymentMethod: 'Cash',
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

  // ---------------------------------------------------------
  // Auto-sync: when admin changes prices, update booking totals
  // ---------------------------------------------------------
  useEffect(() => {
    const handlePricingUpdate = () => {
      if (bookingState.serviceId) {
        const livePricing = buildLiveAppliancePricing();
        const liveSubs = buildLiveApplianceSubServices();
        const base = livePricing[bookingState.serviceId]?.basePrice || DEFAULT_BASE_PRICE;

        if (bookingState.selectedSubServices?.length > 0) {
          const currentCatSubs = liveSubs[bookingState.serviceId]?.subServices || [];
          const updatedSelected = bookingState.selectedSubServices.map(selected => {
            const found = currentCatSubs.find(s => s.label === selected.label || s.id === selected.id);
            return found ? { ...selected, price: found.price } : selected;
          });
          const newTotal = updatedSelected.reduce((acc, curr) => acc + curr.price, 0);
          setBookingState(prev => ({
            ...prev,
            selectedSubServices: updatedSelected,
            priceInfo: { basePrice: newTotal, visitCharge: 0, total: newTotal }
          }));
        } else {
          setBookingState(prev => ({
            ...prev,
            priceInfo: { basePrice: base, visitCharge: 0, total: base }
          }));
        }
      }
    };

    window.addEventListener('mm_pricing_updated', handlePricingUpdate);
    return () => {
      window.removeEventListener('mm_pricing_updated', handlePricingUpdate);
    };
  }, [bookingState.serviceId, bookingState.selectedSubServices]);

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
