import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLiveServicePricing } from '../../services/pricingService';
import { createBookingApi } from '../../services/api';
import { parseAddressString } from '../../utils/addressParser';

const BookingContext = createContext();

// ---------------------------------------------------------
// Helpers: build live pricing maps from admin-set catalog
// ---------------------------------------------------------
function buildLiveAppliancePricing() {
  const catalog = getLiveServicePricing(true);
  const result = {};
  catalog.forEach((item, index) => {
    const id = typeof item.id === 'number' ? item.id : (index + 1);
    result[id] = { basePrice: Number(item.basePrice) || 199, label: item.name };
  });
  return result;
}

function buildLiveApplianceSubServices() {
  const catalog = getLiveServicePricing(true);
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
 * Smooth scroll helper
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

    if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
      window.__lenis.scrollTo(element, {
        offset,
        duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lock: false,
        force: true,
      });
    } else {
      const elementRect = element.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = elementRect.top + currentScrollY + offset;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }

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
  const navigate = useNavigate();
  const { user, isLoggedIn, token } = useAuth();

  const storedLoc = typeof window !== 'undefined' ? localStorage.getItem('mm_location') : null;
  const savedLocation = storedLoc && storedLoc !== 'Set Your Location' ? storedLoc : '';

  const hasInitialAppliance = Boolean(initialAppliance && initialAppliance.id);
  const initialCatId = hasInitialAppliance ? initialAppliance.id : null;

  // Track active milestone step (1: Service, 2: Schedule, 3: Address, 4: Review & Payment)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);

  // Global booking submission state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  // When initial appliance is provided
  useEffect(() => {
    if (initialAppliance) {
      const liveSubs = buildLiveApplianceSubServices();
      const catSubs = liveSubs[initialAppliance.id]?.subServices || [];
      const firstSub = catSubs.length > 0 ? [catSubs[0]] : [];
      const initialTotal = firstSub.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

      setBookingState((prev) => ({
        ...prev,
        serviceId: initialAppliance.id,
        serviceName: initialAppliance.name,
        isApplianceLocked: false,
        selectedSubServices: firstSub,
        priceInfo: {
          basePrice: initialTotal || DEFAULT_BASE_PRICE,
          visitCharge: 0,
          total: initialTotal || DEFAULT_BASE_PRICE
        },
      }));
    }
  }, [initialAppliance]);

  // Pricing synchronization with admin catalog updates
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
      let next;
      if (typeof key === 'object' && key !== null) {
        next = { ...prev, ...key };
        if (key.serviceId !== undefined) {
          const liveSubs = buildLiveApplianceSubServices();
          const catSubs = liveSubs[key.serviceId]?.subServices || [];
          const firstSub = catSubs.length > 0 ? [catSubs[0]] : [];
          const initialTotal = firstSub.reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);

          next.selectedSubServices = firstSub;
          next.priceInfo = {
            basePrice: initialTotal,
            visitCharge: 0,
            total: initialTotal
          };
        }
        if (key.selectedSubServices !== undefined) {
          const total = (key.selectedSubServices || []).reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);
          next.priceInfo = { basePrice: total, visitCharge: 0, total: total };
        }
      } else {
        next = { ...prev, [key]: value };

        if (key === 'serviceId') {
          const liveSubs = buildLiveApplianceSubServices();
          const catSubs = liveSubs[value]?.subServices || [];
          const firstSub = catSubs.length > 0 ? [catSubs[0]] : [];
          const initialTotal = firstSub.reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);

          next.selectedSubServices = firstSub;
          next.priceInfo = {
            basePrice: initialTotal,
            visitCharge: 0,
            total: initialTotal
          };
        }

        if (key === 'selectedSubServices') {
          const total = (value || []).reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);
          next.priceInfo = { basePrice: total, visitCharge: 0, total: total };
        }
      }

      return next;
    });
  };

  const unlockApplianceSelection = () => {
    setBookingState((prev) => ({ ...prev, isApplianceLocked: false }));
  };

  // Step validation rules
  const isStep1Valid = Boolean(
    bookingState.serviceId &&
    bookingState.selectedSubServices &&
    bookingState.selectedSubServices.length > 0
  );

  const isStep2Valid = Boolean(bookingState.date && bookingState.timeSlot);

  const isStep3Valid = Boolean(bookingState.address && bookingState.address.trim().length >= 4);

  const isStep4Valid = Boolean(bookingState.paymentMethod);

  // Update max unlocked step dynamically
  useEffect(() => {
    let unlocked = 1;
    if (isStep1Valid) unlocked = Math.max(unlocked, 2);
    if (isStep1Valid && isStep2Valid) unlocked = Math.max(unlocked, 3);
    if (isStep1Valid && isStep2Valid && isStep3Valid) unlocked = Math.max(unlocked, 4);
    setMaxUnlockedStep(unlocked);
  }, [isStep1Valid, isStep2Valid, isStep3Valid]);

  const goToStep = (stepNumber) => {
    const clamped = Math.max(1, Math.min(4, stepNumber));
    if (clamped <= maxUnlockedStep) {
      setCurrentStep(clamped);
      scrollToNextStep('booking-main-content', { offset: -110, delay: 50 });
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
      setMaxUnlockedStep(prev => Math.max(prev, 2));
      scrollToNextStep('booking-main-content', { offset: -110, delay: 50 });
    } else if (currentStep === 2 && isStep2Valid) {
      setCurrentStep(3);
      setMaxUnlockedStep(prev => Math.max(prev, 3));
      scrollToNextStep('booking-main-content', { offset: -110, delay: 50 });
    } else if (currentStep === 3 && isStep3Valid) {
      setCurrentStep(4);
      setMaxUnlockedStep(prev => Math.max(prev, 4));
      scrollToNextStep('booking-main-content', { offset: -110, delay: 50 });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToNextStep('booking-main-content', { offset: -110, delay: 50 });
    }
  };

  // Centralized Booking Submission Handler
  const submitBooking = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setShowLoginModal(true);
      return;
    }

    const errs = [];
    if (!bookingState.serviceId && !bookingState.serviceName) {
      errs.push('Please select an appliance and package.');
      setCurrentStep(1);
    } else if (!bookingState.date) {
      errs.push('Please pick a booking date.');
      setCurrentStep(2);
    } else if (!bookingState.timeSlot) {
      errs.push('Please choose an arrival time window.');
      setCurrentStep(2);
    } else if (!bookingState.address || bookingState.address.trim().length < 4) {
      errs.push('Please enter your complete service address.');
      setCurrentStep(3);
    }

    if (errs.length > 0) {
      setErrors(errs);
      scrollToNextStep('booking-main-content', { offset: -110, delay: 50 });
      return;
    }

    try {
      setErrors([]);
      setLoading(true);

      const serviceTitle = bookingState.selectedSubServices.length > 0
        ? `${bookingState.serviceName} (${bookingState.selectedSubServices.map(s => s.label).join(', ')})`
        : bookingState.serviceName || 'Appliance Repair';

      const basePrice = bookingState.priceInfo?.basePrice;
      const total = bookingState.priceInfo?.total;
      const serviceChargeVal = Number(basePrice) > 0 ? Number(basePrice) : (Number(total) > 0 ? Number(total) : 199);
      const rawMethod = String(bookingState.paymentMethod || 'Cash').toLowerCase();
      const backendPaymentMethod = rawMethod === 'upi' ? 'UPI' : 'Cash';

      const standardizedPaymentDetails = {
        category: backendPaymentMethod,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'customer_checkout',
        },
      };

      const formData = new FormData();
      formData.append('appliance', bookingState.serviceName || 'Appliance Repair');
      formData.append('serviceCategory', serviceTitle);
      formData.append('serviceCategoryCharge', serviceChargeVal);
      formData.append('paymentMethod', backendPaymentMethod);
      formData.append('paymentDetails', JSON.stringify(standardizedPaymentDetails));
      formData.append('paymentDetails[category]', backendPaymentMethod);

      formData.append(
        'issue',
        bookingState.problemDescription ||
        (bookingState.selectedSubServices.length > 0
          ? bookingState.selectedSubServices.map(s => s.label).join(', ')
          : 'General Repair & Maintenance')
      );

      const parsedAddr = parseAddressString(bookingState.address);
      const addressLine1 = parsedAddr.flat || parsedAddr.street || bookingState.address.trim();
      const street = parsedAddr.flat ? parsedAddr.street : '';

      formData.append('address', bookingState.address.trim());
      formData.append('address[addressLine1]', addressLine1);
      if (street) {
        formData.append('address[street]', street);
      }
      formData.append('address[city]', parsedAddr.city || '');
      formData.append('address[state]', parsedAddr.state || '');
      formData.append('address[pincode]', parsedAddr.pincode || '');
      if (parsedAddr.landmark) {
        formData.append('address[landmark]', parsedAddr.landmark);
      }
      formData.append('address[country]', 'India');
      formData.append('serviceDate', bookingState.date);
      formData.append('timeSlot', bookingState.timeSlot);

      const savedLat = localStorage.getItem('mm_lat');
      const savedLng = localStorage.getItem('mm_lng');
      const lat = bookingState.latitude ?? user?.latitude ?? savedLat ?? null;
      const lng = bookingState.longitude ?? user?.longitude ?? savedLng ?? null;

      if (lat !== null && lat !== undefined && lat !== 'null' && !isNaN(Number(lat))) {
        formData.append('latitude', Number(lat));
      }
      if (lng !== null && lng !== undefined && lng !== 'null' && !isNaN(Number(lng))) {
        formData.append('longitude', Number(lng));
      }

      if (bookingState.imageFile) {
        formData.append('image', bookingState.imageFile);
      }

      const res = await createBookingApi(formData, token);

      if (res.success && res.booking) {
        const fullDisplayAddress = bookingState.address.trim();
        const hasValidReturnedAddress =
          res.booking?.address &&
          ((typeof res.booking.address === 'string' && res.booking.address.trim()) ||
           (typeof res.booking.address === 'object' && Object.values(res.booking.address).some(v => typeof v === 'string' && v.trim())));

        navigate('/booking/confirmation', {
          state: {
            booking: {
              ...res.booking,
              address: hasValidReturnedAddress ? res.booking.address : fullDisplayAddress,
              serviceDate: res.booking?.serviceDate || bookingState.date,
              timeSlot: res.booking?.timeSlot || bookingState.timeSlot,
            },
          },
        });
      } else {
        setErrors([res.message || 'Failed to place booking. Please try again.']);
      }
    } catch (error) {
      setErrors([error.message || 'Booking submission failed. Please try again.']);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, token, bookingState, user, navigate]);

  const value = useMemo(() => ({
    bookingState,
    updateBooking,
    unlockApplianceSelection,
    scrollToNextStep,
    currentStep,
    setCurrentStep,
    maxUnlockedStep,
    goToStep,
    nextStep,
    prevStep,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    submitBooking,
    loading,
    errors,
    setErrors,
    showLoginModal,
    setShowLoginModal,
  }), [
    bookingState,
    currentStep,
    maxUnlockedStep,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    submitBooking,
    loading,
    errors,
    showLoginModal,
  ]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
