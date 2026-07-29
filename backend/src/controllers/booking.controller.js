const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const uploadImageToImageKit = require('../config/imagekit');

const isDbConnected = () => mongoose.connection.readyState === 1;
const inMemoryBookings = [];

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const {
      appliance,
      issue,
      address,
      serviceDate,
      timeSlot,
      serviceCharge,
      serviceCategory,
      serviceCategoryCharge,
    } = req.body;

    const selectedAppliance = appliance || serviceCategory;

    if (!selectedAppliance || !address || !serviceDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'All required fields (appliance, address, serviceDate, timeSlot) must be provided.',
      });
    }

    // Image uploading
    let image = '';

    if (req.file) {
      try {
        const result = await uploadImageToImageKit(req.file.buffer);
        image = result.url;
      } catch (imgErr) {
        console.error('Image upload failed, proceeding without image:', imgErr);
      }
    }

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'A user cannot make a booking until they log in.',
      });
    }

    if (isDbConnected()) {
      const booking = await Booking.create({
        customer: userId,
        appliance: selectedAppliance,
        issue: issue || 'General Repair & Maintenance',
        image,
        address,
        serviceDate,
        timeSlot,
        serviceCategory: serviceCategory || selectedAppliance,
        serviceCategoryCharge: Number(serviceCategoryCharge) || 299,
      });

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully.',
        booking,
      });
    } else {
      const fallbackBooking = {
        _id: 'BK-' + Date.now().toString().slice(-6),
        customer: userId,
        appliance: selectedAppliance,
        issue: issue || 'General Repair & Maintenance',
        image,
        address,
        serviceDate: new Date(serviceDate),
        timeSlot,
        serviceCategory: serviceCategory || selectedAppliance,
        serviceCategoryCharge: Number(serviceCategoryCharge) || 299,
        bookingStatus: 'Pending',
        paymentStatus: 'Pending',
        createdAt: new Date(),
      };
      inMemoryBookings.unshift(fallbackBooking);

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully (dev mode).',
        booking: fallbackBooking,
      });
    }
  } catch (error) {
    console.error('Create Booking Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error.',
      error: error.message,
    });
  }
};

// Get user bookings
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
        (b) => b.customer.toString() === userId?.toString()
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
