let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

/**
 * Emits when a customer creates a new booking.
 * Broadcasts to all connected vendors (room 'vendors:available') and admins.
 */
const emitNewBooking = (booking) => {
  if (!ioInstance) return;
  ioInstance.to('vendors:available').emit('booking:new', booking);
  ioInstance.to('admin').emit('admin:new_booking', booking);
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
