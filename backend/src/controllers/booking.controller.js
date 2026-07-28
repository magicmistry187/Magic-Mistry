const mongoose = require('mongoose');
const Booking = require('../models/booking.model');

// In-memory fallback for bookings if DB connection is offline
const inMemoryBookings = [
  {
    _id: 'BK-2024-001',
    customer: '60d0fe4f5311236168a109ca',
    appliance: 'AC Repair',
    issue: 'AC Deep Cleaning and Service',
    address: '123 Park Avenue, MG Road, Bangalore',
    serviceDate: new Date('2026-07-20'),
    timeSlot: '10:00 AM - 11:00 AM',
    bookingStatus: 'Completed',
    paymentStatus: 'Paid',
    createdAt: new Date('2026-07-15'),
  },
  {
    _id: 'BK-2024-002',
    customer: '60d0fe4f5311236168a109ca',
    appliance: 'Washing Machine',
    issue: 'Noise during spin cycle',
    address: '123 Park Avenue, MG Road, Bangalore',
    serviceDate: new Date('2026-07-26'),
    timeSlot: '02:00 PM - 04:00 PM',
    bookingStatus: 'In Progress',
    paymentStatus: 'Pending',
    createdAt: new Date('2026-07-22'),
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { appliance, issue, address, serviceDate, timeSlot, images } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!appliance || !issue || !address || !serviceDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appliance, issue description, address, date, and time slot',
      });
    }

    if (isDbConnected()) {
      const newBooking = await Booking.create({
        customer: userId,
        appliance,
        issue,
        address,
        serviceDate,
        timeSlot,
        images: images || [],
        bookingStatus: 'Pending',
        paymentStatus: 'Pending',
      });

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: newBooking,
      });
    } else {
      const fallbackBooking = {
        _id: 'BK-' + Date.now().toString().slice(-6),
        customer: userId,
        appliance,
        issue,
        address,
        serviceDate: new Date(serviceDate),
        timeSlot,
        images: images || [],
        bookingStatus: 'Pending',
        paymentStatus: 'Pending',
        createdAt: new Date(),
      };
      inMemoryBookings.unshift(fallbackBooking);

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully (dev mode)',
        booking: fallbackBooking,
      });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

// Get current user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (isDbConnected()) {
      const bookings = await Booking.find({ customer: userId })
        .populate('vendor', 'fullName email phoneNumber')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } else {
      const userBookings = inMemoryBookings.filter(
        (b) => b.customer.toString() === userId?.toString() || true
      );
      return res.status(200).json({
        success: true,
        count: userBookings.length,
        bookings: userBookings,
      });
    }
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

// Get single booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (isDbConnected()) {
      const booking = await Booking.findById(bookingId).populate('vendor', 'fullName email phoneNumber');
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }
      return res.status(200).json({
        success: true,
        booking,
      });
    } else {
      const booking = inMemoryBookings.find((b) => b._id === bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }
      return res.status(200).json({
        success: true,
        booking,
      });
    }
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message,
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (isDbConnected()) {
      const booking = await Booking.findOne({ _id: bookingId, customer: userId });
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or unauthorized',
        });
      }

      booking.bookingStatus = 'Cancelled';
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        booking,
      });
    } else {
      const booking = inMemoryBookings.find((b) => b._id === bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }
      booking.bookingStatus = 'Cancelled';
      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        booking,
      });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
};
