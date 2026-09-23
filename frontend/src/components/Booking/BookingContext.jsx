import { createContext, useContext, useState, useEffect } from 'react';
import { getLiveServicePricing } from '../../services/pricingService';

const BookingContext = createContext();

// ---------------------------------------------------------
// Helpers: build live pricing maps from admin-set catalog
// These read directly from localStorage at call-time, so
// they always return the latest admin-saved values.
// ---------------------------------------------------------
function buildLiveAppliancePricing() {
  const catalog = getLiveServicePricing();
  const result = {};
  catalog.forEach((item, index) => {
    const id = typeof item.id === 'number' ? item.id : (index + 1);
    result[id] = { basePrice: Number(item.basePrice) || 199, label: item.name };
  });
  return result;
}

function buildLiveApplianceSubServices() {
  const catalog = getLiveServicePricing();
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

export const scrollToNextStep = (targetId) => {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 150);
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
