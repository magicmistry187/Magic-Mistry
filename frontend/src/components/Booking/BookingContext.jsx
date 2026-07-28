import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

// Per-appliance base service charges
export const APPLIANCE_PRICING = {
  1:  { basePrice: 349, label: 'AC Repair' },
  2:  { basePrice: 299, label: 'Refrigeration' },
  3:  { basePrice: 279, label: 'Washing Machine' },
  4:  { basePrice: 199, label: 'Microwave' },
  5:  { basePrice: 149, label: 'Mixi Grinder' },
  6:  { basePrice: 199, label: 'Water Pump' },
  7:  { basePrice: 199, label: 'Air Cooler' },
  8:  { basePrice: 179, label: 'Induction Cooktop' },
  9:  { basePrice: 149, label: 'Stabilizer' },
  10: { basePrice: 99,  label: 'Press Iron' },
};

const DEFAULT_BASE_PRICE = 299;

export const BookingProvider = ({ children, initialAppliance }) => {
  const getBasePrice = (id) => APPLIANCE_PRICING[id]?.basePrice ?? DEFAULT_BASE_PRICE;

  const savedLocation = typeof window !== 'undefined' ? localStorage.getItem('mm_location') || '' : '';

  const [bookingState, setBookingState] = useState({
    serviceId: initialAppliance?.id || null,
    serviceName: initialAppliance?.name || '',
    isApplianceLocked: !!initialAppliance,
    problemDescription: '',
    date: '',
    timeSlot: '',
    address: savedLocation,
    paymentMethod: '',
    images: [],
    priceInfo: {
      basePrice: initialAppliance ? getBasePrice(initialAppliance.id) : DEFAULT_BASE_PRICE,
      visitCharge: 0,
      total: initialAppliance ? getBasePrice(initialAppliance.id) : DEFAULT_BASE_PRICE,
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
    <BookingContext.Provider value={{ bookingState, updateBooking, unlockApplianceSelection }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);