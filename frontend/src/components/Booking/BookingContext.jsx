import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children, initialAppliance }) => {
  // We store IDs for backend scalability, but can store names for UI display
  const [bookingState, setBookingState] = useState({
    serviceId: initialAppliance?.id || null, 
    serviceName: initialAppliance?.name || '',
    isApplianceLocked: !!initialAppliance, // Lock if coming from a specific service page
    problemDescription: '',
    date: '',
    timeSlot: '',
    address: '',
    paymentMethod: 'online',
    // Pricing would ideally be fetched from the backend based on serviceId
    priceInfo: {
      basePrice: 299,
      visitCharge: 0,
      total: 299,
    }
  });

  useEffect(() => {
    if (initialAppliance) {
      setBookingState((prev) => ({
        ...prev,
        serviceId: initialAppliance.id,
        serviceName: initialAppliance.name,
        isApplianceLocked: true
      }));
    }
  }, [initialAppliance]);

  const updateBooking = (key, value) => {
    setBookingState((prev) => ({ ...prev, [key]: value }));
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