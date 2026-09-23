let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

/**
 * Emits when a customer creates a new booking.
 * Only broadcasts to connected vendors whose configured service radius (default: 15 km)
 * covers the booking's location (or matching city if coordinates missing).
 */
const emitNewBooking = async (booking) => {
  if (!ioInstance) return;

  // Always notify admin dashboard
  ioInstance.to('admin').emit('admin:new_booking', booking);

  try {
    const bookingCoords = booking.location?.coordinates;
    const hasBookingCoords =
      Array.isArray(bookingCoords) &&
      bookingCoords.length === 2 &&
      !isNaN(Number(bookingCoords[0])) &&
      !isNaN(Number(bookingCoords[1]));

    const bookingCity = (
      (typeof booking.address === 'object' && booking.address?.city) ||
      (typeof booking.address === 'string' ? booking.address : '')
    ).trim();

    // Get all active sockets in 'vendors:available'
    const sockets = await ioInstance.in('vendors:available').fetchSockets();
    if (!sockets || sockets.length === 0) return;

    // Collect distinct vendor user IDs
    const vendorUserIds = [...new Set(sockets.map((s) => s.user?.id).filter(Boolean))];
    if (vendorUserIds.length === 0) return;

    const Address = require('../models/address.model');
    const VendorProfile = require('../models/vendorProfile.model');

    const [addresses, profiles] = await Promise.all([
      Address.find({ user: { $in: vendorUserIds } }).sort({ isDefault: -1, createdAt: -1 }).lean(),
      VendorProfile.find({ user: { $in: vendorUserIds } }).select('user serviceRadius').lean(),
    ]);

    const addrMap = new Map();
    for (const a of addresses) {
      const uId = String(a.user);
      if (!addrMap.has(uId)) addrMap.set(uId, a);
    }

    const radiusMap = new Map();
    for (const p of profiles) {
      radiusMap.set(String(p.user), Number(p.serviceRadius) > 0 ? Number(p.serviceRadius) : 15);
    }

    // Haversine distance in meters
    const getHaversineDistanceMeters = (lon1, lat1, lon2, lat2) => {
      const R = 6371e3; // Earth radius in meters
      const toRad = (deg) => (deg * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const bookingPlain = typeof booking.toObject === 'function' ? booking.toObject() : { ...booking };

    for (const vendorId of vendorUserIds) {
      const vAddr = addrMap.get(String(vendorId));
      const vRadiusKm = radiusMap.get(String(vendorId)) || 15;
      const vRadiusMeters = vRadiusKm * 1000;

      let isMatch = false;
      let calculatedDistance = null;

      if (hasBookingCoords && vAddr?.location?.coordinates?.length === 2) {
        const vLng = Number(vAddr.location.coordinates[0]);
        const vLat = Number(vAddr.location.coordinates[1]);
        const bLng = Number(bookingCoords[0]);
        const bLat = Number(bookingCoords[1]);

        const distMeters = getHaversineDistanceMeters(vLng, vLat, bLng, bLat);
        if (distMeters <= vRadiusMeters) {
          isMatch = true;
          calculatedDistance = Math.round(distMeters);
        }
      } else if (bookingCity && vAddr?.city) {
        const vCity = vAddr.city.trim().toLowerCase();
        const bCity = bookingCity.toLowerCase();
        if (vCity && (bCity.includes(vCity) || vCity.includes(bCity))) {
          isMatch = true;
        }
      }

      if (isMatch) {
        const payloadToSend = {
          ...bookingPlain,
          distance: calculatedDistance !== null ? calculatedDistance : undefined,
        };
        ioInstance.to(`vendor:${String(vendorId)}`).emit('booking:new', payloadToSend);
      }
    }
  } catch (err) {
    console.error('[SocketEmitter] Error filtering new booking by radius:', err);
    // Fallback broadcast
    ioInstance.to('vendors:available').emit('booking:new', booking);
  }
};

/**
 * Emits when booking status changes (Accepted, In Progress, Completed, etc.).
 * Broadcasts to the specific customer, the assigned vendor, and admin.
 */
const emitBookingStatusUpdated = (booking) => {
  if (!ioInstance) return;
  const customerId = booking.customer?._id || booking.customer;
  const vendorId = booking.vendor?._id || booking.vendor;

  if (customerId) {
    ioInstance.to(`user:${String(customerId)}`).emit('booking:status_changed', booking);
  }
  if (vendorId) {
    ioInstance.to(`vendor:${String(vendorId)}`).emit('booking:status_changed', booking);
  }
  ioInstance.to('admin').emit('admin:booking_updated', booking);
};

/**
 * Emits when a booking is accepted by a vendor or is no longer available.
 * Tells all other vendors in 'vendors:available' to remove it from their available job feeds.
 */
const emitBookingTaken = (bookingId, assignedVendorId) => {
  if (!ioInstance) return;
  ioInstance.to('vendors:available').emit('booking:taken', {
    bookingId: String(bookingId),
    assignedVendorId: assignedVendorId ? String(assignedVendorId) : null,
  });
};

/**
 * Emits when a booking is cancelled.
 * Notifies the customer, vendor, and admin, and removes it from available vendor pools.
 */
const emitBookingCancelled = (booking) => {
  if (!ioInstance) return;
  const customerId = booking.customer?._id || booking.customer;
  const vendorId = booking.vendor?._id || booking.vendor;

  if (customerId) {
    ioInstance.to(`user:${String(customerId)}`).emit('booking:cancelled', booking);
  }
  if (vendorId) {
    ioInstance.to(`vendor:${String(vendorId)}`).emit('booking:cancelled', booking);
  }
  ioInstance.to('vendors:available').emit('booking:taken', {
    bookingId: String(booking._id || booking.id),
  });
  ioInstance.to('admin').emit('admin:booking_updated', booking);
};

/**
 * Emits when a new vendor application is submitted.
 * Alerts all connected admin dashboards.
 */
const emitNewVendorApplication = (application) => {
  if (!ioInstance) return;
  ioInstance.to('admin').emit('admin:new_application', application);
};

/**
 * Emits when a vendor application is approved or rejected by admin.
 */
const emitVendorApplicationStatus = (application) => {
  if (!ioInstance) return;
  ioInstance.to('admin').emit('admin:application_updated', application);
};

module.exports = {
  setIO,
  getIO,
  emitNewBooking,
  emitBookingStatusUpdated,
  emitBookingTaken,
  emitBookingCancelled,
  emitNewVendorApplication,
  emitVendorApplicationStatus,
};
