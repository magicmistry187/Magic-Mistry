const mongoose = require('mongoose');
const Booking = require('../models/booking.model');
const { uploadImageToImageKit } = require('../config/imagekit');

// Create booking
exports.createBooking = async (req, res) => {
  console.log('Customer booking saved:', req.user.id);
  try {
    const {
      appliance,
      issue,
      address,
      serviceDate,
      timeSlot,
      serviceCategory,
      serviceCategoryCharge,
      longitude,
      latitude,
    } = req.body;

    const selectedAppliance = appliance || serviceCategory;

    console.log(
      "Value of longitude and latitude came from frontend:  ",
      longitude,
      ",",
      latitude,
    );

    //Here we have to first check latitude and longitude is present or not(maybe null) if not then send it to geocode api

    // Validate required fields
    if (!selectedAppliance || !address || !serviceDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields (appliance, address, serviceDate, timeSlot) must be provided.",
      });
    }

    // Upload image if provided
    let image = "";

    if (req.file) {
      try {
        const result = await uploadImageToImageKit(
          req.file.buffer,
          req.file.originalname || `booking-${Date.now()}.jpg`,
        );
        image = result.url;
      } catch (error) {
        console.error("Image upload failed:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to upload image.",
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      appliance: selectedAppliance,
      issue: issue || "General Repair & Maintenance",
      image,
      address,
      serviceDate,
      timeSlot,
      serviceCategory: serviceCategory || selectedAppliance,
      serviceCategoryCharge: Number(serviceCategoryCharge) || 299,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error('Create Booking Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error.',
      error: error.message,
    });
  }
};

//gets all the booking
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get My Bookings Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.',
      error: error.message,
    });
  }
};

// Get single booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get Booking Details Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details.',
      error: error.message,
    });
  }
};
// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you are not authorized to cancel it.',
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.',
      });
    }

    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled.',
      });
    }
    if (booking.bookingStatus === 'Accepted') {
      return res.status(400).json({
        success: false,
        message: 'Accepted bookings cannot be cancelled.',
      });
    }
    booking.bookingStatus = 'Cancelled';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking.',
      error: error.message,
    });
  }
};

exports.getBookingsToAdmin = async (req, res) =>{

  try{
    const bookings = await Booking.find()
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
      // console.log('Bookings fetched:', bookings);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      message: "All bookings fetched successfully.",
    });
  } catch (error) {
    console.error('Get All Bookings Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.',
      error: error.message,
    });
  }
}

exports.getBookingsToVendor = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const bookings = await Booking.find({
      $or: [
        { bookingStatus: "Pending" },
        { vendor: vendorId },
      ],
    })
      .populate("customer", "fullName email phoneNumber")
      .populate("vendor", "fullName email phoneNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      message: "Vendor bookings fetched successfully.",
    });
  } catch (error) {
    console.error("Get Bookings to Vendor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
      error: error.message,
    });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendorId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.bookingStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.bookingStatus}.`,
      });
    }

    booking.vendor = vendorId;
    booking.bookingStatus = 'Accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    const updated = await Booking.findById(bookingId)
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber');

    return res.status(200).json({
      success: true,
      message: 'Booking accepted successfully.',
      booking: updated,
    });
  } catch (error) {
    console.error('Accept Booking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept booking.',
      error: error.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendorId = req.user.id;
    const { status, serviceCharge, paymentMethod, paymentStatus } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      vendor: vendorId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you.',
      });
    }

    const allowedStatuses = ['In Progress', 'Completed', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: ${status}`,
      });
    }

    if (status) {
      booking.bookingStatus = status;
    }

    if (status === 'Completed') {
      booking.completedAt = new Date();
      booking.paymentStatus = paymentStatus || 'Paid';
    }

    if (serviceCharge !== undefined && serviceCharge !== null) {
      booking.serviceCharge = Number(serviceCharge);
    }
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    const updated = await Booking.findById(bookingId)
      .populate('customer', 'fullName email phoneNumber')
      .populate('vendor', 'fullName email phoneNumber');

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${booking.bookingStatus}.`,
      booking: updated,
    });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking status.',
      error: error.message,
    });
  }
};